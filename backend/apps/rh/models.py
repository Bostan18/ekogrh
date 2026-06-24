from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteModel, TimeStampedModel


class Employe(SoftDeleteModel):
    TYPE_CHOICES = [
        ("cdi", "CDI Permanent"),
        ("cdd", "CDD"),
        ("journalier", "Journalier"),
        ("moo", "MOO"),
        ("stagiaire", "Stagiaire"),
    ]
    STATUT_CHOICES = [("actif", "Actif"), ("inactif", "Inactif"), ("conge", "En congé")]

    code = models.CharField(max_length=20, unique=True)  # EMP-001
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    type_contrat = models.CharField(max_length=20, choices=TYPE_CHOICES)
    poste = models.CharField(max_length=150, blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    adresse = models.TextField(blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="actif")
    date_entree = models.DateField(null=True, blank=True)
    date_sortie = models.DateField(null=True, blank=True)
    salaire_mensuel = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    taux_journalier = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    numero_cnps = models.CharField(max_length=30, blank=True, verbose_name="N° CNPS")
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employe",
    )

    class Meta:
        verbose_name = "Employé"
        ordering = ["nom", "prenom"]

    def __str__(self):
        return f"{self.code} — {self.nom} {self.prenom}"

    @property
    def nom_complet(self):
        return f"{self.nom} {self.prenom}"

    @classmethod
    def generate_code(cls):
        last = cls.objects.order_by("-id").first()
        num = (last.id + 1) if last else 1
        return f"EMP-{num:03d}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        super().save(*args, **kwargs)


class PresenceJournaliere(TimeStampedModel):
    """Pointage journalier — crucial pour les journaliers."""

    employe = models.ForeignKey(
        Employe, on_delete=models.PROTECT, related_name="presences"
    )
    date = models.DateField()
    present = models.BooleanField(default=True)
    heures_travaillees = models.DecimalField(max_digits=4, decimal_places=1, default=8)
    montant_du = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    statut = models.CharField(
        max_length=20,
        choices=[
            ("brouillon", "Brouillon"),
            ("valide", "Validé"),
            ("cloture", "Clôturé"),
        ],
        default="brouillon",
    )
    # Références externes simplifiées (pas de FK vers d'autres apps)
    projet_ref = models.CharField(
        max_length=100, blank=True, verbose_name="Projet / Chantier"
    )
    site_ref = models.CharField(max_length=100, blank=True, verbose_name="Site / Lieu")
    notes = models.CharField(max_length=300, blank=True)
    paye_le = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Présence journalière"
        unique_together = ["employe", "date"]
        ordering = ["-date"]

    def save(self, *args, **kwargs):
        if self.employe.taux_journalier and self.present:
            self.montant_du = self.employe.taux_journalier
        super().save(*args, **kwargs)


class BulletinPaie(TimeStampedModel):
    """Bulletin mensuel pour les CDI/CDD."""

    STATUT_CHOICES = [("genere", "Généré"), ("paye", "Payé")]

    employe = models.ForeignKey(
        Employe, on_delete=models.PROTECT, related_name="bulletins"
    )
    mois = models.DateField(help_text="1er jour du mois concerné (ex: 2026-05-01)")
    brut = models.DecimalField(max_digits=12, decimal_places=2)
    net = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="genere")
    paye_le = models.DateField(null=True, blank=True)
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name = "Bulletin de paie"
        unique_together = ["employe", "mois"]
        ordering = ["-mois", "employe__nom"]

    def __str__(self):
        return f"{self.employe.code} — {self.mois.strftime('%Y-%m')}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self._generer_lignes()

    def _generer_lignes(self):
        from decimal import Decimal

        TAUX_CNPS_SALARIAL = Decimal("0.063")

        brut = self.brut
        cnps = (brut * TAUX_CNPS_SALARIAL).quantize(Decimal("0.01"))
        net = brut - cnps

        lignes_data = [
            ("salaire_base", "Salaire de base", brut, 10),
            ("retenue_cnps", "Cotisation CNPS (6,3%)", -cnps, 20),
            ("net_a_payer", "Net à payer", net, 90),
        ]
        for type_ligne, libelle, montant, ordre in lignes_data:
            LigneBulletin.objects.update_or_create(
                bulletin=self,
                type_ligne=type_ligne,
                defaults={"libelle": libelle, "montant": montant, "ordre": ordre},
            )

        BulletinPaie.objects.filter(pk=self.pk).update(net=net)


class LigneBulletin(TimeStampedModel):
    """Ligne de détail d'un bulletin de paie."""

    TYPE_CHOICES = [
        ("salaire_base", "Salaire de base"),
        ("prime", "Prime / indemnité"),
        ("retenue_cnps", "Cotisation CNPS (part salariale)"),
        ("retenue_its", "Impôt sur salaire (ITS)"),
        ("retenue_autre", "Autre retenue"),
        ("net_a_payer", "Net à payer"),
    ]

    bulletin = models.ForeignKey(
        BulletinPaie, on_delete=models.CASCADE, related_name="lignes"
    )
    type_ligne = models.CharField(max_length=20, choices=TYPE_CHOICES)
    libelle = models.CharField(max_length=200)
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    ordre = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "Ligne de bulletin"
        ordering = ["bulletin", "ordre"]
        unique_together = ["bulletin", "type_ligne"]

    def __str__(self):
        return f"{self.bulletin.employe.code} — {self.libelle} ({self.montant})"


class Conge(TimeStampedModel):
    """Demande de congé / absence avec workflow d'approbation."""

    TYPE_CHOICES = [
        ("conges_payes", "Congés payés"),
        ("maladie", "Maladie"),
        ("maternite", "Maternité / paternité"),
        ("sans_solde", "Sans solde"),
        ("special", "Spécial (mariage, deuil…)"),
    ]
    STATUT_CHOICES = [
        ("demande", "Demandé"),
        ("approuve", "Approuvé"),
        ("refuse", "Refusé"),
        ("annule", "Annulé"),
    ]

    employe = models.ForeignKey(
        Employe, on_delete=models.PROTECT, related_name="conges"
    )
    type_conge = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default="conges_payes"
    )
    date_debut = models.DateField()
    date_fin = models.DateField()
    motif = models.CharField(max_length=300, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="demande")
    approuve_par = models.CharField(max_length=200, blank=True)
    approuve_le = models.DateField(null=True, blank=True)
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name = "Congé"
        ordering = ["-date_debut"]

    def __str__(self):
        return f"{self.employe.code} — {self.get_type_conge_display()} {self.date_debut}→{self.date_fin}"

    @property
    def nb_jours(self):
        if not self.date_debut or not self.date_fin:
            return 0
        return max(0, (self.date_fin - self.date_debut).days + 1)


class MissionMoo(TimeStampedModel):
    """Mission ponctuelle d'un employé MOO, payée au forfait."""

    employe = models.ForeignKey(
        Employe,
        on_delete=models.PROTECT,
        related_name="missions_moo",
        limit_choices_to={"type_contrat": "moo"},
    )
    projet_ref = models.CharField(
        max_length=100, blank=True, verbose_name="Projet / Chantier"
    )
    description = models.CharField(max_length=300)
    date_debut = models.DateField()
    date_fin = models.DateField()
    montant_forfaitaire = models.DecimalField(max_digits=12, decimal_places=2)
    paye_le = models.DateField(null=True, blank=True)
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name = "Mission MOO"
        ordering = ["-date_debut"]

    def __str__(self):
        return f"{self.employe.code} — {self.description[:30]}"


class Paiement(TimeStampedModel):
    """Trace chaque règlement effectué à un employé."""

    MODE_CHOICES = [
        ("especes", "Espèces"),
        ("virement", "Virement"),
        ("cheque", "Chèque"),
        ("mobile", "Mobile Money"),
    ]

    employe = models.ForeignKey(
        Employe, on_delete=models.PROTECT, related_name="paiements"
    )
    date = models.DateField()
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default="especes")
    reference = models.CharField(
        max_length=100, blank=True, help_text="N° chèque, référence virement…"
    )
    bulletin = models.ForeignKey(
        BulletinPaie,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="paiements",
    )
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name = "Paiement"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employe.code} — {self.montant} F ({self.date})"


class Competence(SoftDeleteModel):
    """Référentiel des compétences."""

    CATEGORIE_CHOICES = [
        ("technique", "Technique BTP"),
        ("agricole", "Agricole / pépinière"),
        ("conduite_engin", "Conduite d'engin"),
        ("management", "Management"),
        ("administratif", "Administratif"),
        ("autre", "Autre"),
    ]

    code = models.CharField(max_length=30, unique=True)
    libelle = models.CharField(max_length=150)
    categorie = models.CharField(
        max_length=20, choices=CATEGORIE_CHOICES, default="technique"
    )
    niveau_max = models.PositiveSmallIntegerField(default=5)
    actif = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Compétence"
        ordering = ["categorie", "libelle"]

    def __str__(self):
        return self.libelle


class CompetenceEmploye(TimeStampedModel):
    """Compétence détenue par un employé avec niveau."""

    employe = models.ForeignKey(
        Employe, on_delete=models.CASCADE, related_name="competences"
    )
    competence = models.ForeignKey(
        Competence, on_delete=models.PROTECT, related_name="acquisitions"
    )
    niveau = models.PositiveSmallIntegerField(default=1)
    date_acquisition = models.DateField(null=True, blank=True)
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name = "Compétence employé"
        unique_together = ["employe", "competence"]
        ordering = ["competence__libelle"]

    def __str__(self):
        return f"{self.employe.code} — {self.competence.libelle} ({self.niveau})"


class Certification(TimeStampedModel):
    """Certification, diplôme ou habilitation rattachée à un employé."""

    employe = models.ForeignKey(
        Employe, on_delete=models.CASCADE, related_name="certifications"
    )
    libelle = models.CharField(max_length=200)
    organisme = models.CharField(max_length=200, blank=True)
    numero = models.CharField(max_length=100, blank=True)
    date_obtention = models.DateField()
    date_expiration = models.DateField(
        null=True, blank=True, help_text="Vide = sans expiration."
    )
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name = "Certification"
        ordering = ["-date_obtention"]

    def __str__(self):
        return f"{self.employe.code} — {self.libelle}"

    @property
    def statut(self):
        if not self.date_expiration:
            return "sans_expiration"
        from datetime import date, timedelta

        today = date.today()
        if self.date_expiration < today:
            return "expiree"
        if self.date_expiration <= today + timedelta(days=60):
            return "bientot_expiree"
        return "valide"


class HistoriqueContrat(TimeStampedModel):
    """Trace l'évolution contractuelle d'un employé."""

    employe = models.ForeignKey(
        Employe, on_delete=models.CASCADE, related_name="historique_contrats"
    )
    type_contrat = models.CharField(max_length=20, choices=Employe.TYPE_CHOICES)
    poste = models.CharField(max_length=150, blank=True)
    date_debut = models.DateField()
    date_fin = models.DateField(
        null=True, blank=True, help_text="Vide = contrat en cours."
    )
    salaire_mensuel = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    taux_journalier = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    motif_fin = models.CharField(max_length=200, blank=True)
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name = "Historique contrat"
        ordering = ["-date_debut"]

    def __str__(self):
        return f"{self.employe.code} — {self.type_contrat} ({self.date_debut})"

    @property
    def est_en_cours(self):
        return self.date_fin is None

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
    CATEGORIE_CHOICES = [
        ("cadre_iv", "Cadre IV"),
        ("cadre_iii", "Cadre III"),
        ("cadre_ii", "Cadre II"),
        ("cadre_i", "Cadre I"),
        ("technicien_ii", "Technicien II"),
        ("technicien_i", "Technicien I"),
        ("support_ii", "Support II"),
        ("support_i", "Support I"),
        ("ouvrier", "Ouvrier"),
    ]
    STATUT_MARITAL_CHOICES = [
        ("celibataire", "Célibataire"),
        ("marie", "Marié(e)"),
        ("divorce", "Divorcé(e)"),
    ]

    code = models.CharField(max_length=20, unique=True, blank=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    type_contrat = models.CharField(max_length=20, choices=TYPE_CHOICES)
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, blank=True)
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
    nb_enfants = models.PositiveSmallIntegerField(
        default=0, help_text="Pour calcul IGR"
    )
    statut_marital = models.CharField(
        max_length=20, choices=STATUT_MARITAL_CHOICES, default="celibataire"
    )
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

    def parts_fiscales(self):
        """Calcule le nombre de parts pour l'IGR."""
        parts = 2  # base célibataire
        if self.statut_marital == "marie":
            parts += 1
        parts += self.nb_enfants
        return max(1, parts)


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

        from .paie import calculer_bulletin

        # Récupérer la configuration de retenues pour cette catégorie
        try:
            config = RetenueCategorie.objects.get(
                type_contrat=self.employe.type_contrat,
                actif=True,
            )
        except RetenueCategorie.DoesNotExist:
            config = None

        # Calcul complet conforme CI
        resultat = calculer_bulletin(
            employe=self.employe,
            heures_sup=0,
            prime_rendement=0,
            indemnite_transport=0,
            config=config,
        )

        # Recalculer le brut à partir du résultat (peut différer du brut stocké)
        brut = Decimal(str(resultat.brut))
        net = Decimal(str(resultat.net))
        total_retenues = Decimal(str(resultat.total_retenues))

        ordre = 10
        lignes_data = []

        # ── Section I — RÉMUNÉRATION ──
        sb = float(self.employe.salaire_mensuel or 0)
        from datetime import date

        annees = 0
        if self.employe.date_entree:
            annees = (date.today() - self.employe.date_entree).days // 365
        prime_anc = round(sb * annees * 0.02)
        indemnite_log = round(sb * 0.30)
        alloc_fam = 3500 * (self.employe.nb_enfants or 0)

        lignes_data.append(
            ("salaire_base", "Salaire de base catégoriel", Decimal(str(sb)), ordre)
        )
        ordre += 10
        if prime_anc > 0:
            lignes_data.append(
                (
                    "prime",
                    f"Prime d'ancienneté ({annees} an(s) × 2%)",
                    Decimal(str(prime_anc)),
                    ordre,
                )
            )
            ordre += 10
        if indemnite_log > 0:
            lignes_data.append(
                (
                    "prime",
                    "Indemnité de logement (30%)",
                    Decimal(str(indemnite_log)),
                    ordre,
                )
            )
            ordre += 10
        if alloc_fam > 0:
            lignes_data.append(
                (
                    "prime",
                    f"Allocations familiales ({self.employe.nb_enfants} enf.)",
                    Decimal(str(alloc_fam)),
                    ordre,
                )
            )
            ordre += 10

        # Total brut
        lignes_data.append(("salaire_base", "TOTAL BRUT", brut, ordre))
        ordre += 10

        # ── Section II — CNPS ──
        lignes_data.append(
            (
                "retenue_cnps",
                "CNPS retraite salarié (6,3%)",
                Decimal(str(-resultat.cnps_salarie)),
                ordre,
            )
        )
        ordre += 10

        # ── Section III — ITS ──
        lignes_data.append(
            (
                "retenue_its",
                "IS — Impôt sur Salaires (1,5%)",
                Decimal(str(-resultat.is_impot)),
                ordre,
            )
        )
        ordre += 10
        lignes_data.append(
            (
                "retenue_its",
                "CN — Contribution Nationale",
                Decimal(str(-resultat.cn)),
                ordre,
            )
        )
        ordre += 10
        lignes_data.append(
            (
                "retenue_its",
                f"IGR — Impôt Général sur le Revenu",
                Decimal(str(-resultat.igr)),
                ordre,
            )
        )
        ordre += 10

        # Total retenues
        lignes_data.append(("retenue_autre", "TOTAL RETENUES", -total_retenues, ordre))
        ordre += 10

        # Net à payer
        lignes_data.append(("net_a_payer", "NET À PAYER", net, 90))

        # ── Info employeur (non déduit) ──
        lignes_data.append(
            (
                "prime",
                "CNPS patronale retraite [info]",
                Decimal(str(resultat.cnps_pat_retr)),
                95,
            )
        )
        lignes_data.append(
            (
                "prime",
                "CNPS PF + Maternité [info]",
                Decimal(str(resultat.cnps_pat_pf)),
                96,
            )
        )
        lignes_data.append(
            ("prime", "CNPS AT/MP [info]", Decimal(str(resultat.cnps_pat_at)), 97)
        )
        lignes_data.append(
            (
                "prime",
                "COÛT TOTAL EMPLOYEUR [info]",
                Decimal(str(resultat.cout_employeur)),
                98,
            )
        )

        for type_ligne, libelle, montant, o in lignes_data:
            LigneBulletin.objects.update_or_create(
                bulletin=self,
                type_ligne=type_ligne,
                defaults={"libelle": libelle, "montant": montant, "ordre": o},
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
        ("orange", "Orange Money"),
        ("mtn", "MTN Mobile Money"),
        ("moov", "Moov Money"),
        ("virement", "Virement bancaire"),
        ("cheque", "Chèque"),
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


class RetenueCategorie(TimeStampedModel):
    """Configuration des retenues applicables par catégorie d'employé.

    Conforme Code du Travail CI (Loi n°2015-532) et CNPS 2025.
    """

    type_contrat = models.CharField(
        max_length=20,
        choices=Employe.TYPE_CHOICES,
        unique=True,
        verbose_name="Catégorie d'employé",
    )
    # CNPS — part salariale
    taux_cnps_salarial = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.0630,
        help_text="CNPS retraite salarié (ex: 0.0630 pour 6,3%)",
    )
    plafond_cnps = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=3_375_000,
        help_text="Plafond CNPS retraite = 45 × SMIG",
    )
    # CNPS — parts patronales (info employeur, non déduites du net)
    taux_cnps_patronal_retraite = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.0770,
        help_text="CNPS retraite employeur 7,7%",
    )
    taux_cnps_patronal_pf = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.0575,
        help_text="Prestations familiales + Maternité 5,75%",
    )
    taux_cnps_patronal_at = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.0200,
        help_text="Accidents du travail 2%",
    )
    plafond_pf_at = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=70_000,
        help_text="Plafond PF + AT",
    )
    # ITS — barème 2024
    taux_is = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.0150,
        help_text="Impôt sur Salaires IS 1,5%",
    )
    taux_frais_pro = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.2000,
        help_text="Déduction forfaitaire frais pro 20%",
    )
    # CN progressif (stocké en JSON via champ texte)
    bareme_cn = models.JSONField(
        default=list,
        help_text='Barème CN: [{"seuil": 300000, "taux": 0.015, "fixe": 0}, ...]',
    )
    taux_igr = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.1000,
        help_text="Taux IGR 10% appliqué au quotient familial",
    )
    abattement_igr = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=15_000,
        help_text="Abattement IGR mensuel",
    )
    actif = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Retenue par catégorie"
        verbose_name_plural = "Retenues par catégorie"
        ordering = ["type_contrat"]

    def __str__(self):
        return f"{self.get_type_contrat_display()} — CNPS {self.taux_cnps_salarial} | IS {self.taux_is}"


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

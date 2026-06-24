from apps.core.models import TimeStampedModel
from django.db import models


class Site(TimeStampedModel):
    TYPE_CHOICES = [
        ("chantier", "Chantier"),
        ("parcelle", "Parcelle"),
        ("pepiniere", "Pépinière"),
        ("espace_vert", "Espace vert"),
        ("depot", "Dépôt"),
        ("autre", "Autre"),
    ]

    code = models.CharField(max_length=20, unique=True, blank=True)
    nom = models.CharField(max_length=200)
    type_site = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default="chantier"
    )
    localisation = models.CharField(max_length=300, blank=True)
    responsable = models.ForeignKey(
        "rh.Employe",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sites_diriges",
        limit_choices_to={"statut": "actif"},
    )
    actif = models.BooleanField(default=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.nom}"

    @classmethod
    def generate_code(cls):
        last = cls.objects.order_by("-id").first()
        num = (last.id + 1) if last else 1
        return f"SIT-{num:03d}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        super().save(*args, **kwargs)


class TacheCatalogue(TimeStampedModel):
    TYPE_OBJECTIF_CHOICES = [
        ("surface", "Surface (m²)"),
        ("volume", "Volume"),
        ("unite", "Unité"),
        ("lineaire", "Linéaire (ml)"),
        ("forfait", "Forfait"),
    ]

    code = models.CharField(max_length=20, unique=True, blank=True)
    libelle = models.CharField(max_length=200)
    type_objectif = models.CharField(max_length=20, choices=TYPE_OBJECTIF_CHOICES)
    unite_label = models.CharField(max_length=50)
    tarif_reference = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    actif = models.BooleanField(default=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.libelle}"

    @classmethod
    def generate_code(cls):
        last = cls.objects.order_by("-id").first()
        num = (last.id + 1) if last else 1
        return f"TAC-{num:03d}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        super().save(*args, **kwargs)


class LogTravail(TimeStampedModel):
    employe = models.ForeignKey(
        "rh.Employe",
        on_delete=models.CASCADE,
        related_name="logs_travail",
    )
    date = models.DateField()
    site = models.ForeignKey(
        Site, on_delete=models.CASCADE, related_name="logs_travail"
    )
    tache = models.ForeignKey(
        TacheCatalogue, on_delete=models.CASCADE, related_name="logs_travail"
    )
    objectif_realise = models.DecimalField(max_digits=10, decimal_places=2)
    duree_heures = models.DecimalField(max_digits=4, decimal_places=1, default=8.0)
    rendement = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    prime = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paye_le = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-date", "employe__nom"]
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["employe", "date"]),
        ]

    def save(self, *args, **kwargs):
        if self.duree_heures and float(self.duree_heures) > 0:
            self.rendement = float(self.objectif_realise) / float(self.duree_heures)
        else:
            self.rendement = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employe} — {self.tache} — {self.date}"

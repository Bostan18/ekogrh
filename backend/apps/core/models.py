from django.db import models, transaction


class TimeStampedModel(models.Model):
    """Modèle de base avec timestamps automatiques."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteModel(TimeStampedModel):
    """Modèle avec suppression logique."""
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class CodeCounter(models.Model):
    """Compteur atomique pour la génération de codes séquentiels."""

    prefix = models.CharField(max_length=10, unique=True)
    counter = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Compteur de code"

    def __str__(self):
        return f"{self.prefix}-{self.counter:03d}"

    @classmethod
    def next_code(cls, prefix: str, fmt: str = "{prefix}-{num:03d}") -> str:
        """Génère un code séquentiel de façon atomique (thread-safe).

        Utilise select_for_update pour verrouiller la ligne compteur
        dans la transaction, garantissant l'unicité même en concurrence.
        """
        with transaction.atomic():
            counter, _ = cls.objects.select_for_update().get_or_create(
                prefix=prefix,
                defaults={"counter": 0},
            )
            counter.counter += 1
            counter.save(update_fields=["counter"])
            return fmt.format(prefix=prefix, num=counter.counter)

import re

from django.core.management.base import BaseCommand

from apps.core.models import CodeCounter
from apps.operations.models import Site, TacheCatalogue
from apps.rh.models import Employe


class Command(BaseCommand):
    help = "Initialise les compteurs CodeCounter à partir des codes existants"

    PREFIXES = [
        ("EMP", Employe, "code"),
        ("SIT", Site, "code"),
        ("TAC", TacheCatalogue, "code"),
    ]

    def handle(self, *args, **options):
        for prefix, model, field in self.PREFIXES:
            max_num = 0
            for obj in model.objects.all():
                code = getattr(obj, field)
                match = re.search(r"(\d+)$", code)
                if match:
                    max_num = max(max_num, int(match.group(1)))

            counter, created = CodeCounter.objects.get_or_create(prefix=prefix)
            if created or counter.counter < max_num:
                counter.counter = max_num
                counter.save(update_fields=["counter"])
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{prefix}: compteur initialisé à {max_num}"
                    )
                )
            else:
                self.stdout.write(f"{prefix}: déjà à {counter.counter}")

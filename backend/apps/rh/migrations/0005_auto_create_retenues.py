"""Data migration : crée les RetenueCategorie par défaut pour chaque type de contrat."""

from django.db import migrations


def create_default_retenues(apps, schema_editor):
    RetenueCategorie = apps.get_model("rh", "RetenueCategorie")
    bareme_cn = [
        {"seuil": 300_000, "taux": 0.015, "fixe": 0},
        {"seuil": 600_000, "taux": 0.03, "fixe": 4_500},
        {"seuil": float("inf"), "taux": 0.05, "fixe": 13_500},
    ]

    defaults = {
        "cdi": {"taux_cnps_salarial": 0.0630},
        "cdd": {"taux_cnps_salarial": 0.0630},
        "stagiaire": {"taux_cnps_salarial": 0},
        "journalier": {"taux_cnps_salarial": 0},
        "moo": {"taux_cnps_salarial": 0},
    }

    for type_contrat, fields in defaults.items():
        RetenueCategorie.objects.get_or_create(
            type_contrat=type_contrat,
            defaults={**fields, "bareme_cn": bareme_cn},
        )


def remove_default_retenues(apps, schema_editor):
    RetenueCategorie = apps.get_model("rh", "RetenueCategorie")
    RetenueCategorie.objects.filter(
        type_contrat__in=["cdi", "cdd", "stagiaire", "journalier", "moo"]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("rh", "0004_retenuecategorie_employe_categorie_and_more"),
    ]

    operations = [
        migrations.RunPython(create_default_retenues, remove_default_retenues),
    ]

from rest_framework import serializers

from .models import LogTravail, Site, TacheCatalogue


class SiteSerializer(serializers.ModelSerializer):
    type_site_display = serializers.CharField(
        source="get_type_site_display", read_only=True
    )
    responsable_nom = serializers.CharField(
        source="responsable.nom_complet", read_only=True
    )

    class Meta:
        model = Site
        fields = [
            "id",
            "code",
            "nom",
            "type_site",
            "type_site_display",
            "localisation",
            "responsable",
            "responsable_nom",
            "actif",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TacheCatalogueSerializer(serializers.ModelSerializer):
    type_objectif_display = serializers.CharField(
        source="get_type_objectif_display", read_only=True
    )

    class Meta:
        model = TacheCatalogue
        fields = [
            "id",
            "code",
            "libelle",
            "type_objectif",
            "type_objectif_display",
            "unite_label",
            "tarif_reference",
            "seuil",
            "actif",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LogTravailSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)
    employe_code = serializers.CharField(source="employe.code", read_only=True)
    site_nom = serializers.CharField(source="site.nom", read_only=True)
    tache_libelle = serializers.CharField(source="tache.libelle", read_only=True)
    tache_unite = serializers.CharField(source="tache.unite_label", read_only=True)

    class Meta:
        model = LogTravail
        fields = [
            "id",
            "employe",
            "employe_nom",
            "employe_code",
            "date",
            "site",
            "site_nom",
            "tache",
            "tache_libelle",
            "tache_unite",
            "objectif_realise",
            "duree_heures",
            "rendement",
            "prime",
            "paye_le",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "rendement", "created_at", "updated_at"]

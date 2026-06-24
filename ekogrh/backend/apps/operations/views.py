from rest_framework import viewsets

from .models import LogTravail, Site, TacheCatalogue
from .serializers import LogTravailSerializer, SiteSerializer, TacheCatalogueSerializer


class SiteViewSet(viewsets.ModelViewSet):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    filterset_fields = ["type_site", "actif"]
    search_fields = ["code", "nom"]


class TacheCatalogueViewSet(viewsets.ModelViewSet):
    queryset = TacheCatalogue.objects.all()
    serializer_class = TacheCatalogueSerializer
    filterset_fields = ["type_objectif", "actif"]
    search_fields = ["code", "libelle"]


class LogTravailViewSet(viewsets.ModelViewSet):
    queryset = LogTravail.objects.select_related("employe", "site", "tache")
    serializer_class = LogTravailSerializer
    filterset_fields = ["employe", "site", "tache", "date"]
    search_fields = ["employe__nom", "site__nom", "tache__libelle", "notes"]

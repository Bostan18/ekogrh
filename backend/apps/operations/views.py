"""Vues du module Opérations : sites, tâches, logs de travail."""

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .exports import _get_payroll_data, build_payroll_excel
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

    @action(detail=False, methods=["get"])
    def task_payroll(self, request):
        """Paie à la tâche : regroupé par employé × tâche avec montant calculé."""
        site_id = request.query_params.get("site")
        mois = int(request.query_params.get("mois", timezone.now().month))
        annee = int(request.query_params.get("annee", timezone.now().year))

        logs = LogTravail.objects.select_related("employe", "tache", "site")
        if site_id:
            logs = logs.filter(site_id=site_id)
        logs = logs.filter(date__month=mois, date__year=annee)

        results, total = _get_payroll_data(logs)
        site_nom = logs[0].site.nom if site_id and results else None

        return Response(
            {
                "mois": mois,
                "annee": annee,
                "site_nom": site_nom,
                "lignes": results,
                "total": total,
            }
        )

    @action(detail=False, methods=["get"])
    def export_task_payroll(self, request):
        """Export Excel de la paie à la tâche."""
        site_id = request.query_params.get("site")
        mois = int(request.query_params.get("mois", timezone.now().month))
        annee = int(request.query_params.get("annee", timezone.now().year))

        logs = LogTravail.objects.select_related("employe", "tache", "site")
        if site_id:
            logs = logs.filter(site_id=site_id)
        logs = logs.filter(date__month=mois, date__year=annee)

        results, total = _get_payroll_data(logs)
        site_nom = logs[0].site.nom if site_id and results else None
        wb = build_payroll_excel(results, total, site_nom or "Tous", mois, annee)

        safe_name = (site_nom or "tous").replace(" ", "_")
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = (
            f'attachment; filename="paie_tache_{safe_name}_{mois}_{annee}.xlsx"'
        )
        wb.save(response)
        return response

    @action(detail=True, methods=["post"])
    def marquer_paye(self, request, pk=None):
        """Marque un log de travail comme payé et crée un Paiement."""
        log = self.get_object()
        if log.paye_le:
            return Response({"error": "Déjà payé"}, status=400)

        log.paye_le = request.data.get("paye_le") or timezone.now().date()
        log.save()

        # Créer un paiement
        from apps.rh.models import Paiement

        montant = max(
            0, float(log.objectif_realise) - float(log.tache.seuil or 0)
        ) * float(log.tache.tarif_reference or 0) + float(log.prime or 0)
        Paiement.objects.create(
            employe=log.employe,
            date=log.paye_le,
            montant=montant,
            mode=log.mode_paiement,
            notes=f"Log #{log.id} — {log.tache.libelle}",
        )

        return Response(
            {"status": "payé", "paye_le": str(log.paye_le), "montant": montant}
        )

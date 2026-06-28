"""Vues de pointage : présences journalières et hebdomadaires."""

from datetime import timedelta

from django.db import models
from django.db.models import Count, F, Q, Sum
from django.db.models.functions import Concat
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..rh.exports import (
    bordereau_journaliers_excel,
    paie_excel,
    presences_excel,
)
from ..rh.models import Employe, PresenceJournaliere
from ..rh.serializers import PresenceJournaliereSerializer


class PresenceJournaliereViewSet(viewsets.ModelViewSet):
    queryset = PresenceJournaliere.objects.select_related("employe")
    serializer_class = PresenceJournaliereSerializer
    filterset_fields = ["employe", "date", "present", "statut"]
    search_fields = ["employe__nom", "employe__prenom", "projet_ref", "site_ref"]

    @action(detail=False, methods=["get"])
    def feuille_journee(self, request):
        """Retourne tous les journaliers actifs avec leur présence pour une date."""
        date = request.query_params.get("date", str(timezone.now().date()))
        journaliers = Employe.objects.filter(
            type_contrat="journalier", statut="actif", is_deleted=False
        ).order_by("nom", "prenom")
        presences = {
            p.employe_id: p for p in PresenceJournaliere.objects.filter(date=date)
        }
        result = []
        for emp in journaliers:
            p = presences.get(emp.id)
            result.append(
                {
                    "employe_id": emp.id,
                    "employe_code": emp.code,
                    "employe_nom": emp.nom_complet,
                    "taux_journalier": str(emp.taux_journalier or 0),
                    "presence_id": p.id if p else None,
                    "present": p.present if p else None,
                    "heures_travaillees": str(p.heures_travaillees) if p else "8.0",
                    "montant_du": str(p.montant_du) if p else "0",
                    "projet_ref": p.projet_ref if p else "",
                    "site_ref": p.site_ref if p else "",
                    "statut": p.statut if p else "brouillon",
                    "notes": p.notes if p else "",
                }
            )
        return Response({"date": date, "presences": result})

    @action(detail=False, methods=["post"])
    def saisie_journee(self, request):
        """Saisie en masse des présences pour une journée."""
        date = request.data.get("date")
        presences_data = request.data.get("presences", [])
        if not date:
            return Response(
                {"error": "date requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = []
        for p in presences_data:
            defaults = {
                "present": p.get("present", True),
                "heures_travaillees": p.get("heures_travaillees", 8),
                "projet_ref": p.get("projet_ref", ""),
                "site_ref": p.get("site_ref", ""),
                "notes": p.get("notes", ""),
            }
            obj, _ = PresenceJournaliere.objects.update_or_create(
                employe_id=p["employe_id"],
                date=date,
                defaults=defaults,
            )
            results.append(PresenceJournaliereSerializer(obj).data)

        return Response(results, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def feuille_semaine(self, request):
        """Retourne tous les journaliers actifs avec leurs présences pour une semaine."""
        semaine = request.query_params.get("semaine")
        if semaine:
            lundi = timezone.datetime.strptime(semaine, "%Y-%m-%d").date()
        else:
            today = timezone.now().date()
            lundi = today - timedelta(days=today.weekday())

        jours = [lundi + timedelta(days=i) for i in range(7)]

        journaliers = Employe.objects.filter(
            type_contrat="journalier", statut="actif", is_deleted=False
        ).order_by("nom", "prenom")

        presences = PresenceJournaliere.objects.filter(
            employe__type_contrat="journalier",
            date__range=[jours[0], jours[-1]],
        ).select_related("employe")

        presences_map = {}
        for p in presences:
            presences_map[(p.employe_id, str(p.date))] = p

        lignes = []
        for emp in journaliers:
            jours_data = []
            total_montant = 0
            for jour in jours:
                p = presences_map.get((emp.id, str(jour)))
                montant = float(p.montant_du) if p else 0
                total_montant += montant
                jours_data.append(
                    {
                        "date": str(jour),
                        "presence_id": p.id if p else None,
                        "present": p.present if p else None,
                        "heures_travaillees": str(p.heures_travaillees) if p else "8.0",
                        "montant_du": str(p.montant_du) if p else "0",
                        "projet_ref": p.projet_ref if p else "",
                        "notes": p.notes if p else "",
                    }
                )
            lignes.append(
                {
                    "employe_id": emp.id,
                    "employe_code": emp.code,
                    "employe_nom": emp.nom_complet,
                    "taux_journalier": str(emp.taux_journalier or 0),
                    "total_montant": str(total_montant),
                    "jours": jours_data,
                }
            )

        return Response(
            {
                "semaine_debut": str(lundi),
                "jours": [str(j) for j in jours],
                "lignes": lignes,
            }
        )

    @action(detail=False, methods=["post"])
    def saisie_semaine(self, request):
        """Saisie en masse des présences pour une semaine."""
        lignes = request.data.get("lignes", [])
        if not lignes:
            return Response(
                {"error": "lignes requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = []
        for ligne in lignes:
            employe_id = ligne.get("employe_id")
            site_ref = ligne.get("site_ref", "")
            for jour in ligne.get("jours", []):
                date = jour.get("date")
                present = jour.get("present")
                if date is None or present is None:
                    continue
                defaults = {
                    "present": present,
                    "heures_travaillees": jour.get("heures_travaillees", 8),
                    "projet_ref": jour.get("projet_ref", ""),
                    "site_ref": site_ref,
                    "notes": jour.get("notes", ""),
                }
                obj, _ = PresenceJournaliere.objects.update_or_create(
                    employe_id=employe_id,
                    date=date,
                    defaults=defaults,
                )
                results.append(PresenceJournaliereSerializer(obj).data)

        return Response(results, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def marquer_payees(self, request):
        """Marque un lot de présences comme payées."""
        ids = request.data.get("ids", [])
        date_paiement = request.data.get("paye_le") or str(timezone.now().date())
        if not ids:
            return Response({"error": "ids requis"}, status=status.HTTP_400_BAD_REQUEST)

        non_valides = (
            PresenceJournaliere.objects.filter(id__in=ids)
            .exclude(statut="valide")
            .count()
        )
        if non_valides > 0:
            return Response(
                {
                    "error": f"{non_valides} présence(s) non validée(s) — le paiement nécessite le statut 'Validé'."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        nb = PresenceJournaliere.objects.filter(id__in=ids).update(
            paye_le=date_paiement
        )
        return Response({"updated": nb, "paye_le": date_paiement})

    @action(detail=False, methods=["post"])
    def valider(self, request):
        """Valide un lot de présences (brouillon → valide)."""
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"error": "ids requis"}, status=status.HTTP_400_BAD_REQUEST)
        nb = PresenceJournaliere.objects.filter(id__in=ids, statut="brouillon").update(
            statut="valide"
        )
        return Response({"validees": nb})

    @action(detail=False, methods=["post"])
    def cloturer(self, request):
        """Clôture toutes les présences d'un mois donné."""
        mois = int(request.data.get("mois", timezone.now().month))
        annee = int(request.data.get("annee", timezone.now().year))
        nb = (
            PresenceJournaliere.objects.filter(date__month=mois, date__year=annee)
            .exclude(statut="cloture")
            .update(statut="cloture")
        )
        return Response({"cloturees": nb, "mois": mois, "annee": annee})

    @action(detail=False, methods=["get"])
    def anomalies(self, request):
        """Détecte les anomalies de pointage."""
        today = timezone.now().date()
        alertes = []

        zero_heures = PresenceJournaliere.objects.filter(
            date=today, present=True, heures_travaillees=0
        ).select_related("employe")
        for p in zero_heures:
            alertes.append(
                {
                    "type": "zero_heures",
                    "message": f"{p.employe.nom_complet} pointé présent avec 0h",
                    "employe_id": p.employe_id,
                    "employe_nom": p.employe.nom_complet,
                    "date": str(p.date),
                }
            )

        seuil = today - timedelta(days=14)
        journaliers_actifs = Employe.objects.filter(
            type_contrat="journalier", statut="actif", is_deleted=False
        )
        derniers_pointages = {}
        for p in PresenceJournaliere.objects.filter(
            employe__in=journaliers_actifs, date__gte=seuil
        ).order_by("employe", "-date"):
            if p.employe_id not in derniers_pointages:
                derniers_pointages[p.employe_id] = p.date

        for emp in journaliers_actifs:
            dernier = derniers_pointages.get(emp.id)
            if not dernier or dernier < seuil:
                alertes.append(
                    {
                        "type": "absence_prolongee",
                        "message": f"{emp.nom_complet} aucun pointage depuis {dernier or 'jamais'}",
                        "employe_id": emp.id,
                        "employe_nom": emp.nom_complet,
                        "dernier_pointage": str(dernier) if dernier else None,
                    }
                )

        lundi = today - timedelta(days=today.weekday())
        dimanche = lundi + timedelta(days=6)
        compteurs_semaine = (
            PresenceJournaliere.objects.filter(
                date__range=[lundi, dimanche], present=True
            )
            .values("employe")
            .annotate(nb=Count("id"))
            .filter(nb__gt=6)
        )
        employes_ids = [c["employe"] for c in compteurs_semaine]
        employes_map = {
            e.id: e.nom_complet for e in Employe.objects.filter(id__in=employes_ids)
        }
        for c in compteurs_semaine:
            alertes.append(
                {
                    "type": "seuil_hebdo",
                    "message": f"{employes_map.get(c['employe'], '?')} : {c['nb']} jours pointés cette semaine",
                    "employe_id": c["employe"],
                    "employe_nom": employes_map.get(c["employe"], "?"),
                    "nb_jours": c["nb"],
                }
            )

        return Response({"alertes": alertes, "total": len(alertes)})

    @action(detail=False, methods=["get"])
    def restant_a_payer(self, request):
        """Récap par employé journalier : total dû, total payé, restant."""

        recap = list(
            PresenceJournaliere.objects.filter(
                employe__type_contrat="journalier",
                present=True,
            )
            .values("employe_id", "employe__code", "employe__nom", "employe__prenom")
            .annotate(
                employe_nom=Concat(
                    F("employe__nom"), models.Value(" "), F("employe__prenom")
                ),
                total_du=Sum("montant_du"),
                total_paye=Sum("montant_du", filter=Q(paye_le__isnull=False)),
                restant=Sum("montant_du", filter=Q(paye_le__isnull=True)),
                jours_non_payes=Count("id", filter=Q(paye_le__isnull=True)),
            )
            .order_by("employe__nom")
        )

        return Response(recap)

    @action(detail=False, methods=["get"])
    def export_paie(self, request):
        """Export Excel de la feuille de paie pour un mois donné."""
        mois = int(request.query_params.get("mois", timezone.now().month))
        annee = int(request.query_params.get("annee", timezone.now().year))

        employes = Employe.objects.filter(statut="actif", is_deleted=False).order_by(
            "type_contrat", "nom"
        )
        presences = PresenceJournaliere.objects.filter(
            date__month=mois, date__year=annee
        ).select_related("employe")

        presences_par_employe = {}
        for p in presences:
            presences_par_employe.setdefault(p.employe_id, []).append(p)

        buffer = paie_excel(employes, presences_par_employe, mois, annee)
        response = HttpResponse(
            buffer,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = (
            f'attachment; filename="paie_{mois}_{annee}.xlsx"'
        )
        return response

    @action(detail=False, methods=["get"])
    def export_presences(self, request):
        """Export Excel détaillé des présences pour un mois."""
        mois = int(request.query_params.get("mois", timezone.now().month))
        annee = int(request.query_params.get("annee", timezone.now().year))

        presences = (
            PresenceJournaliere.objects.filter(date__month=mois, date__year=annee)
            .select_related("employe")
            .order_by("date", "employe__nom")
        )

        buffer = presences_excel(presences, mois, annee)
        response = HttpResponse(
            buffer,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = (
            f'attachment; filename="presences_{mois}_{annee}.xlsx"'
        )
        return response

    @action(detail=False, methods=["get"])
    def export_bordereau(self, request):
        """Export Excel d'un bordereau de paiement pour un journalier."""
        employe_id = request.query_params.get("employe_id")
        date_paiement = request.query_params.get("paye_le") or str(
            timezone.now().date()
        )
        if not employe_id:
            return Response(
                {"error": "employe_id requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        presences = (
            PresenceJournaliere.objects.filter(
                employe_id=employe_id, present=True, paye_le__isnull=False
            )
            .select_related("employe")
            .order_by("date")
        )

        if not presences.exists():
            return Response(
                {"error": "Aucune présence payée trouvée pour cet employé."},
                status=status.HTTP_404_NOT_FOUND,
            )

        employe_nom = presences[0].employe.nom_complet
        buffer = bordereau_journaliers_excel(
            employe_nom, list(presences), date_paiement
        )
        response = HttpResponse(
            buffer,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = (
            f'attachment; filename="bordereau_{employe_id}.xlsx"'
        )
        return response

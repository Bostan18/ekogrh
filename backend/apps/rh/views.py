from datetime import date as date_cls

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .exports import (
    cnps_excel,
)
from .models import (
    BulletinPaie,
    Certification,
    Competence,
    CompetenceEmploye,
    Conge,
    Employe,
    HistoriqueContrat,
    LigneBulletin,
    MissionMoo,
    Paiement,
    PresenceJournaliere,
    RetenueCategorie,
)
from .serializers import (
    BulletinPaieSerializer,
    CertificationSerializer,
    CompetenceEmployeSerializer,
    CompetenceSerializer,
    CongeSerializer,
    EmployeSerializer,
    HistoriqueContratSerializer,
    MissionMooSerializer,
    PaiementSerializer,
    RetenueCategorieSerializer,
)
from .views_presence import PresenceJournaliereViewSet


class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.filter(is_deleted=False)
    serializer_class = EmployeSerializer
    filterset_fields = ["type_contrat", "statut"]
    search_fields = ["nom", "prenom", "code", "poste"]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .order_by("nom", "prenom")
            .annotate(
                jours_non_payes=Count(
                    "presences",
                    filter=Q(presences__present=True, presences__paye_le__isnull=True),
                ),
                restant=Sum(
                    "presences__montant_du",
                    filter=Q(presences__present=True, presences__paye_le__isnull=True),
                ),
            )
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()


class BulletinPaieViewSet(viewsets.ModelViewSet):
    queryset = BulletinPaie.objects.select_related("employe").prefetch_related("lignes")
    serializer_class = BulletinPaieSerializer
    filterset_fields = ["employe", "mois", "statut"]
    search_fields = ["employe__nom", "employe__prenom", "employe__code"]

    @action(detail=False, methods=["post"])
    def generer(self, request):
        """Génère les bulletins pour un mois donné, pour les employés sélectionnés."""
        mois = request.data.get("mois")
        annee = request.data.get("annee")
        employe_ids = request.data.get("employe_ids", None)

        if not mois or not annee:
            return Response(
                {"error": "mois et annee requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from datetime import date

        premier_jour = date(int(annee), int(mois), 1)

        employes = Employe.objects.filter(
            type_contrat__in=["cdi", "cdd", "stagiaire"],
            statut="actif",
            is_deleted=False,
            salaire_mensuel__isnull=False,
        )

        if employe_ids:
            employes = employes.filter(id__in=employe_ids)
            if not employes.exists():
                return Response(
                    {"error": "Aucun employé trouvé avec ces IDs."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"error": "employe_ids requis (liste d'IDs d'employés à générer)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        generes = []
        for emp in employes:
            bulletin, created = BulletinPaie.objects.get_or_create(
                employe=emp,
                mois=premier_jour,
                defaults={"brut": emp.salaire_mensuel},
            )
            if created:
                generes.append(BulletinPaieSerializer(bulletin).data)

        return Response(
            {
                "generes": len(generes),
                "total_employes": employes.count(),
                "bulletins": generes,
            }
        )

    @action(detail=False, methods=["post"])
    def marquer_paye(self, request):
        """Marque un bulletin comme payé."""
        bulletin_id = request.data.get("bulletin_id")
        date_paiement = request.data.get("paye_le") or str(timezone.now().date())
        if not bulletin_id:
            return Response(
                {"error": "bulletin_id requis"}, status=status.HTTP_400_BAD_REQUEST
            )
        BulletinPaie.objects.filter(id=bulletin_id).update(
            statut="paye", paye_le=date_paiement
        )
        return Response({"statut": "paye", "paye_le": date_paiement})

    @action(detail=False, methods=["get"])
    def export_cnps(self, request):
        """Export Excel déclaratif CNPS."""
        mois = int(request.query_params.get("mois", timezone.now().month))
        annee = int(request.query_params.get("annee", timezone.now().year))

        from datetime import date

        premier_jour = date(int(annee), int(mois), 1)
        bulletins = BulletinPaie.objects.filter(mois=premier_jour).select_related(
            "employe"
        )

        buffer = cnps_excel(bulletins, mois, annee)
        response = HttpResponse(
            buffer,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = (
            f'attachment; filename="cnps_{mois}_{annee}.xlsx"'
        )
        return response


class MissionMooViewSet(viewsets.ModelViewSet):
    queryset = MissionMoo.objects.select_related("employe")
    serializer_class = MissionMooSerializer
    filterset_fields = ["employe", "paye_le"]
    search_fields = ["employe__nom", "description", "projet_ref"]

    @action(detail=True, methods=["post"])
    def marquer_payee(self, request, pk=None):
        mission = self.get_object()
        mission.paye_le = request.data.get("paye_le") or timezone.now().date()
        mission.save()
        return Response(MissionMooSerializer(mission).data)


class CongeViewSet(viewsets.ModelViewSet):
    queryset = Conge.objects.select_related("employe")
    serializer_class = CongeSerializer
    filterset_fields = ["employe", "type_conge", "statut"]
    search_fields = ["employe__nom", "motif"]

    @action(detail=True, methods=["post"])
    def approuver(self, request, pk=None):
        conge = self.get_object()
        conge.statut = "approuve"
        conge.approuve_par = request.user.get_full_name() or request.user.username
        conge.approuve_le = timezone.now().date()
        conge.save()
        return Response(CongeSerializer(conge).data)

    @action(detail=True, methods=["post"])
    def refuser(self, request, pk=None):
        conge = self.get_object()
        conge.statut = "refuse"
        conge.notes = request.data.get("notes", conge.notes)
        conge.save()
        return Response(CongeSerializer(conge).data)


class CompetenceViewSet(viewsets.ModelViewSet):
    queryset = Competence.objects.filter(is_deleted=False)
    serializer_class = CompetenceSerializer
    filterset_fields = ["categorie", "actif"]
    search_fields = ["libelle", "code"]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()


class CompetenceEmployeViewSet(viewsets.ModelViewSet):
    queryset = CompetenceEmploye.objects.select_related("employe", "competence")
    serializer_class = CompetenceEmployeSerializer
    filterset_fields = ["employe", "competence"]


class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.select_related("employe")
    serializer_class = CertificationSerializer
    filterset_fields = ["employe"]
    search_fields = ["libelle", "organisme", "employe__nom"]


class HistoriqueContratViewSet(viewsets.ModelViewSet):
    queryset = HistoriqueContrat.objects.select_related("employe")
    serializer_class = HistoriqueContratSerializer
    filterset_fields = ["employe", "type_contrat"]


class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.select_related("employe", "bulletin")
    serializer_class = PaiementSerializer
    filterset_fields = ["employe", "date", "mode", "bulletin"]
    search_fields = ["employe__nom", "reference"]

    @action(detail=False, methods=["post"])
    def regler_lot(self, request):
        """Règle un lot de journaliers avec création de Paiements."""
        employe_ids = request.data.get("employe_ids", [])
        mode = request.data.get("mode", "especes")
        reference = request.data.get("reference", "")
        notes = request.data.get("notes", "")
        date_str = request.data.get("date") or str(timezone.now().date())

        if not employe_ids:
            return Response(
                {"detail": "employe_ids requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        presences = PresenceJournaliere.objects.filter(
            employe_id__in=employe_ids,
            paye_le__isnull=True,
            present=True,
            statut="valide",
        )

        if not presences.exists():
            return Response(
                {"detail": "Aucune présence non payée trouvée pour ces employés."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        employes = Employe.objects.filter(id__in=employe_ids)
        paiements_crees = 0

        for employe in employes:
            emp_presences = presences.filter(employe=employe)
            total = emp_presences.aggregate(total=Sum("montant_du"))["total"] or 0

            if total > 0:
                Paiement.objects.create(
                    employe=employe,
                    date=date_str,
                    montant=total,
                    mode=mode,
                    reference=reference,
                    notes=notes,
                )
                emp_presences.update(paye_le=date_str)
                paiements_crees += 1

        return Response(
            {
                "detail": f"{paiements_crees} paiement(s) créé(s).",
                "paiements_crees": paiements_crees,
                "presences_payees": presences.count(),
                "total": str(
                    sum(p.montant for p in Paiement.objects.filter(date=date_str))
                ),
            }
        )


class RetenueCategorieViewSet(viewsets.ModelViewSet):
    """CRUD des configurations de retenues par catégorie d'employé."""

    queryset = RetenueCategorie.objects.all()
    serializer_class = RetenueCategorieSerializer
    filterset_fields = ["type_contrat", "actif"]

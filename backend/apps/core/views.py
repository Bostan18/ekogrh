from django.db.models import Q
from django.http import JsonResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer

from apps.operations.models import Site
from apps.rh.models import BulletinPaie, Employe, MissionMoo
from apps.rh.permissions import get_user_role


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_info(request):
    """Retourne les infos de l'utilisateur connecté."""
    role = get_user_role(request.user)
    return JsonResponse(
        {
            "username": request.user.username,
            "role": role or "admin",
            "is_admin": role == "admin",
            "groups": list(request.user.groups.values_list("name", flat=True)),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def global_search(request):
    """Recherche globale cross-module."""
    q = request.GET.get("q", "").strip()
    if len(q) < 2:
        return JsonResponse({"results": {}})

    results = {}

    # Employés : recherche par nom, prénom, ou code
    employes = (
        Employe.objects.filter(
            Q(nom__icontains=q) | Q(prenom__icontains=q) | Q(code__icontains=q),
            is_deleted=False,
        )
        .only("id", "code", "nom", "prenom", "poste", "type_contrat", "statut")
        .order_by("nom")[:5]
    )
    if employes:
        results["employes"] = [
            {
                "id": e.id,
                "code": e.code,
                "nom_complet": f"{e.nom} {e.prenom}",
                "poste": e.poste or "",
                "type_contrat": e.type_contrat,
                "statut": e.statut,
            }
            for e in employes
        ]

    # Bulletins : recherche par nom d'employé ou mois
    bulletins = (
        BulletinPaie.objects.filter(
            Q(employe__nom__icontains=q)
            | Q(employe__prenom__icontains=q)
            | Q(employe__code__icontains=q)
        )
        .select_related("employe")
        .only(
            "id",
            "mois",
            "brut",
            "net",
            "statut",
            "employe__nom",
            "employe__prenom",
            "employe__code",
        )
        .order_by("-mois")[:5]
    )
    if bulletins:
        results["bulletins"] = [
            {
                "id": b.id,
                "employe_nom": f"{b.employe.nom} {b.employe.prenom}",
                "employe_code": b.employe.code,
                "mois": str(b.mois),
                "brut": str(b.brut),
                "net": str(b.net),
                "statut": b.statut,
            }
            for b in bulletins
        ]

    # Sites : recherche par nom ou code
    sites = (
        Site.objects.filter(
            Q(nom__icontains=q) | Q(code__icontains=q),
            actif=True,
        )
        .only("id", "code", "nom", "type_site")
        .order_by("nom")[:5]
    )
    if sites:
        results["sites"] = [
            {
                "id": s.id,
                "code": s.code,
                "nom": s.nom,
                "type_site": s.type_site,
            }
            for s in sites
        ]

    # Missions MOO : recherche par employé ou description
    missions = (
        MissionMoo.objects.filter(
            Q(employe__nom__icontains=q)
            | Q(employe__prenom__icontains=q)
            | Q(description__icontains=q)
            | Q(employe__code__icontains=q)
        )
        .select_related("employe")
        .only(
            "id",
            "description",
            "montant_forfaitaire",
            "paye_le",
            "employe__nom",
            "employe__prenom",
            "employe__code",
        )
        .order_by("-created_at")[:5]
    )
    if missions:
        results["missions"] = [
            {
                "id": m.id,
                "employe_nom": f"{m.employe.nom} {m.employe.prenom}",
                "employe_code": m.employe.code,
                "description": m.description or "",
                "montant_forfaitaire": str(m.montant_forfaitaire or 0),
                "paye_le": str(m.paye_le) if m.paye_le else None,
            }
            for m in missions
        ]

    return JsonResponse({"results": results})


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response({"status": "ok"})

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"status": "ok"})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        total = self.get_queryset().filter(is_read=False).count()
        notifications = self.get_queryset().filter(
            is_read=False, type="notification"
        ).count()
        messages = self.get_queryset().filter(
            is_read=False, type="message"
        ).count()
        return Response({
            "total": total,
            "notifications": notifications,
            "messages": messages,
        })

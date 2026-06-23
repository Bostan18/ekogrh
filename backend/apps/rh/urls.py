from rest_framework.routers import DefaultRouter

from .views import (
    BulletinPaieViewSet,
    CertificationViewSet,
    CompetenceEmployeViewSet,
    CompetenceViewSet,
    CongeViewSet,
    EmployeViewSet,
    HistoriqueContratViewSet,
    MissionMooViewSet,
    PaiementViewSet,
    PresenceJournaliereViewSet,
)

router = DefaultRouter()
router.register("employes", EmployeViewSet)
router.register("presences", PresenceJournaliereViewSet)
router.register("bulletins", BulletinPaieViewSet)
router.register("missions-moo", MissionMooViewSet)
router.register("paiements", PaiementViewSet)
router.register("conges", CongeViewSet)
router.register("competences", CompetenceViewSet)
router.register("competences-employes", CompetenceEmployeViewSet)
router.register("certifications", CertificationViewSet)
router.register("historique-contrats", HistoriqueContratViewSet)

urlpatterns = router.urls

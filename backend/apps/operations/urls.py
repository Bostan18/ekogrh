from rest_framework.routers import DefaultRouter

from .views import LogTravailViewSet, SiteViewSet, TacheCatalogueViewSet

router = DefaultRouter()
router.register("sites", SiteViewSet)
router.register("taches-catalogue", TacheCatalogueViewSet)
router.register("logs-travail", LogTravailViewSet)

urlpatterns = router.urls

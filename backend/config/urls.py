from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def api_root(request):
    base = request.build_absolute_uri("/")[:-1]
    return JsonResponse(
        {
            "name": "EKOGRH API",
            "version": "1.0",
            "auth": {
                "login": f"{base}/api/token/",
                "refresh": f"{base}/api/token/refresh/",
            },
            "modules": {
                "rh": f"{base}/api/rh/",
            },
        },
        json_dumps_params={"indent": 2, "ensure_ascii": False},
    )


urlpatterns = [
    path("", api_root, name="api_root"),
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/rh/", include("apps.rh.urls")),
    path("api/operations/", include("apps.operations.urls")),
]

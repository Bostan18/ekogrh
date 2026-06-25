from rest_framework.permissions import BasePermission

ROLES = {
    "Admin": "admin",
    "RH": "rh",
    "Comptable": "comptable",
    "ChefEquipe": "chef_equipe",
    "Lecture": "lecture",
}

ROLE_CHOICES = [(v, k) for k, v in ROLES.items()]


def get_user_role(user):
    """Retourne le rôle principal de l'utilisateur."""
    if not user or not user.is_authenticated:
        return None
    groups = user.groups.values_list("name", flat=True)
    for role_name, role_code in ROLES.items():
        if role_name in groups:
            return role_code
    return None


class HasRole(BasePermission):
    """Permission basée sur le rôle utilisateur."""

    def __init__(self, *allowed_roles):
        self.allowed_roles = set(allowed_roles)

    def __call__(self):
        return self

    def has_permission(self, request, view):
        role = get_user_role(request.user)
        if role is None:
            return False
        return role in self.allowed_roles


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == ROLES["Admin"]


class IsRH(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in (ROLES["Admin"], ROLES["RH"])


class IsComptable(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in (ROLES["Admin"], ROLES["Comptable"])


class IsAdminOrRH(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in (ROLES["Admin"], ROLES["RH"])


class IsAdminOrComptable(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in (ROLES["Admin"], ROLES["Comptable"])


class IsChefEquipeOrAbove(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in (ROLES["Admin"], ROLES["ChefEquipe"], ROLES["RH"])


class ReadOnlyUnlessAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user and request.user.is_authenticated
        return get_user_role(request.user) == ROLES["Admin"]

    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return get_user_role(request.user) == ROLES["Admin"]

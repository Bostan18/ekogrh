from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Ajoute le rôle utilisateur dans le payload JWT."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        groups = user.groups.values_list("name", flat=True)
        role = "admin"
        for g in groups:
            if g == "Admin":
                role = "admin"
                break
            elif g == "RH":
                role = "rh"
                break
            elif g == "Comptable":
                role = "comptable"
                break
            elif g == "ChefEquipe":
                role = "chef_equipe"
                break
            elif g == "Lecture":
                role = "lecture"
                break
        token["role"] = role
        token["username"] = user.username
        return token

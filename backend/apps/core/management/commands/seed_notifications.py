from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from apps.core.models import Notification


class Command(BaseCommand):
    help = "Crée des notifications de démo pour tous les utilisateurs"

    NOTIFICATIONS = [
        {
            "type": "notification",
            "title": "Événement aujourd'hui",
            "description": "Rappel : vous avez un événement prévu aujourd'hui",
            "icon": "calendar",
        },
        {
            "type": "notification",
            "title": "Paramètres",
            "description": "Mise à jour du tableau de bord disponible",
            "icon": "settings",
        },
        {
            "type": "notification",
            "title": "Nouvel employé",
            "description": "David a rejoint l'équipe RH",
            "icon": "account",
        },
        {
            "type": "message",
            "title": "Mark Johnson",
            "description": "Vous a envoyé un message",
            "icon": "user",
        },
        {
            "type": "message",
            "title": "Sarah Dupont",
            "description": "A demandé un congé",
            "icon": "user",
        },
        {
            "type": "message",
            "title": "David Koné",
            "description": "Nouveau bulletin disponible",
            "icon": "user",
        },
    ]

    def handle(self, *args, **options):
        users = User.objects.all()
        if not users:
            self.stdout.write(self.style.WARNING("Aucun utilisateur trouvé"))
            return

        for user in users:
            Notification.objects.filter(user=user).delete()
            for data in self.NOTIFICATIONS:
                Notification.objects.create(user=user, **data)

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ {len(self.NOTIFICATIONS)} notifications créées pour {users.count()} utilisateur(s)"
            )
        )

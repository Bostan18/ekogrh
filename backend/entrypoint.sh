#!/bin/bash
set -e

python manage.py migrate --noinput

# Création du superuser via variables d'environnement (jamais en dur)
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth.models import User
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
if not password:
    print('DJANGO_SUPERUSER_PASSWORD non défini, superuser ignoré')
elif not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f'Superuser créé: {username}')
else:
    print(f'Superuser {username} existe déjà')
"

exec gunicorn config.wsgi:application --bind 0.0.0.0:"${PORT:-8000}" --workers 3

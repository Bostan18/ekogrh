#!/bin/bash
set -e
python manage.py migrate --noinput
python -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', password='admin123')
    print('Superuser cree: admin / admin123')
else:
    print('Superuser existe deja')
"
exec gunicorn config.wsgi:application --bind 0.0.0.0:"${PORT:-8000}" --workers 3

# EKOGRH — ERP de Gestion des Ressources Humaines

Application RH autonome pour **EKO SARL**, société opérant dans les secteurs agricole, BTP et services en Côte d'Ivoire. EKOGRH centralise la gestion des employés, le pointage des présences, la paie (bulletins CDI/CDD, journaliers, MOO) et le reporting opérationnel.

## Aperçu

|                          |                                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| **Backend**              | Django 5.0, Django REST Framework, PostgreSQL 16, Gunicorn, JWT (Simple JWT) |
| **Frontend**             | React 18, Vite 5, TailwindCSS 3, Zustand, React Router 6                     |
| **Base de données**      | PostgreSQL 16 (Supabase)                                                     |
| **Déploiement**          | Render (backend) + Vercel (frontend) + Supabase (DB)                         |
| **Langue**               | Français (locale `fr-fr`, fuseau `Africa/Abidjan`)                           |

## Fonctionnalités

### 👥 Gestion des employés
- Trois catégories : **CDI/CDD**, **Journaliers**, **MOO**, **Stagiaires**
- Fiche complète, création, modification, suppression
- Historique des contrats
- Lien utilisateur (compte d'accès)

### 📋 Pointage des présences
- **Pointage journalier** : saisie présent/absent avec heures, projet, site, notes
- **Pointage hebdomadaire** : grille 7 jours, clic ternaire, navigation semaines
- Workflow : brouillon → validé → clôture
- Alertes automatiques : 0h présentes, absence prolongée, seuil hebdo dépassé
- Calcul automatique du montant dû

### 💰 Gestion de la paie
- **Bulletins de paie** (CDI/CDD) : génération en masse, marquage payé
- **Paiements journaliers** : récapitulatif restant à payer, règlement par lot
- **Missions MOO** : suivi des missions forfaitaires, marquage payé
- **Export Excel** : paie mensuelle, bordereaux journaliers
- **Bordereau** par journalier (téléchargement Excel)

### 📊 Tableau de bord
- Effectif actif, pointages du jour, anomalies, masse salariale
- Accès rapides vers les modules clés

### 🏢 Opérations terrain
- **Sites d'intervention** : chantiers, parcelles, pépinières, dépôts (CRUD)
- **Tâches catalogue** : référentiel métier avec type d'objectif et tarif
- **Logs de travail** : quantité réalisée × tâche × site, rendement calculé auto
- **Vue journaliers** : taux, jours non payés, restant à payer

### 🏖 Congés
- CRUD des congés, calcul automatique du nombre de jours

### 🔐 Sécurité
- Authentification JWT avec refresh token
- Superuser créé automatiquement au premier déploiement (via variables d'env)
- Mot de passe administrateur jamais stocké dans le code

## Structure du projet

```
ekogrh/
├── backend/
│   ├── apps/
│   │   ├── core/              # Modèles partagés (TimeStampedModel, SoftDelete)
│   │   ├── rh/                # Module RH : employés, paie, pointage, congés
│   │   └── operations/        # Module Opérations : sites, tâches, logs
│   ├── config/                # Settings Django, URLs, WSGI
│   ├── Dockerfile
│   ├── entrypoint.sh          # Migrations + création superuser + Gunicorn
│   ├── manage.py
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # Client HTTP Axios (JWT auto-refresh)
│   │   ├── components/        # Layout, Icon (SVG), UI partagés
│   │   ├── pages/             # 17 pages métier
│   │   └── store/             # Auth store (Zustand)
│   ├── Dockerfile             # Build React + serveur Nginx
│   ├── nginx.conf             # Reverse proxy /api → backend
│   ├── vercel.json            # SPA fallback pour Vercel
│   ├── package.json
│   ├── tailwind.config.js     # Palette Forest / Sand / Gold
│   └── vite.config.js
├── docs/
│   ├── specs/                 # Spécifications fonctionnelles
│   └── ROADMAP.md             # Suivi des fonctionnalités
├── render.yaml                # Configuration Render
├── docker-compose.yml         # Développement local
└── .gitignore
```

## Démarrage rapide

### Prérequis
- [Docker](https://docs.docker.com/get-docker/) et Docker Compose

### Lancement local

```bash
git clone https://github.com/Bostan18/ekogrh.git
cd ekogrh
docker compose up -d
```

Puis :
- **Frontend** : http://localhost:5173
- **API** : http://localhost:8000/api/
- **Admin Django** : http://localhost:8000/admin/

### Superuser

En local :
```bash
docker compose exec backend python manage.py createsuperuser
```

En production (Render), les variables `DJANGO_SUPERUSER_USERNAME` et `DJANGO_SUPERUSER_PASSWORD` créent automatiquement le superuser au déploiement.

## Développement local (sans Docker)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

Le proxy Vite redirige `/api` vers `http://localhost:8000`.

## Tests

```bash
cd backend
pytest
```

## API

Authentification JWT. Principaux endpoints :

| Module      | Endpoint                            | Description                     |
| ----------- | ----------------------------------- | ------------------------------- |
| RH          | `/api/rh/employes/`                 | CRUD employés                   |
| RH          | `/api/rh/presences/`                | Pointages (jour/semaine)        |
| RH          | `/api/rh/bulletins/`                | Bulletins de paie               |
| RH          | `/api/rh/missions-moo/`             | Missions MOO                    |
| RH          | `/api/rh/paiements/`                | Paiements                       |
| RH          | `/api/rh/conges/`                   | Congés                          |
| RH          | `/api/rh/historique-contrats/`      | Historique des contrats         |
| RH          | `/api/rh/competences/`              | Compétences                     |
| Opérations  | `/api/operations/sites/`            | CRUD sites                      |
| Opérations  | `/api/operations/taches-catalogue/` | Référentiel tâches              |
| Opérations  | `/api/operations/logs-travail/`     | Logs de travail                 |
| Auth        | `/api/token/`                       | Login (JWT)                     |
| Auth        | `/api/token/refresh/`               | Rafraîchir le token             |

## Déploiement

L'application est déployée sur trois services gratuits :

| Composant          | Service    | URL                                  |
| ------------------ | ---------- | ------------------------------------ |
| **Frontend React** | Vercel     | https://ekogrh.vercel.app            |
| **Backend Django** | Render     | https://ekogrh.onrender.com          |
| **Base de données**| Supabase   | —                                    |

### Schéma

```
Navigateur ──→ Vercel (React) ──→ Render (Django) ──→ Supabase (PostgreSQL)
```

### Configurations

- `render.yaml` — déploiement Render (Docker, variables d'env)
- `vercel.json` — SPA fallback pour React Router
- `frontend/.env.production` — URL de l'API pour la production

## Roadmap

Voir [ROADMAP.md](docs/ROADMAP.md) pour le suivi détaillé.

## Licence

Projet interne — EKO SARL. Tous droits réservés.

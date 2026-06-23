# EKOGRH — ERP de Gestion des Ressources Humaines

Application RH autonome pour **EKO SARL**, société opérant dans les secteurs agricole, BTP et services en Côte d'Ivoire. EKOGRH centralise la gestion des employés, le pointage des présences, la paie (bulletins CDI/CDD, journaliers, MOO) et le reporting opérationnel.

## Aperçu

|                          |                                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| **Backend**              | Django 5.0, Django REST Framework, PostgreSQL 16, Gunicorn, JWT (Simple JWT) |
| **Frontend**             | React 18, Vite 5, TailwindCSS 3, Zustand, React Router 6                     |
| **Base de données**      | PostgreSQL 16                                                                |
| **Infrastructure**       | Docker Compose (services `db`, `backend`, `frontend`)                        |
| **Langue de l'interface**| Français (locale `fr-fr`, fuseau `Africa/Abidjan`)                           |

## Fonctionnalités principales

### 👥 Gestion des employés
- Trois catégories de contrat : **CDI/CDD**, **Journaliers**, **MOO** (main-d'œuvre occasionnelle)
- Fiche employé complète : identité, poste, type de contrat, salaire mensuel ou taux journalier, statut, historique des contrats, lien utilisateur

### 📋 Pointage des présences
- **Pointage journalier** : saisie rapide présent/absent par date, avec heures travaillées, projet et site
- **Pointage hebdomadaire** : grille 7 jours pour une vue d'ensemble et une saisie en masse
- Calcul automatique du montant dû pour les journaliers (`taux_journalier × jours présents`)

### 💰 Gestion de la paie
- **Bulletins de paie** (CDI/CDD) : génération mensuelle en un clic, idempotent, marquage payé
- **Paiements journaliers** : récapitulatif restant à payer, règlement par lot, export Excel
- **Missions MOO** : suivi des missions à montant forfaitaire avec période et paiement
- **Export paie** : fichier Excel formaté aux couleurs EKO

### 📊 Tableau de bord & KPI
- Effectif actif, masse salariale mensuelle, bulletins générés / payés
- Comparaison mois en cours vs mois précédent

### 🏢 Référentiels opérationnels
- **Sites d'intervention** : chantiers, parcelles, pépinières, dépôts
- **Tâches catalogue** : référentiel métier avec type d'objectif et tarif de référence
- **Logs de travail** *(en construction)* : suivi des quantités réalisées par employé, site et tâche

### 🔐 Multi-rôles
- **ADMIN** : accès complet
- **DIRECTION** : lecture + validation
- **COMPTABLE** : bulletins, paiements, exports
- **RH** : CRUD complet module RH
- **CHEF_CHANTIER** : pointage, sites, logs
- **LECTURE** : consultation seule

## Structure du projet

```
ekogrh/
├── backend/
│   ├── apps/
│   │   ├── core/              # Modèles partagés, API racine
│   │   └── rh/                # Module RH : employés, paie, pointage, exports
│   ├── config/                # Settings Django, URLs, WSGI
│   ├── Dockerfile
│   ├── entrypoint.sh          # Migrations + lancement Gunicorn
│   ├── manage.py
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # Client HTTP (Axios)
│   │   ├── components/        # Layout partagé
│   │   ├── pages/             # Dashboard, Employés, Pointage, Paie, Congés
│   │   └── store/             # Auth store (Zustand)
│   ├── Dockerfile             # Build React + serveur Nginx
│   ├── nginx.conf             # Reverse proxy /api → backend
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   └── specs/                 # Spécifications fonctionnelles détaillées
├── docker-compose.yml
└── .gitignore
```

## Démarrage rapide

### Prérequis
- [Docker](https://docs.docker.com/get-docker/) et Docker Compose

### Lancement

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd ekogrh

# Lancer tous les services
docker compose up -d

# Créer un superutilisateur
docker compose exec backend python manage.py createsuperuser
```

L'application est ensuite accessible sur :
- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **API** : [http://localhost:8000/api/](http://localhost:8000/api/)
- **Admin Django** : [http://localhost:8000/admin/](http://localhost:8000/admin/)

### Variables d'environnement

Les principales variables sont définies dans `docker-compose.yml`. En production, modifiez a minima :

| Variable              | Description                          | Défaut                       |
| --------------------- | ------------------------------------ | ---------------------------- |
| `SECRET_KEY`          | Clé secrète Django                   | `change-me-in-production...` |
| `DEBUG`               | Mode debug                           | `False`                      |
| `DB_PASSWORD`         | Mot de passe PostgreSQL              | `ekogrh_pass`                |
| `CORS_ALLOWED_ORIGINS`| Origines autorisées (CORS)           | `http://localhost:5173`      |
| `ALLOWED_HOSTS`       | Hôtes autorisés Django               | `localhost,127.0.0.1`        |

## Développement local

### Backend (sans Docker)

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows : venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (sans Docker)

```bash
cd frontend
npm install
npm run dev
```

Le proxy Vite redirige `/api` vers `http://localhost:8000`.

### Tests

```bash
cd backend
pytest
```

## API

L'API REST est documentée à la racine `/api/`. Authentification via JWT :

```bash
# Obtenir un token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "..."}'

# Utiliser le token
curl http://localhost:8000/api/rh/employes/ \
  -H "Authorization: Bearer <access_token>"
```

### Principaux endpoints

| Module | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| RH     | `/api/rh/employes/`       | CRUD des employés                    |
| RH     | `/api/rh/bulletins/`      | Bulletins de paie                    |
| RH     | `/api/rh/presences/`      | Pointage journalier / semaine        |
| RH     | `/api/rh/missions-moo/`   | Missions main-d'œuvre occasionnelle  |
| Auth   | `/api/token/`             | Login (JWT)                          |
| Auth   | `/api/token/refresh/`     | Rafraîchir le token                  |

## Déploiement

L'application est déployée sur trois services gratuits :

| Composant          | Service    | Fichier de config   |
| ------------------ | ---------- | ------------------- |
| **Frontend React** | Vercel     | `vercel.json`       |
| **Backend Django** | Render     | `render.yaml`       |
| **Base de données**| Supabase   | —                   |

### Étapes de mise en place

#### 1. Supabase — Base de données

1. Crée un projet gratuit sur [supabase.com](https://supabase.com)
2. Récupère les identifiants de connexion dans *Settings > Database* : `Host`, `Port` (5432), `Database name`, `User`, `Password`

#### 2. Render — Backend

1. Connecte le repo Git sur [render.com](https://render.com)
2. Render détecte automatiquement `render.yaml` et crée le service `ekogrh-api`
3. Dans le dashboard, renseigne les variables Supabase :
   - `DB_HOST` → hôte Supabase
   - `DB_NAME` → nom de la BDD Supabase
   - `DB_USER` → utilisateur Supabase
   - `DB_PASSWORD` → mot de passe Supabase

#### 3. Vercel — Frontend

1. Importe le repo sur [vercel.com](https://vercel.com)
2. Configure le projet :
   - **Root Directory** : `frontend`
   - **Framework** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
3. Ajoute la variable d'environnement :
   - `VITE_API_URL` → `https://ekogrh-api.onrender.com/api` (l'URL du backend Render)

Une fois le frontend déployé, récupère son URL (ex: `https://ekogrh.vercel.app`) et ajoute-la dans les variables d'environnement du backend Render :
- `CORS_ALLOWED_ORIGINS` → `https://ekogrh.vercel.app`

### Schéma de l'architecture

```
┌──────────────┐      HTTPS       ┌──────────────┐      SSL       ┌──────────────┐
│   Vercel     │ ───────────────→ │    Render    │ ─────────────→ │   Supabase   │
│  (React SPA) │ ←─ CORS allow ── │   (Django)   │               │ (PostgreSQL) │
└──────────────┘                  └──────────────┘               └──────────────┘
```

## Roadmap

- [x] Gestion des employés et contrats
- [x] Pointage journalier et hebdomadaire
- [x] Paie CDI/CDD (bulletins, génération en masse)
- [x] Paiement journaliers et missions MOO
- [x] Export Excel (paie)
- [x] Dashboard et KPI
- [x] Gestion des congés
- [ ] Logs de travail à la tâche (quantité × rendement)
- [ ] Workflow de validation des pointages (brouillon → validé → clôturé)
- [ ] Pointage mobile avec mode hors-ligne (PWA)
- [ ] Alertes et détection d'anomalies
- [ ] Bordereaux de paiement

## Licence

Projet interne — EKO SARL. Tous droits réservés.

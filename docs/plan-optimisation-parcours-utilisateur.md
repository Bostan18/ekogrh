# Plan d'optimisation du parcours utilisateur — EKOGRH

> **Auteur** : Product Manager (revue produit)
> **Date** : 2026-06-25
> **Produit** : EKOGRH — ERP de Gestion des Ressources Humaines
> **Phase produit** : MVP → Croissance (Phase 3-4 de la roadmap)
> **Version** : 1.0

---

## 1. Synthèse du produit

| Dimension | État |
|-----------|------|
| **Produit** | ERP RH interne pour EKO SARL (agricole, BTP, services — Côte d'Ivoire) |
| **Stack** | Django 5.0 / DRF + React 18 / Vite 5 + PostgreSQL 16 (Supabase) |
| **Déploiement** | Render (backend) + Vercel (frontend) + Supabase (DB) |
| **Utilisateurs cibles** | RH, Comptable, Chef d'équipe — *mais un seul rôle « Admin » implémenté* |
| **North Star potentielle** | Pointages validés par mois → Paiements générés → Employés payés |
| **Pages** | 20 pages (dont 17 pages métier + login + dashboard) |
| **Modules** | RH (employés, pointage, paie, congés) + Opérations (sites, tâches, logs) |

---

## 2. Modules et périmètre fonctionnel

### 2.1 Gestion des employés
- Quatre catégories : **CDI/CDD**, **Journaliers**, **MOO**, **Stagiaires**
- Fiche complète, création, modification, suppression
- Historique des contrats
- Lien utilisateur (compte d'accès)

### 2.2 Pointage des présences
- **Pointage journalier** : saisie présent/absent avec heures, projet, site, notes
- **Pointage hebdomadaire** : grille 7 jours, clic ternaire (null → ✓ → ✗), navigation semaines
- Workflow : brouillon → validé → clôture
- Alertes automatiques : 0h présentes, absence prolongée, seuil hebdo dépassé
- Calcul automatique du montant dû

### 2.3 Gestion de la paie
- **Bulletins de paie** (CDI/CDD) : génération en masse, marquage payé
- **Paiements journaliers** : récapitulatif restant à payer, règlement par lot
- **Missions MOO** : suivi des missions forfaitaires, marquage payé
- **Paie à la tâche** : rémunération basée sur les logs de travail
- **Retenues** : gestion des catégories de retenues sur salaire
- **Export Excel** : paie mensuelle, bordereaux journaliers

### 2.4 Opérations terrain
- **Sites d'intervention** : chantiers, parcelles, pépinières, dépôts (CRUD)
- **Tâches catalogue** : référentiel métier avec type d'objectif et tarif
- **Logs de travail** : quantité réalisée × tâche × site, rendement calculé auto

### 2.5 Congés
- CRUD des congés, calcul automatique du nombre de jours

### 2.6 Sécurité
- Authentification JWT avec refresh token
- Superuser créé automatiquement au premier déploiement

---

## 3. Cartographie du parcours actuel

```
┌─────────────────────────────────────────────────────────────────┐
│                           LOGIN                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DASHBOARD (KPI)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │Employés   │  │Pointages │  │Anomalies │  │Masse salariale   │ │
│  │actifs     │  │du jour   │  │          │  │                  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐  │
│  │Accès rapides        │  │Derniers pointages (vide)         │  │
│  └─────────────────────┘  └──────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┬────────────────┐
            ▼                ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────────┐
   │ PRINCIPAL  │   │     RH     │   │    PAIE    │   │  OPÉRATIONS    │
   │            │   │            │   │            │   │                │
   │ • Dashboard│   │ • Employés │   │ • Bulletins│   │ • Sites        │
   │            │   │ • Pointage │   │ • Paiements│   │ • Tâches cat.  │
   │            │   │   jour     │   │ • Missions │   │ • Logs travail │
   │            │   │ • Pointage │   │   MOO      │   │ • Hist. contrats│
   │            │   │   semaine  │   │ • Journal. │   │                │
   │            │   │ • Congés   │   │ • Paie     │   │                │
   │            │   │            │   │   tâche    │   │                │
   │            │   │            │   │ • Retenues │   │                │
   └────────────┘   └────────────┘   └────────────┘   └────────────────┘
```

### Routage détaillé

| Route | Page | Module |
|-------|------|--------|
| `/` | Dashboard | Principal |
| `/employes` | EmployeList | RH |
| `/employes/nouveau` | EmployeForm (création) | RH |
| `/employes/:id` | EmployeDetail | RH |
| `/employes/:id/modifier` | EmployeForm (édition) | RH |
| `/pointage` | Pointage (journalier) | RH |
| `/pointage-semaine` | PointageSemaine | RH |
| `/conges` | CongesList | RH |
| `/bulletins` | BulletinList | Paie |
| `/bulletins/:id` | BulletinDetail | Paie |
| `/paiements` | Paiements | Paie |
| `/missions` | MissionsMoo | Paie |
| `/journaliers` | JournalierList | Paie |
| `/task-payroll` | TaskPayroll | Paie |
| `/retenues` | RetenueCategorieList | Paie |
| `/sites` | SiteList | Opérations |
| `/taches` | TacheCatalogueList | Opérations |
| `/logs` | LogTravailList | Opérations |
| `/historique` | HistoriqueContrats | Opérations |

---

## 4. Forces du produit actuel

| # | Force | Détail |
|---|-------|--------|
| 1 | **Architecture claire** | 4 sections de navigation bien segmentées, orientation métier lisible |
| 2 | **Pointage semaine UX excellent** | Grille ternaire (null/✓/✗) avec navigation temporelle, compteur de modifications visuel, sauvegarde en masse |
| 3 | **Génération en masse** | Bulletins de paie par sélection multiple, workflow idempotent (`get_or_create`) |
| 4 | **Sécurité JWT** | Refresh token automatique via intercepteur Axios, superuser par variables d'env, aucun secret dans le code |
| 5 | **Design system cohérent** | Palette Forest/Sand/Gold, composants réutilisables, responsive mobile-first, cartes KPI |
| 6 | **Lazy loading** | Toutes les pages sont chargées paresseusement (`React.lazy` + `Suspense`) |
| 7 | **Alertes anomalies** | 0h présentes, absence prolongée (>3 jours), seuil hebdomadaire dépassé |
| 8 | **Export Excel** | Paie mensuelle et bordereaux journaliers avec couleurs charte EKO |
| 9 | **Workflow pointage** | Brouillon → Validé → Clôture avec états visuels |
| 10 | **Auto-calcul** | Montant dû automatique, code employé auto-généré (EMP-001, EMP-002...) |

---

## 5. Problèmes identifiés dans le parcours utilisateur

### 🔴 Problèmes critiques (freins à l'adoption)

| # | Problème | Impact | Pages concernées |
|---|----------|--------|------------------|
| **P1** | **Pas de rôles utilisateurs** — tout le monde est « Admin », pas de permissions granulaires | Risque de sécurité : un chef d'équipe peut voir/modifier les salaires. Impossible de déployer à des non-admins | Toutes |
| **P2** | **Pas d'onboarding** — l'utilisateur arrive sur un dashboard vide sans guidage, aucun « premier pas » | Abandon, confusion. L'utilisateur ne sait pas par où commencer | Dashboard, toutes les pages sans données |
| **P3** | **Aucun breadcrumb** — pas de fil d'Ariane dans les 4 sections de navigation | Désorientation, navigation inefficace. L'utilisateur ne sait pas où il est dans l'arborescence | Toutes |
| **P4** | **Dashboard passif** — KPI statiques sans CTA, « Derniers pointages » vide (texte statique), pas d'incitation à l'action | Le dashboard ne pilote pas l'activité, il est purement informatif | Dashboard |
| **P5** | **Pas de pagination serveur visible** — on ne sait pas combien d'éléments totaux existent, pas de "X sur Y résultats" | Frustration sur les listes longues, pas de repère | EmployeList, BulletinList, Paiements, LogTravailList |

### 🟠 Problèmes majeurs (irritants quotidiens)

| # | Problème | Impact | Pages concernées |
|---|----------|--------|------------------|
| **P6** | **Pas de recherche globale** — il faut naviguer vers Employés pour chercher un employé, pas de recherche cross-module | Perte de temps, multi-clics. 3 clics minimum pour trouver un employé | Toutes |
| **P7** | **Redondance de navigation** — « Journaliers » apparaît dans Paie (vue financière) ET via Opérations (vue terrain). Deux pages différentes pour les mêmes données | Confusion cognitive, duplication mentale. L'utilisateur ne sait pas quelle vue utiliser | JournalierList, Paiements (onglet restants) |
| **P8** | **Bouton « Certifications » fantôme** — présent sur la fiche employé mais non fonctionnel (aucune action) | Fausse promesse, frustration, perte de confiance | EmployeDetail |
| **P9** | **Génération de bulletins sans feedback** — pas d'indicateur de progression, pas de confirmation du nombre de bulletins créés | Incertitude : « est-ce que ça a marché ? combien ont été générés ? » | BulletinList |
| **P10** | **Paiements journaliers incomplets** — pas de workflow de paiement intégré, juste un export bordereau. L'utilisateur doit effectuer le paiement hors application | Tâche inachevée, rupture de flux. L'app gère la paie CDI mais pas le paiement effectif des journaliers | Paiements |
| **P11** | **Pas d'historique des actions** — qui a modifié quoi, quand ? Impossible de tracer une erreur | Impossibilité d'auditer, pas de responsabilité. En cas d'erreur de paie, pas de trace | Toutes |

### 🟡 Problèmes mineurs (friction UX)

| # | Problème | Détail | Pages concernées |
|---|----------|--------|------------------|
| **P12** | `alert()` natif au lieu de toasts | `alert("Veuillez sélectionner...")`, `confirm("Supprimer ?")` — pas intégré au design system, bloquant | BulletinList, MissionsMoo, EmployeDetail |
| **P13** | États vides sans CTA | « Aucun employé trouvé » sans bouton pour en créer un | Toutes les listes vides |
| **P14** | Pas de skeleton loader | Seul un spinner est utilisé pendant le chargement | Toutes |
| **P15** | `projet_ref` en texte libre | Champ texte au lieu d'un sélecteur lié aux projets/sites | Pointage, MissionsMoo |
| **P16** | Pas de filtre par période unifié | Chaque page a son propre sélecteur mois/année, pas de composant réutilisable | BulletinList, TaskPayroll, LogTravailList |
| **P17** | Pas de raccourci clavier | Aucun support clavier pour la navigation rapide | Toutes |
| **P18** | Pas de mode sombre | L'application est uniquement en mode clair | Toutes |
| **P19** | Pas de notif de succès après action | Après une création/modification, la navigation se fait sans feedback visuel explicite | EmployeForm, MissionsMoo |

---

## 6. Plan d'optimisation — Priorisation RICE

### Méthodologie

**Score RICE = (Reach × Impact × Confidence) / Effort**

| Paramètre | Échelle |
|-----------|---------|
| **Reach** | % d'utilisateurs impactés (estimation sur 100%) |
| **Impact** | 1 (faible) → 10 (transformationnel) |
| **Confidence** | % de certitude sur l'estimation |
| **Effort** | S = Small (~1-3 jours), M = Medium (~1-2 semaines), L = Large (~3+ semaines) |

Pour le calcul, S=1, M=3, L=8.

### Tableau de priorisation

| # | Action | Reach | Impact | Conf. | Effort | Score | Phase |
|---|--------|-------|--------|-------|--------|-------|-------|
| **A1** | **Breadcrumb + fil d'Ariane** global sur toutes les pages | 100% | 8 | 95% | S (1) | **76** | 🚀 P1 |
| **A2** | **Recherche globale** dans le header (employés, bulletins, sites) | 85% | 7 | 90% | S (2) | **50** | 🚀 P1 |
| **A3** | **Onboarding** : checklist « Premiers pas » guidée (créer employé → pointer → générer paie) | 100% | 9 | 85% | M (3) | **45** | 🚀 P1 |
| **A4** | **Toast system unifié** — remplacer `alert()` et `confirm()` natifs | 90% | 5 | 95% | S (1) | **43** | 🚀 P1 |
| **A5** | **Dashboard actionnable** : cartes KPI cliquables, alertes visibles, derniers pointages réels | 100% | 10 | 80% | M (3) | **42** | 🚀 P1 |
| **A6** | **États vides avec CTA** + illustrations | 70% | 6 | 90% | S (2) | **38** | 🚀 P1 |
| **A7** | **Filtre période unifié** — composant Mois/Année réutilisable | 65% | 6 | 95% | S (2) | **30** | 🏗️ P2 |
| **A8** | **Feedback génération bulletins** : compteur, confirmation, résumé | 40% | 8 | 90% | S (1) | **29** | 🏗️ P2 |
| **A9** | **Gestion des rôles** : Admin, RH, Comptable, Chef équipe avec permissions granulaires | 100% | 9 | 80% | L (8) | **27** | 🔐 P3 |
| **A10** | **Fusion vues Journalier** : une page unique avec onglets (RH / Financier) | 50% | 6 | 80% | M (3) | **20** | 🏗️ P2 |
| **A11** | **Skeleton loaders** sur toutes les pages (remplacer les spinners) | 80% | 4 | 90% | M (3) | **16** | 🏗️ P2 |
| **A12** | **Workflow de paiement intégré** : modal de règlement avec sélection mode + confirmation | 40% | 8 | 75% | M (4) | **10** | 🔐 P3 |
| **A13** | **Journal d'audit** : modèle `AuditLog` (user, action, modèle, instance_id, timestamp) | 30% | 6 | 85% | L (8) | **6** | 🔐 P3 |
| **A14** | **Sélecteur Site/Projet** dans Pointage (remplacer texte libre) | 30% | 5 | 85% | M (3) | **5** | 🔐 P3 |
| **A15** | **Mode sombre** | 40% | 3 | 70% | M (4) | **2** | 📋 Backlog |

---

## 7. Phases détaillées

### 🚀 Phase 1 — Quick Wins (1-2 sprints)

**Objectif** : Améliorer radicalement l'expérience quotidienne avec un effort minimal.

#### A1 — Breadcrumb + fil d'Ariane

**Problème** : L'utilisateur navigue dans 4 sections avec 19 routes et ne sait jamais où il se trouve.

**Solution** : Ajouter un composant `Breadcrumb` dans le `Layout` qui affiche le chemin courant.

```
🏠 Accueil > Ressources Humaines > Employés > Jean Kouadio
🏠 Accueil > Paie > Bulletins > Juin 2026
```

**Spécifications** :
- Composant React `Breadcrumb` avec props `items: {label, to?}[]`
- Affiché dans le `<main>` juste au-dessus du `<Outlet />`
- Mapping automatique route → breadcrumb via un fichier de configuration
- Dernier élément non cliquable (page courante)
- Responsive : sur mobile, afficher uniquement le dernier niveau + "... "

**Fichiers impactés** :
- `frontend/src/components/Breadcrumb.jsx` (nouveau)
- `frontend/src/components/Layout.jsx` (modification)

**Effort** : S (1 jour)

---

#### A2 — Recherche globale

**Problème** : Pour trouver un employé, il faut : naviguer vers Employés → utiliser le filtre local. Pas de recherche cross-module.

**Solution** : Ajouter une barre de recherche dans le header (visible sur desktop, icône loupe sur mobile) qui interroge une API de recherche globale.

**Spécifications** :
- Champ de recherche dans le header du Layout (icône loupe + input)
- Shortcut clavier : `Ctrl+K` / `Cmd+K` pour focus
- API endpoint : `GET /api/search/?q=...` → retourne employés, bulletins, sites
- Résultats affichés dans un dropdown type "command palette"
- Maximum 5 résultats par catégorie
- Navigation au clic vers la page correspondante
- Debounce 300ms sur la saisie

**Backend** :
- Nouvelle view `GlobalSearchView` dans `apps/core/views.py`
- Requête `icontains` sur `Employe.nom`, `Employe.prenom`, `Employe.code`, `Site.nom`, `BulletinPaie.employe__nom`

**Fichiers impactés** :
- `frontend/src/components/GlobalSearch.jsx` (nouveau)
- `frontend/src/components/Layout.jsx` (modification)
- `backend/apps/core/views.py` (modification)
- `backend/config/urls.py` (modification)

**Effort** : S (2 jours)

---

#### A3 — Onboarding « Premiers pas »

**Problème** : Un nouvel utilisateur arrive sur un dashboard vide. Aucune indication de ce qu'il faut faire en premier.

**Solution** : Une checklist d'onboarding qui apparaît sur le dashboard tant que les étapes clés ne sont pas complétées.

**Spécifications** :
- Composant `OnboardingChecklist` affiché en haut du dashboard
- 4 étapes avec état (✅ / 🔨 / ⬜) :
  1. ✅ Créer un premier employé → lien vers `/employes/nouveau`
  2. ⬜ Effectuer un pointage → lien vers `/pointage`
  3. ⬜ Générer un bulletin de paie → lien vers `/bulletins`
  4. ⬜ Explorer les autres modules
- Checklist disparaît automatiquement quand toutes les étapes sont complétées
- Barre de progression globale (0% → 100%)
- Persistance en localStorage + vérification API (nb employés > 0, nb pointages > 0, etc.)
- Design : carte blanche avec bordure dorée, titre « Bienvenue sur EKOGRH 👋 »

**Fichiers impactés** :
- `frontend/src/components/OnboardingChecklist.jsx` (nouveau)
- `frontend/src/pages/Dashboard.jsx` (modification)

**Effort** : M (3 jours)

---

#### A4 — Toast system unifié

**Problème** : `alert()` et `confirm()` natifs cassent l'immersion, bloquent l'interface, et ne sont pas stylisés.

**Solution** : Remplacer par un système de toast + modale de confirmation intégré au design system.

**Spécifications** :
- Créer un `ToastContext` + `ToastProvider` avec Zustand ou Context API
- Types : `success` (vert), `error` (rouge), `warning` (doré), `info` (bleu)
- Position : bottom-right sur desktop, bottom-center sur mobile
- Durée : 4s par défaut, configurable. Bouton fermeture manuelle
- Animation : slide-in + fade-out
- Fonctions exportées : `toast.success(msg)`, `toast.error(msg)`, `toast.confirm(msg).then(confirmed => ...)`
- Maximum 3 toasts visibles simultanément (stack verticale)
- Modale de confirmation stylisée pour remplacer `confirm()`

**Fichiers impactés** :
- `frontend/src/components/Toast.jsx` (nouveau)
- `frontend/src/components/ConfirmModal.jsx` (nouveau)
- `frontend/src/store/toastStore.js` (nouveau)
- Toutes les pages remplaçant `alert()` → `toast.error()` et `confirm()` → `toast.confirm()`

**Effort** : S (1-2 jours)

---

#### A5 — Dashboard actionnable

**Problème** : Le dashboard est purement informatif. Les KPI ne sont pas cliquables. La section « Derniers pointages » est un texte statique.

**Solution** : Transformer le dashboard en hub de pilotage.

**Spécifications** :
- **Cartes KPI cliquables** : chaque carte devient un lien vers la page correspondante
  - Employés actifs → `/employes`
  - Pointages du jour → `/pointage`
  - Anomalies → `/pointage` (avec filtre anomalies) ou page dédiée
  - Masse salariale → `/bulletins`
- **Bandeau d'alerte** : si `nbAnomalies > 0`, afficher un bandeau jaune « ⚠️ 3 anomalies détectées — Voir » au-dessus des KPI
- **Derniers pointages réels** : remplacer le texte statique par les 5 derniers pointages avec :
  - Nom de l'employé, date, statut (présent/absent), heures
  - Clic → fiche employé
- **Résumé paie du mois** : ajouter une section « Paie de Juin 2026 » avec :
  - Nombre de bulletins générés / Nombre de bulletins payés
  - Total net à payer
  - CTA « Générer la paie »

**Fichiers impactés** :
- `frontend/src/pages/Dashboard.jsx` (modification majeure)
- Nouvel endpoint ou enrichissement des endpoints existants

**Effort** : M (3 jours)

---

#### A6 — États vides avec CTA

**Problème** : Les listes vides affichent juste « Aucun employé trouvé » sans proposer d'action.

**Solution** : Chaque état vide devient une opportunité de guider l'utilisateur.

**Spécifications** :
- Composant réutilisable `EmptyState` avec props :
  - `icon` : icône SVG illustrative
  - `title` : message principal
  - `description` : message secondaire
  - `actionLabel` : texte du bouton
  - `actionTo` : lien ou callback
- États à implémenter :

| Page | État vide | CTA |
|------|-----------|-----|
| EmployeList | « Aucun employé enregistré » | « Créer mon premier employé » → `/employes/nouveau` |
| BulletinList | « Aucun bulletin pour cette période » | « Générer la paie de ce mois » → ouvre le panneau |
| Paiements | « Aucun paiement enregistré » | « Voir les montants restants à payer » → onglet restants |
| CongesList | « Aucun congé enregistré » | « Ajouter un congé » → ouvre le formulaire |
| MissionsMoo | « Aucune mission MOO » | « Créer une mission » → ouvre le formulaire |
| SiteList | « Aucun site enregistré » | « Ajouter un site » → formulaire |
| LogTravailList | « Aucun log de travail » | « Ajouter un log » → formulaire |

- Design : illustration simple (icône large), texte centré, bouton coloré

**Fichiers impactés** :
- `frontend/src/components/EmptyState.jsx` (nouveau)
- Toutes les pages de liste (modifications mineures)

**Effort** : S (2 jours)

---

### 🏗️ Phase 2 — Structuration (2-3 sprints)

**Objectif** : Consolider l'architecture de l'information et fiabiliser les workflows clés.

#### A7 — Filtre période unifié

**Problème** : Chaque page a sa propre implémentation du sélecteur mois/année.

**Solution** : Créer un composant `MonthYearPicker` réutilisable.

**Spécifications** :
- Props : `month`, `year`, `onChange({month, year})`, `label?`, `showMonth?`, `showYear?`
- Sélecteur de mois (12 mois en français)
- Input année (numérique, 4 chiffres)
- Navigation mois précédent / suivant
- Utilisé dans : BulletinList, TaskPayroll, LogTravailList, HistoriqueContrats

**Fichiers impactés** :
- `frontend/src/components/MonthYearPicker.jsx` (nouveau)
- 4 pages listées ci-dessus (modification)

**Effort** : S (2 jours)

---

#### A8 — Feedback génération bulletins

**Problème** : Après avoir cliqué « Générer N bulletins », aucun retour sur ce qui s'est passé.

**Solution** : Ajouter un retour détaillé après la génération.

**Spécifications** :
- Toast de succès : « ✅ 12 bulletins générés pour Juin 2026 »
- Si des bulletins existaient déjà : « ✅ 8 bulletins générés, 4 existaient déjà »
- Le tableau se recharge automatiquement
- Si erreur : toast d'erreur avec le message
- Ajouter l'information dans la réponse API : `{created: 12, existing: 4, total: 16}`

**Fichiers impactés** :
- `frontend/src/pages/BulletinList.jsx` (modification)
- `backend/apps/rh/views.py` (modification — enrichir la réponse de `generer/`)

**Effort** : S (1 jour)

---

#### A10 — Fusion des vues Journalier

**Problème** : La page `/journaliers` (Paie) et l'onglet « Restant à payer » dans Paiements montrent des données qui se chevauchent. Les journaliers apparaissent aussi dans la liste Employés.

**Solution** : Créer une page « Journaliers » unique avec 2-3 onglets.

**Spécifications** :
- Page unique `/journaliers` avec 3 onglets :
  1. **Vue d'ensemble** : cartes comme actuellement, avec taux, jours non payés, restant
  2. **Pointage** : raccourci vers le pointage du jour filtré
  3. **Financier** : restant à payer + historique des paiements
- Supprimer la redondance avec la liste Employés (filtrer `type_contrat=journalier` reste dans Employés mais l'onglet « Financier » absorbe le restant à payer)
- Navigation : déplacer dans la section RH plutôt que Paie

**Fichiers impactés** :
- `frontend/src/pages/JournalierList.jsx` (refonte majeure)
- `frontend/src/components/Layout.jsx` (modification navigation)
- `frontend/src/pages/Paiements.jsx` (simplification)

**Effort** : M (4 jours)

---

#### A11 — Skeleton loaders

**Problème** : Toutes les pages utilisent un spinner centré pendant le chargement. L'utilisateur ne sait pas quelle structure va apparaître.

**Solution** : Remplacer les spinners par des skeletons qui miment la structure de la page chargée.

**Spécifications** :
- Composants skeleton :
  - `TableSkeleton` : lignes grises animées avec largeurs variables
  - `CardSkeleton` : rectangle avec titre + contenu
  - `KPISkeleton` : 4 rectangles pour les KPI
  - `FormSkeleton` : champs de formulaire grisés
- Animation : pulse shimmer (dégradé animé de gauche à droite)
- Appliquer sur : Dashboard (KPISkeleton), EmployeList (TableSkeleton), BulletinList (TableSkeleton), JournalierList (CardSkeleton × 6)

**Fichiers impactés** :
- `frontend/src/components/Skeleton.jsx` (nouveau)
- Toutes les pages (remplacer le spinner par le skeleton approprié)

**Effort** : M (3 jours)

---

### 🔐 Phase 3 — Robustesse (2-3 sprints)

**Objectif** : Sécuriser l'application, auditer les actions, compléter les workflows.

#### A9 — Gestion des rôles utilisateurs

**Problème** : Un seul rôle « Admin » existe. Tout le monde peut tout voir et tout modifier.

**Solution** : Implémenter des rôles avec permissions granulaires.

**Spécifications** :

**Backend** :
- Modèle `Role` (ou utiliser les groupes Django) :
  - `ADMIN` : CRUD complet
  - `RH` : CRUD employés, pointage, congés. Lecture paie.
  - `COMPTABLE` : Bulletins, paiements, missions MOO. Lecture employés.
  - `CHEF_CHANTIER` : Pointage, logs de travail, sites. Lecture employés.
  - `LECTURE` : Consultation seule
- Permissions DRF par rôle sur chaque ViewSet
- Champ `role` sur le modèle `User` ou lien vers le groupe Django
- Modification de l'auth store pour inclure le rôle

**Frontend** :
- Navigation conditionnelle : les sections invisibles pour le rôle sont masquées
- Boutons d'action conditionnels : pas de « Supprimer » pour LECTURE
- Redirection si accès à une route non autorisée
- Affichage du rôle dans le footer du Layout

**Fichiers impactés** :
- `backend/apps/rh/models.py` (modification User)
- `backend/apps/rh/permissions.py` (nouveau)
- `backend/apps/rh/views.py` (modification)
- `frontend/src/store/authStore.js` (modification)
- `frontend/src/components/Layout.jsx` (modification)
- Toutes les pages (modifications conditionnelles)

**Effort** : L (8 jours)

---

#### A12 — Workflow de paiement intégré

**Problème** : Le paiement des journaliers se fait hors application. L'utilisateur doit exporter un bordereau puis effectuer le paiement manuellement.

**Solution** : Intégrer un workflow de paiement dans l'application.

**Spécifications** :
- Sur la page Paiements → onglet « Restant à payer » :
  - Case à cocher par ligne (employé)
  - Bouton « Payer la sélection »
- Modale de paiement :
  - Liste des employés sélectionnés avec montants
  - Sélection du mode de paiement : Espèces, Orange Money, MTN Mobile Money, Moov, Virement, Chèque
  - Champ référence (optionnel)
  - Champ notes (optionnel)
  - Date de paiement (par défaut : aujourd'hui)
  - Bouton « Confirmer le paiement »
- Après confirmation :
  - Toast de succès : « ✅ 5 paiements effectués — 125 000 FCFA »
  - Les lignes disparaissent de « Restant à payer »
  - Ajout dans l'historique des paiements
- Stocker le paiement dans le modèle `Paiement` (à créer si pas déjà fait)

**Backend** :
- Endpoint : `POST /api/rh/paiements/regler_lot/` — reçoit `{employe_ids, mode, reference, notes, date}`
- Marque les `PresenceJournaliere` correspondantes comme payées
- Crée les entrées `Paiement`

**Fichiers impactés** :
- `frontend/src/pages/Paiements.jsx` (modification majeure)
- `frontend/src/components/PaymentModal.jsx` (nouveau)
- `backend/apps/rh/models.py` (modification — modèle Paiement si absent)
- `backend/apps/rh/views.py` (nouvel endpoint)
- `backend/apps/rh/serializers.py` (modification)

**Effort** : M (4 jours)

---

#### A13 — Journal d'audit

**Problème** : Impossible de savoir qui a modifié quoi et quand.

**Solution** : Tracer toutes les actions utilisateur.

**Spécifications** :
- Modèle `AuditLog` :
  - `user` : FK → User
  - `action` : `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `EXPORT`
  - `model_name` : nom du modèle impacté
  - `instance_id` : ID de l'instance
  - `changes` : JSON (champs modifiés + anciennes/nouvelles valeurs)
  - `ip_address` : IP de l'utilisateur
  - `timestamp` : datetime auto
- Middleware ou mixin Django pour capturer automatiquement les actions sur les ViewSets
- Page « Journal d'audit » accessible uniquement aux Admins :
  - Tableau filtrable par utilisateur, action, modèle, période
  - Export CSV

**Fichiers impactés** :
- `backend/apps/core/models.py` (modification — AuditLog)
- `backend/apps/core/middleware.py` (nouveau)
- `backend/apps/core/views.py` (modification)
- `frontend/src/pages/AuditLog.jsx` (nouveau)
- `frontend/src/App.jsx` (nouvelle route)

**Effort** : L (8 jours)

---

#### A14 — Sélecteur Site/Projet dans Pointage

**Problème** : Les champs `projet_ref` et `site_ref` sont en texte libre. L'utilisateur peut faire des fautes de frappe.

**Solution** : Remplacer par des sélecteurs liés aux données.

**Spécifications** :
- Dans le formulaire de pointage journalier, remplacer l'input `projet_ref` par un `<select>` listant les projets disponibles
- Remplacer l'input `site_ref` par un `<select>` listant les sites
- Option « Aucun » pour les deux
- Autocomplete/search dans le select si beaucoup d'options
- Réutiliser le composant `SearchableSelect` existant

**Fichiers impactés** :
- `frontend/src/pages/Pointage.jsx` (modification)
- `frontend/src/pages/PointageSemaine.jsx` (modification)
- `frontend/src/pages/MissionsMoo.jsx` (modification)
- `backend/apps/rh/views.py` (modification — enrichir la réponse feuille_journee)

**Effort** : M (3 jours)

---

### 📋 Backlog — Idées futures

| # | Idée | Impact | Effort |
|---|------|--------|--------|
| B1 | **Raccourcis clavier** : navigation rapide entre modules (`Alt+1` → Dashboard, `Alt+2` → Employés...) | M | S |
| B2 | **Mode sombre** : bascule clair/sombre avec CSS variables | M | M |
| B3 | **Export PDF des bulletins** : format imprimable officiel avec en-tête EKO | M | S |
| B4 | **Dashboard personnalisable** : widgets réorganisables, choix des KPI affichés | F | L |
| B5 | **Notifications email** : alerte paie générée, alerte anomalie, rappel pointage | H | M |
| B6 | **Import Excel employés** : chargement en masse depuis un fichier | M | M |
| B7 | **Signature électronique** : validation des pointages par le chef d'équipe | F | L |
| B8 | **API mobile** : endpoints optimisés pour une future app mobile | M | M |
| B9 | **Rapports avancés** : graphiques (effectif par type, évolution masse salariale, turnover) | M | L |
| B10 | **Multi-devise** : support FCFA + autres devises si expansion | F | M |

---

## 8. Métriques de succès

| # | Métrique | Cible | Comment mesurer |
|---|----------|-------|-----------------|
| M1 | **Temps jusqu'au premier pointage** (TTFP) | < 3 min après login | Track événement onboarding |
| M2 | **Taux d'achèvement onboarding** | > 80% | Checklist « Premiers pas » complétée |
| M3 | **Délai pointage → paie** | < 2 jours | Date dernier pointage - date génération bulletin |
| M4 | **Taux d'erreur de saisie** | < 5% | Anomalies détectées / total pointages |
| M5 | **Sessions par utilisateur / semaine** | > 5 | Log de connexion |
| M6 | **Utilisation de la recherche globale** | > 30% des sessions | Événement de recherche |
| M7 | **Nombre d'alertes ignorées** | < 10% | Anomalies non résolues après 48h |
| M8 | **NPS interne** | > 50 | Sondage trimestriel auprès des utilisateurs |

---

## 9. Risques et points d'attention

| # | Risque | Probabilité | Impact | Mitigation |
|---|--------|-------------|--------|------------|
| **R1** | **Absence de rôles** : tout employé avec un compte voit/modifie les salaires | Haute | Critique | Implémenter A9 avant tout déploiement à des non-admins |
| **R2** | **Non-conformité CNPS** : le calcul des cotisations est marqué « Abandonné » dans la roadmap | Haute | Élevé | Obligation légale en Côte d'Ivoire. À réintégrer dans la roadmap |
| **R3** | **Utilisation hors-ligne** : le pointage PWA est en attente, or les plantations n'ont pas de réseau | Haute | Élevé | Prioriser le mode offline après la Phase 1 |
| **R4** | **Pas de tests frontend** : aucune couverture de tests React | Haute | Moyen | Ajouter Vitest + React Testing Library en parallèle de la Phase 2 |
| **R5** | **Feature creep** : la roadmap liste 34 fonctionnalités, risque de dispersion | Moyenne | Moyen | Suivre strictement la priorisation RICE. Dire non aux demandes non priorisées |
| **R6** | **Dépendance Firebase/Supabase** : le gratuit a des limites | Faible | Élevé | Prévoir un plan de migration si la base atteint les limites du tier gratuit |

---

## 10. Plan d'action recommandé

### Immédiat (ce sprint)

1. ✅ Créer le breadcrumb (`A1`) — 1 jour
2. ✅ Créer le composant `EmptyState` (`A6`) et l'appliquer — 2 jours
3. ✅ Enrichir le dashboard (`A5`) — 3 jours

### Sprint suivant

4. Mettre en place le toast system (`A4`) — 2 jours
5. Ajouter la recherche globale (`A2`) — 2 jours
6. Créer l'onboarding « Premiers pas » (`A3`) — 3 jours

### Sprint +2

7. Composant `MonthYearPicker` (`A7`) — 2 jours
8. Feedback génération bulletins (`A8`) — 1 jour
9. Skeleton loaders (`A11`) — 3 jours

### Sprint +3 et au-delà

10. Gestion des rôles (`A9`) — 8 jours
11. Workflow paiement (`A12`) — 4 jours
12. Journal d'audit (`A13`) — 8 jours

---

## 11. Résumé exécutif

**EKOGRH est un MVP solide** qui couvre déjà le cœur du métier RH d'EKO SARL : employés, pointage, paie. La stack technique est cohérente et le code est bien structuré.

La priorité absolue est de **passer d'un outil fonctionnel à un outil utilisable au quotidien** :

1. **Guider** l'utilisateur : onboarding, breadcrumb, états vides avec CTA
2. **Accélérer** les tâches fréquentes : recherche globale, dashboard actionnable, raccourcis
3. **Sécuriser** les données : rôles utilisateurs, journal d'audit, permissions granulaires
4. **Compléter** les workflows inachevés : paiement intégré, feedback, squelette loaders

Les actions à plus fort rapport valeur/effort sont :
- **Breadcrumb** (score RICE : 76) — améliore l'orientation de 100% des utilisateurs
- **Recherche globale** (score RICE : 50) — réduit le temps d'accès aux informations
- **Onboarding** (score RICE : 45) — élimine la confusion des nouveaux utilisateurs

Ces trois actions peuvent être livrées en **2 sprints** et transformeront radicalement l'expérience utilisateur.

---

## Annexes

### A. État de la roadmap

| Phase | Contenu | Statut |
|-------|---------|--------|
| Phase 1 | MVP Paie & Pointage | ✅ Terminé (14/14) |
| Phase 2 | Opérations terrain | ✅ Terminé (5/5) |
| Phase 3 | RH avancé | 🔨 Partiel (2/4 : alertes et workflow OK, retenues CNPS et export abandonnés) |
| Phase 4 | Améliorations transverses | 🔨 Partiel (2/4 : bordereaux et historique OK, PWA et gestion utilisateurs en attente) |
| Phase 5 | Polish Frontend | 🔨 Partiel (6/7 : skeleton loaders restant) |

### B. Dette technique identifiée

| # | Dette | Sévérité |
|---|-------|----------|
| 1 | Pas de tests frontend (0% couverture) | Élevée |
| 2 | Pas de pagination explicite dans l'UI | Moyenne |
| 3 | `alert()` et `confirm()` natifs | Faible |
| 4 | CNPS abandonné (obligation légale) | Critique |
| 5 | Pas de gestion de la concurrence (deux utilisateurs modifient le même pointage) | Moyenne |

---

> **Prochaine étape** : Valider les priorités de la Phase 1 et lancer le sprint.

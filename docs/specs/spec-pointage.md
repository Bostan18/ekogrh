# Spécification — Gestion des Pointages

> **Modules** : RH (`apps.rh`) + Opérations (`apps.operations`)  
> **Version** : MVP  
> **Dernière mise à jour** : 2026-06-07

---

## 1. Contexte métier

Le pointage est critique pour EKO SARL car il pilote directement la paie des journaliers, qui représentent la majorité de la main-d'œuvre (saigneurs d'hévéa, ouvriers agricoles, agents de sécurité en plantation...).

**Deux modes de pointage** sont à supporter :

| Mode | Périmètre | Utilisateur type | Besoin |
|------|-----------|-----------------|--------|
| **Journalier** | Une date précise | Chef d'équipe / RH | Saisie rapide présent/absent + heures + projet |
| **Hebdomadaire** | Une semaine (lundi→dimanche) | RH / Admin | Vue d'ensemble, remplissage en grille |

---

## 2. État actuel (déjà implémenté)

### 2.1 Modèle de données

#### `PresenceJournaliere` — `apps/rh/models.py`
| Champ | Type | Description |
|-------|------|-------------|
| `employe` | FK→Employe | Employé concerné |
| `date` | DateField | Date du pointage |
| `present` | BooleanField | Présent (true) / Absent (false) |
| `heures_travaillees` | DecimalField(4,1) | Heures effectuées (défaut: 8.0) |
| `montant_du` | DecimalField | Montant dû, auto-calculé (`taux_journalier` si présent) |
| `projet_ref` | CharField(50) | Référence projet (FK souple) |
| `site` | FK→Site | Site d'intervention (optionnel) |
| `notes` | CharField(300) | Notes libres |
| `paye_le` | DateField | Date de règlement (null = non payé) |

**Contraintes** : `unique_together = ["employe", "date"]`

**Calcul automatique** : `save()` → si `employe.taux_journalier` et `present=True`, alors `montant_du = employe.taux_journalier`

#### `Site` — `apps/operations/models.py`
| Champ | Type | Description |
|-------|------|-------------|
| `code` | CharField(20) unique | ID métier, ex: SIT-001 |
| `nom` | CharField(200) | Nom du site |
| `type_site` | CharField | `chantier`, `parcelle`, `pepiniere`, `espace_vert`, `depot`, `autre` |
| `projet` | FK→Projet | Projet rattaché (optionnel) |
| `responsable` | FK→Employe | Responsable (optionnel) |
| `localisation` | CharField(300) | Lieu-dit, coordonnées |

#### `TacheCatalogue` — `apps/operations/models.py`
| Champ | Type | Description |
|-------|------|-------------|
| `code` | CharField(20) unique | ID métier, ex: TAC-001 |
| `libelle` | CharField(200) | Libellé de la tâche |
| `type_objectif` | CharField | `surface`, `volume`, `unite`, `lineaire`, `forfait` |
| `unite_label` | CharField(50) | Unité (m², sacs, ml...) |
| `tarif_reference` | DecimalField | Tarif de référence |
| `activite` | FK→CentreCout | Centre de coût associé |

### 2.2 API Endpoints

#### Pointage journalier (`/api/rh/presences/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/feuille_journee/?date=` | Retourne tous les journaliers actifs avec leur statut de présence pour la date |
| `POST` | `/saisie_journee/` | Saisie en masse des présences d'une journée |
| `GET` | `/feuille_semaine/?semaine=` | Retourne tous les journaliers avec leurs présences sur 7 jours |
| `POST` | `/saisie_semaine/` | Saisie en masse pour une semaine complète |
| `GET/POST` | `/` | CRUD standard sur les présences (filtrable: `employe`, `date`, `present`) |

#### Sites (`/api/operations/sites/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET/POST` | `/` | CRUD standard (filtrable: `type_site`, `projet`, `responsable`, `actif`) |

#### Tâches catalogue (`/api/operations/taches-catalogue/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET/POST` | `/` | CRUD standard (filtrable: `type_objectif`, `activite`, `actif`) |

### 2.3 Frontend

| Page | Route | Fichier | Description |
|------|-------|---------|-------------|
| Pointage journalier | `/rh/pointage` | `pages/rh/Pointage.jsx` | Saisie quotidienne des présences journaliers |
| Pointage semaine | `/rh/pointage-semaine` | `pages/rh/PointageSemaine.jsx` | Grille hebdomadaire de présence |
| Fiche employé | `/rh/:id` | `pages/rh/EmployeDetail.jsx` | Onglet « Présences » avec filtre mensuel |
| Liste des sites | `/operations/sites` | `pages/operations/SiteList.jsx` | Gestion des sites d'intervention |
| Journaliers (ops) | `/operations/journaliers` | `pages/operations/JournalierList.jsx` | Vue opérationnelle des journaliers |
| Tâches catalogue | `/operations/taches-catalogue` | `pages/operations/TacheCatalogueList.jsx` | Référentiel des tâches |

#### Pointage journalier — fonctionnement

1. Charge `/rh/presences/feuille_journee/?date=...` → retourne la liste des journaliers actifs
2. Chaque ligne a un état ternaire : `true` (présent), `false` (absent), `null` (non pointé)
3. Interface responsive : cards sur mobile, table sur desktop
4. Checkbox « tout sélectionner » + sélection individuelle
5. Champs éditables : heures travaillées, projet, notes
6. KPI de tête : nb journaliers, nb présents, total à payer
7. Sauvegarde en masse via `POST /saisie_journee/`

#### Pointage semaine — fonctionnement

1. Charge `/rh/presences/feuille_semaine/?semaine=YYYY-MM-DD` (lundi)
2. Grille 7 colonnes (Lun→Dim) × N lignes (journaliers)
3. Chaque cellule a un cycle à 3 états : `null` → `true` (✓ vert) → `false` (✗ rouge) → `null`
4. Boutons navigation : semaine précédente / suivante
5. Colonne « Total semaine » calculée côté client
6. Sauvegarde en masse via `POST /saisie_semaine/`

---

## 3. À construire / Améliorations

### 3.1 Logs de travail à la tâche (Sprint 5 — priorité HAUTE)

Le pointage actuel enregistre la présence, mais pas **ce qui a été fait**. Pour les activités agricoles (saignée, ramassage) et BTP, il faut tracer le travail effectué.

**Modèle `LogTravail`** à créer dans `apps/operations/models.py` :
```python
class LogTravail(TimeStampedModel):
    employe        = FK → Employe
    date           = DateField
    site           = FK → Site
    tache          = FK → TacheCatalogue
    objectif_realise = DecimalField  # quantité réalisée (m², sacs...)
    duree_heures   = DecimalField    # temps passé
    rendement      = DecimalField    # objectif_realise / duree_heures (calculé)
    notes          = TextField
```

**Workflow** :
1. Le chef d'équipe sélectionne un site → les employés affectés
2. Pour chaque employé, il choisit une tâche dans le catalogue
3. Il saisit la quantité réalisée et les heures
4. Le rendement est calculé automatiquement

**KPIs dérivés** :
- Rendement journalier par tâche / par employé
- Comparaison objectif vs réalisé
- Coût de main-d'œuvre par tâche (heures × taux journalier)

### 3.2 Pointage par site (amélioration UX)

Actuellement, `projet_ref` est un champ texte libre. À faire évoluer :
- Sélecteur de site (autocomplete) dans le formulaire de pointage
- Filtrage des journaliers par site d'affectation
- Pointage groupé : « pointer tous les journaliers du site X »

### 3.3 Workflow de validation

- **Statut de pointage** : `brouillon` → `valide` → `cloture`
- Seul le statut `valide` permet le paiement
- Clôture de période : verrouille les pointages antérieurs

### 3.4 Pointage mobile (PWA)

- Interface optimisée pour smartphone (utilisation terrain)
- Mode hors-ligne avec synchronisation
- Photo géolocalisée pour justifier la présence sur site

### 3.5 Alertes et anomalies

- Détection des doubles pointages
- Alerte si un employé est marqué présent mais à 0 heure
- Alerte si un employé actif n'a aucun pointage depuis N jours
- Notification si le total hebdomadaire dépasse un seuil

---

## 4. Règles métier

### 4.1 Journaliers
- Un journalier est un employé avec `type_contrat="journalier"`
- Le taux journalier est défini sur la fiche employé
- Le montant dû est automatiquement `taux_journalier` si présent
- Une seule présence par employé et par date (contrainte unique)

### 4.2 Heures travaillées
- Valeur par défaut : 8.0 heures
- Plage acceptée : 0 à 24 heures, pas de 0.5
- Les heures sont informatives (le calcul du montant reste basé sur présent/absent)

### 4.3 Projet de rattachement
- Le champ `projet_ref` permet d'associer une présence à un code projet
- MVP : champ texte libre (pas de FK)
- Évolution souhaitée : FK vers Projet

### 4.4 Site d'intervention
- FK optionnelle vers `operations.Site`
- Permet de savoir où l'employé a travaillé
- Utilisé pour les rapports de productivité par site

---

## 5. Intégration paie

```
Pointage               →  PaiementsJournaliers      →  Export Paie
(feuille_journee)         (restant_a_payer)            (export_paie)
     │                         │                            │
     ▼                         ▼                            ▼
PresenceJournaliere      marquer_payees()            paie_excel()
(montant_du calculé)     (paye_le renseigné)         (fichier .xlsx)
```

---

## 6. Intégration opérations (Sprint 5)

```
Sites                    Tâches catalogue           Logs de travail
(SiteList)               (TacheCatalogueList)       (LogTravailList)
     │                         │                         │
     ▼                         ▼                         ▼
Affectation spatiale     Référentiel métier         Production journalière
                                                      (quantité × tâche)
```

---

## 7. Routes et navigation

```
Module RH :
/rh/pointage                 → Pointage (saisie journalière)
/rh/pointage-semaine         → PointageSemaine (saisie hebdomadaire)
/rh                          → EmployeList
/rh/:id                      → EmployeDetail (onglet Présences)

Module Opérations :
/operations/sites            → SiteList
/operations/journaliers      → JournalierList
/operations/logs             → LogTravailList (à créer)
/operations/taches-catalogue → TacheCatalogueList
```

---

## 8. Sécurité & permissions

| Rôle | Pointage | Sites | Logs |
|------|----------|-------|------|
| ADMIN | CRUD | CRUD | CRUD |
| DIRECTION | Lecture + validation | Lecture | Lecture |
| COMPTABLE | Lecture (pour paie) | — | — |
| RH | CRUD | Lecture | Lecture |
| CHEF_CHANTIER | CRUD (module `operations`) | CRUD | CRUD |
| LECTURE | — | — | — |

---

## 9. Priorités de développement

| # | Fonctionnalité | Sprint | Effort |
|---|---------------|--------|--------|
| 1 | Pointage journalier + semaine | ✅ MVP | Fait |
| 2 | Logs de travail à la tâche | S5 | L |
| 3 | Pointage par site (sélecteur) | S5 | M |
| 4 | Workflow validation (brouillon/valide/clôture) | S5 | M |
| 5 | Pointage mobile offline | Post-S5 | L |
| 6 | Alertes & anomalies | S8 | S |

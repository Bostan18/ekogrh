# Spécification — Gestion de la Paie

> **Module** : RH & Paie (`apps.rh`)  
> **Version** : MVP + Sprint 8 partiel  
> **Dernière mise à jour** : 2026-06-07

---

## 1. Contexte métier

EKO SARL gère trois catégories de personnel avec des modalités de paie distinctes :

| Catégorie | Type contrat | Mode de paie | Périodicité |
|-----------|-------------|--------------|-------------|
| Permanents | CDI, CDD, Stagiaire | Salaire mensuel fixe | Mensuelle |
| Journaliers | Journalier | Taux journalier × jours présents | Variable (à la tâche) |
| MOO | MOO | Montant forfaitaire par mission | À la mission |

---

## 2. État actuel (déjà implémenté)

### 2.1 Modèles de données

#### `Employe` — `apps/rh/models.py`
| Champ | Type | Description |
|-------|------|-------------|
| `code` | CharField(20) unique | ID métier, ex: EMP-001 |
| `nom`, `prenom` | CharField(100) | Identité |
| `type_contrat` | CharField | `cdi`, `journalier`, `moo`, `stagiaire` |
| `poste` | CharField(150) | Intitulé du poste |
| `statut` | CharField | `actif`, `inactif`, `conge` |
| `date_entree` | DateField | Date d'embauche |
| `salaire_mensuel` | DecimalField | Brut mensuel (CDI/CDD) |
| `taux_journalier` | DecimalField | Taux/jour (journaliers) |
| `user` | FK→User | Lien optionnel vers un compte d'accès |

#### `BulletinPaie` — `apps/rh/models.py`
| Champ | Type | Description |
|-------|------|-------------|
| `employe` | FK→Employe | Employé concerné |
| `mois` | DateField | 1er jour du mois (ex: 2026-05-01) |
| `brut` | DecimalField | Salaire brut |
| `net` | DecimalField | Net à payer (MVP : brut = net) |
| `statut` | CharField | `genere`, `paye` |
| `paye_le` | DateField | Date de paiement |
| `notes` | CharField(300) | Notes |

#### `MissionMoo` — `apps/rh/models.py`
| Champ | Type | Description |
|-------|------|-------------|
| `employe` | FK→Employe | Limité aux `type_contrat="moo"` |
| `projet` | FK→Projet | Projet rattaché (optionnel) |
| `description` | CharField(300) | Description de la mission |
| `date_debut`, `date_fin` | DateField | Période de la mission |
| `montant_forfaitaire` | DecimalField | Montant convenu |
| `paye_le` | DateField | Date de paiement |

#### `HistoriqueContrat` — `apps/rh/models.py`
| Champ | Type | Description |
|-------|------|-------------|
| `employe` | FK→Employe | Employé concerné |
| `type_contrat` | CharField | Type du contrat |
| `date_debut`, `date_fin` | DateField | Période (vide = en cours) |
| `salaire_mensuel` | DecimalField | Brut mensuel |
| `taux_journalier` | DecimalField | Taux journalier |
| `motif_fin` | CharField(200) | Motif si contrat clos |

### 2.2 API Endpoints (tous préfixés `/api/rh/`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET/POST` | `/bulletins/` | Liste / création bulletins (filtrable: `employe`, `mois`, `statut`) |
| `GET/PATCH/DELETE` | `/bulletins/{id}/` | Détail / modification / suppression |
| `POST` | `/bulletins/generer/` | Génération en masse pour un mois (CDI actifs). Idempotent |
| `POST` | `/bulletins/{id}/marquer_paye/` | Marque un bulletin payé (`paye_le` = aujourd'hui) |
| `GET/POST` | `/missions-moo/` | Liste / création missions MOO |
| `POST` | `/missions-moo/{id}/marquer_payee/` | Marque une mission comme payée |
| `GET` | `/presences/restant_a_payer/` | Récap par journalier : total dû / payé / restant / jours non payés |
| `POST` | `/presences/marquer_payees/` | Marque un lot de présences comme payées (`ids` + `paye_le`) |
| `GET` | `/presences/export_paie/` | Export Excel de la paie mensuelle (`mois`, `annee`) |

### 2.3 Frontend

| Page | Route | Fichier |
|------|-------|---------|
| Liste des bulletins | `/rh/paie/bulletins` | `pages/rh/BulletinList.jsx` |
| Détail bulletin | `/rh/paie/bulletins/:id` | `pages/rh/BulletinDetail.jsx` |
| Paiements journaliers | `/rh/paie/journaliers` | `pages/rh/PaiementsJournaliers.jsx` |
| Missions MOO | `/rh/paie/missions` | `pages/rh/MissionsMoo.jsx` |

**Fonctionnalités frontend implémentées** :
- KPI synthétiques : nombre de bulletins, masse brute, net à payer, payés/total
- Sélecteur mois sur 12 mois glissants
- Génération de la paie en un clic
- Marquage « payé » individuel
- Bulletin imprimable avec en-tête entreprise (via `/api/core/entreprise/`)
- Modal de sélection des journées à payer pour les journaliers
- Suppression avec confirmation (sauf bulletins payés)

### 2.4 Export Excel
- Fonction `paie_excel()` dans `apps/rh/exports.py`
- Structure : Code, Nom & Prénom, Type, Taux/Salaire, Jours présents, Total à payer, Poste
- Format `.xlsx` via openpyxl, couleurs charte EKO

### 2.5 KPIs Reporting (`apps/reporting/views.py`)
- `masse_salariale_mois` : somme salaires CDI actifs + somme montants journaliers du mois
- `masse_salariale_prev` : même calcul sur le mois précédent
- `employes_actifs` : nombre d'employés `statut="actif"`

---

## 3. À construire / Améliorations

### 3.1 Retenues sur salaire (priorité HAUTE)

**Modèle `LigneBulletin`** à créer dans `apps/rh/models.py` :
```python
class LigneBulletin(TimeStampedModel):
    TYPE_CHOICES = [
        ("salaire_base", "Salaire de base"),
        ("prime",        "Prime / indemnité"),
        ("retenue_cnps", "Cotisation CNPS"),
        ("retenue_its",  "Impôt sur salaire (ITS)"),
        ("retenue_autre","Autre retenue"),
        ("net_a_payer",  "Net à payer"),
    ]
    bulletin = FK → BulletinPaie, related_name="lignes"
    type     = CharField
    libelle  = CharField
    montant  = DecimalField
    ordre    = PositiveSmallIntegerField
```

**Règles CNPS (Côte d'Ivoire)** :
- Part salariale : 6,3% du brut plafonné
- Part patronale : comptabilisée séparément
- Plafond : selon réglementation en vigueur

**Impact** :
- Modifier `BulletinPaieSerializer` → inclure les lignes
- Modifier `BulletinDetail.jsx` → afficher le détail des retenues
- `BulletinPaie.net` recalculé automatiquement

### 3.2 Export CNPS (priorité HAUTE)

**Endpoint** : `GET /api/rh/exports/cnps/?mois=&annee=`
- Format Excel normé CNPS CI
- Colonnes : N° CNPS, Nom, Prénom, Salaire brut, Part salariale, Part patronale
- Bouton « Export CNPS » dans `BulletinList.jsx`

### 3.3 Paiement journaliers — améliorations

- **Bordereau de paiement** : génération d'un justificatif pour un lot de journées payées
- **Filtre par projet** : sélection en masse des présences d'un même `projet_ref`
- **Seuil d'alerte** : notifier si un journalier a > 15 jours non payés

### 3.4 Historique des paiements

Ajouter une table `Paiement` traçant chaque règlement (qui, quand, montant, mode) lié à un bulletin ou un lot de présences.

---

## 4. Règles métier

### 4.1 Génération des bulletins
- Cible : employés `type_contrat="cdi"` et `statut="actif"`
- **Idempotent** : `get_or_create(employe, mois)` — ne duplique jamais
- MVP : brut = net (pas de retenues)
- Statut initial : `genere`

### 4.2 Paiement
- Bulletin : `statut` passe de `genere` à `paye`, `paye_le` = date du jour
- Journaliers : `PresenceJournaliere.paye_le` renseigné pour chaque présence sélectionnée
- MOO : `MissionMoo.paye_le` renseigné à la date du jour

### 4.3 Masse salariale (reporting)
- CDI, CDD : somme des `salaire_mensuel` des CDI, CDD actifs
- Journaliers : somme des `montant_du` du mois en cours
- Total = CDI, CDD + Journaliers

---

## 5. Routes et navigation

```
/rh                          → EmployeList (liste des employés)
/rh/paie/bulletins           → BulletinList (bulletin de paie CDI)
/rh/paie/bulletins/:id       → BulletinDetail (imprimable)
/rh/paie/journaliers         → PaiementsJournaliers
/rh/paie/missions            → MissionsMoo
```

---

## 6. Sécurité & permissions

| Rôle | Accès |
|------|-------|
| ADMIN | CRUD complet |
| DIRECTION | Lecture + validation |
| COMPTABLE | Bulletins, journaliers, MOO |
| RH | CRUD complet module RH |
| CHEF_CHANTIER | Indirect via pointage |
| LECTURE | Aucun |

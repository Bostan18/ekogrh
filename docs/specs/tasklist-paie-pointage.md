# Tasklist — Améliorations Paie & Pointage

> **Dernière mise à jour** : 2026-06-07
> **Effort total estimé** : 5-6 semaines

---

## Quick Wins (sans dépendance, faisables maintenant)

- [x] **QW1 · Autocomplete projet dans `Pointage.jsx`**
  *Remplacer l'input texte `projet_ref` par un `<select>` alimenté par `/api/projets/?statut=en_cours`*  
  Fichiers : `Pointage.jsx`, `PointageSemaine.jsx`  
  Effort : **XS** (~1h)

- [x] **QW2 · Badge « jours non payés » dans `EmployeList.jsx`**
  *Ajouter le champ `restant_a_payer` au `EmployeSerializer` liste et un badge rouge si > 0*  
  Fichiers : `serializers.py`, `EmployeList.jsx`  
  Effort : **XS** (~1h)

- [x] **QW3 · Export Excel des présences (hors paie)**
  *Endpoint `GET /api/rh/presences/export_presences/?mois=&annee=` + bouton dans Pointage*  
  Fichiers : `exports.py`, `views.py`, `Pointage.jsx`  
  Effort : **S** (~3h)

- [x] **QW4 · Tri alphabétique des journaliers dans la feuille**  
  *Vérifié : `order_by("nom", "prenom")` déjà présent dans `feuille_journee` et `feuille_semaine`*  
  Fichiers : `views.py`  
  Effort : **XS** (~30min)

---

## Phase 1 — Opérations terrain (Sprint 5)

### 1.1 Logs de travail à la tâche

- [x] **1.1.1 · Modèle `LogTravail`**
  *Créer le modèle dans `apps/operations/models.py` + migration*  
  Fichiers : `models.py`, `migrations/`  
  Effort : **M**

- [x] **1.1.2 · Serializer + ViewSet + Router**
  *`LogTravailSerializer`, `LogTravailViewSet`, route dans `urls.py`*  
  Fichiers : `serializers.py`, `views.py`, `urls.py`  
  Effort : **M**

- [x] **1.1.3 · Page `LogTravailList`**
  *Tableau filtrant par date/site/employé, CRUD*  
  Fichiers : `pages/operations/LogTravailList.jsx`  
  Effort : **M**

- [x] **1.1.4 · Formulaire `LogTravailForm`**
  *Sélecteurs employé/site/tâche, champs quantité + heures, rendement calculé*  
  Fichiers : `components/forms/LogTravailForm.jsx`  
  Effort : **M**

- [x] **1.1.5 · KPIs rendement dans Reporting**  
  *Endpoint KPIs : rendement moyen par tâche, par site*  
  Fichiers : `apps/reporting/views.py`, `Reporting.jsx`  
  Effort : **S**

### 1.2 Pointage par site

- [x] **1.2.1 · FK `projet` sur `PresenceJournaliere`**
  *Migration : ajouter `projet = FK(Projet)` en plus de `projet_ref` existant*  
  Fichiers : `models.py`, `migrations/`  
  Effort : **S**

- [x] **1.2.2 · Sélecteur projet dans `Pointage.jsx`**
  *Remplacer input texte `projet_ref` par autocomplete FK*  
  Fichiers : `Pointage.jsx`, `PointageSemaine.jsx`  
  Effort : **S**

- [x] **1.2.3 · Pointage groupé par site**
  *Endpoint `POST /presences/saisie_site/` : pointe tous les journaliers d'un site*  
  Fichiers : `views.py`, `Pointage.jsx`  
  Effort : **S**

### 1.3 Workflow de validation

- [x] **1.3.1 · Statut de pointage**  
  *Ajout `statut` (`brouillon`, `valide`, `cloture`) sur `PresenceJournaliere`*  
  Fichiers : `models.py`, `migrations/`  
  Effort : **S**

- [x] **1.3.2 · Blocage paiement si non validé**  
  *`marquer_payees()` rejette les présences `statut != valide`*  
  Fichiers : `views.py`  
  Effort : **XS**

- [x] **1.3.3 · Badge visuel du statut**  
  *Afficher le statut dans `Pointage.jsx` et `PointageSemaine.jsx`*  
  Fichiers : `Pointage.jsx`, `PointageSemaine.jsx`  
  Effort : **XS**

- [x] **1.3.4 · Clôture de période**  
  *Endpoint `POST /presences/cloturer/` : passe tout le mois en `cloture`*  
  Fichiers : `views.py`, bouton dans `PointageSemaine.jsx`  
  Effort : **S**

---

## Phase 2 — RH avancé (Sprint 8)

### 2.1 Retenues sur salaire

- [x] **2.1.1 · Modèle `LigneBulletin`**  
  *Créer le modèle + migration + `unique_together(bulletin, type)`*  
  Fichiers : `models.py`, `migrations/`  
  Effort : **S**

- [x] **2.1.2 · Calcul automatique CNPS**  
  *`BulletinPaie.save()` recalcule le net : brut - part salariale CNPS (6,3%)*  
  Fichiers : `models.py`  
  Effort : **S**

- [x] **2.1.3 · Data migration bulletins existants**  
  *Créer une `LigneBulletin` `salaire_base = brut` pour chaque bulletin existant*  
  Fichiers : `migrations/`  
  Effort : **XS**

- [x] **2.1.4 · Serializer nested `LigneBulletin`**  
  *Inclure les lignes dans `BulletinPaieSerializer` (read + write)*  
  Fichiers : `serializers.py`  
  Effort : **S**

- [x] **2.1.5 · Affichage détaillé dans `BulletinDetail.jsx`**  
  *Tableau des lignes (salaire base, primes, retenues, net)*  
  Fichiers : `BulletinDetail.jsx`  
  Effort : **M**

- [ ] **2.1.6 · Édition des lignes (admin)**  
  *Formulaire d'édition des lignes dans l'admin ou dans un modal dédié*  
  Fichiers : `admin.py` ou `BulletinDetail.jsx`  
  Effort : **S**

### 2.2 Export CNPS

- [x] **2.2.1 · Fonction `cnps_excel()`**  
  *Génération Excel normé CNPS CI : N° employeur, N° CNPS, Nom, Brut, Parts*  
  Fichiers : `exports.py`  
  Effort : **M**

- [x] **2.2.2 · Endpoint `GET /api/rh/exports/cnps/`**  
  *Paramètres `mois`, `annee`, retourne le fichier Excel*  
  Fichiers : `views.py`  
  Effort : **S**

- [x] **2.2.3 · Bouton « Export CNPS »**  
  *Dans `BulletinList.jsx`, à côté de « Générer la paie »*  
  Fichiers : `BulletinList.jsx`  
  Effort : **XS**

### 2.3 Alertes et anomalies

- [x] **2.3.1 · Endpoint `GET /api/rh/presences/anomalies/`**  
  *Retourne la liste des anomalies : 0h, absence prolongée, seuil dépassé*  
  Fichiers : `views.py`  
  Effort : **M**

- [x] **2.3.2 · Badge « Présent à 0h »**  
  *Dans `Pointage.jsx`, badge rouge si `present=true` et `heures=0`*  
  Fichiers : `Pointage.jsx`  
  Effort : **XS**

- [x] **2.3.3 · Badge « Aucun pointage depuis N jours »**  
  *Couvert par QW2 : badge jours non payés dans EmployeList*  
  Fichiers : `EmployeList.jsx`  
  Effort : **XS**

- [x] **2.3.4 · Badge « Seuil hebdo dépassé »**  
  *Dans `PointageSemaine.jsx`, alerte rouge si total semaine > 6 jours*  
  Fichiers : `PointageSemaine.jsx`  
  Effort : **XS**

---

## Phase 3 — Paiements avancés

- [x] **3.1.1 · Bordereau de paiement journaliers**  
  *Génération PDF/Excel d'un lot de journées après `marquer_payees`*  
  Fichiers : `exports.py`, `PaiementsJournaliers.jsx`  
  Effort : **S**

- [x] **3.2.1 · Modèle `Paiement`**  
  *Traçage : FK employé, date, montant, mode (espèces/virement), lot de présences*  
  Fichiers : `models.py`, `migrations/`  
  Effort : **S**

- [x] **3.2.2 · Enregistrement automatique au paiement**  
  *Créer un `Paiement` dans `marquer_payees()` et `marquer_paye()`*  
  Fichiers : `views.py`  
  Effort : **XS**

- [x] **3.2.3 · Onglet « Paiements » dans `EmployeDetail.jsx`**  
  *Historique des paiements par employé*  
  Fichiers : `EmployeDetail.jsx`  
  Effort : **S**

---

## Phase 4 — Pointage mobile (post-MVP)

- [x] **4.1 · Service Worker + cache offline**  
  *Stratégie cache-first pour `/feuille_journee/`*  
  Fichiers : `sw.js`, config Vite  
  Effort : **M**

- [x] **4.2 · File d'attente de synchronisation**  
  *IndexedDB pour stocker les saisies offline, push automatique au retour réseau*  
  Fichiers : `services/offlineQueue.js`  
  Effort : **L**

- [x] **4.3 · Interface mobile-first pour Pointage**  
  *Responsive cards + swipe, déjà fonctionnel avec le layout mobile existant*  
  Fichiers : `Pointage.jsx`  
  Effort : **M**

- [x] **4.4 · Photo géolocalisée**  
  *Capture photo avec géolocalisation dans le pointage mobile*  
  Fichiers : `Pointage.jsx`, endpoint upload  
  Effort : **M**

---

## Récapitulatif

| Section | Tâches | Effort |
|---------|--------|--------|
| Quick Wins | 4 | 0,5 j |
| Phase 1 (S5) | 12 | 9 j |
| Phase 2 (S8) | 13 | 7 j |
| Phase 3 | 4 | 2 j |
| Phase 4 | 4 | 6 j |
| **Total** | **37** | **~25 jours** |

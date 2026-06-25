from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.urls import reverse

from apps.rh.models import (
    BulletinPaie,
    Certification,
    Competence,
    CompetenceEmploye,
    Conge,
    Employe,
    HistoriqueContrat,
    LigneBulletin,
    MissionMoo,
    Paiement,
    PresenceJournaliere,
)


@pytest.mark.django_db
class TestEmployeAPI:
    def test_list_employes(self, auth_client):
        emp = Employe.objects.create(
            code="EMP-001",
            nom="Dupont",
            prenom="Jean",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("300000.00"),
        )
        url = reverse("employe-list")
        response = auth_client.get(url)
        assert response.status_code == 200
        # DRF paginated response has 'results' key
        assert "results" in response.data
        assert len(response.data["results"]) >= 1
        codes = [r["code"] for r in response.data["results"]]
        assert emp.code in codes

    def test_create_employe(self, auth_client):
        url = reverse("employe-list")
        payload = {
            "code": "EMP-002",
            "nom": "Koné",
            "prenom": "Awa",
            "type_contrat": "cdi",
            "poste": "Comptable",
            "statut": "actif",
            "salaire_mensuel": "350000.00",
        }
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 201
        assert response.data["code"] == "EMP-002"
        assert response.data["nom"] == "Koné"
        assert Employe.objects.filter(code="EMP-002").exists()


@pytest.mark.django_db
class TestPresenceAPI:
    @pytest.fixture
    def journaliers(self):
        emps = []
        for i, (nom, prenom, taux) in enumerate(
            [
                ("Bamba", "Fatou", "5000.00"),
                ("Coulibaly", "Siaka", "5500.00"),
            ],
            start=1,
        ):
            emp = Employe.objects.create(
                code=f"EMP-P{i:03d}",
                nom=nom,
                prenom=prenom,
                type_contrat="journalier",
                statut="actif",
                taux_journalier=Decimal(taux),
            )
            emps.append(emp)
        return emps

    def test_feuille_journee(self, auth_client, journaliers):
        url = reverse("presencejournaliere-feuille-journee")
        today = str(date.today())
        response = auth_client.get(url, {"date": today})
        assert response.status_code == 200
        assert "date" in response.data
        assert "presences" in response.data
        assert len(response.data["presences"]) == 2
        codes = {p["employe_code"] for p in response.data["presences"]}
        assert codes == {"EMP-P001", "EMP-P002"}

    def test_saisie_journee(self, auth_client, journaliers):
        url = reverse("presencejournaliere-saisie-journee")
        today = str(date.today())
        payload = {
            "date": today,
            "presences": [
                {
                    "employe_id": journaliers[0].id,
                    "present": True,
                    "heures_travaillees": "8.0",
                    "projet_ref": "Toupah",
                    "site_ref": "Plantation",
                },
                {
                    "employe_id": journaliers[1].id,
                    "present": True,
                    "heures_travaillees": "7.0",
                },
            ],
        }
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 200
        assert len(response.data) == 2
        # Les montants doivent être calculés
        montants = [p["montant_du"] for p in response.data]
        assert "5000.00" in montants
        assert "5500.00" in montants

    def test_valider_presences(self, auth_client, journaliers):
        today = date.today()
        p1 = PresenceJournaliere.objects.create(
            employe=journaliers[0],
            date=today,
            present=True,
            statut="brouillon",
        )
        p2 = PresenceJournaliere.objects.create(
            employe=journaliers[1],
            date=today,
            present=True,
            statut="brouillon",
        )

        url = reverse("presencejournaliere-valider")
        response = auth_client.post(url, {"ids": [p1.id, p2.id]}, format="json")
        assert response.status_code == 200
        assert response.data["validees"] == 2

        p1.refresh_from_db()
        p2.refresh_from_db()
        assert p1.statut == "valide"
        assert p2.statut == "valide"


@pytest.mark.django_db
class TestBulletinAPI:
    @pytest.fixture
    def cdi_employe(self):
        return Employe.objects.create(
            code="EMP-CD01",
            nom="Diallo",
            prenom="Aminata",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("200000.00"),
        )

    def test_generer_bulletins(self, auth_client, cdi_employe):
        url = reverse("bulletinpaie-generer")
        payload = {
            "mois": 6,
            "annee": 2026,
            "employe_ids": [cdi_employe.id],
        }
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 200
        assert response.data["generes"] == 1
        assert response.data["total_employes"] == 1

        bulletin = BulletinPaie.objects.get(employe=cdi_employe, mois=date(2026, 6, 1))
        lignes = bulletin.lignes.all()
        # Avec le nouveau calcul CI complet
        assert lignes.count() >= 8

    def test_generer_bulletins_sans_ids_echoue(self, auth_client, cdi_employe):
        url = reverse("bulletinpaie-generer")
        payload = {"mois": 6, "annee": 2026}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 400
        assert "employe_ids" in str(response.data)


@pytest.mark.django_db
class TestCongeAPI:
    @pytest.fixture
    def employe(self):
        return Employe.objects.create(
            code="EMP-C01",
            nom="Koné",
            prenom="Seydou",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("250000.00"),
        )

    def test_list_conges(self, auth_client, employe):
        Conge.objects.create(
            employe=employe,
            type_conge="conges_payes",
            date_debut=date(2026, 7, 1),
            date_fin=date(2026, 7, 15),
            motif="Congés annuels",
        )
        url = reverse("conge-list")
        response = auth_client.get(url)
        assert response.status_code == 200
        assert "results" in response.data
        assert len(response.data["results"]) >= 1

    def test_approuver_conge(self, auth_client, employe):
        conge = Conge.objects.create(
            employe=employe,
            type_conge="conges_payes",
            date_debut=date(2026, 7, 1),
            date_fin=date(2026, 7, 15),
            motif="Congés annuels",
        )
        url = reverse("conge-approuver", args=[conge.id])
        response = auth_client.post(url, {}, format="json")
        assert response.status_code == 200
        assert response.data["statut"] == "approuve"

        conge.refresh_from_db()
        assert conge.statut == "approuve"
        assert conge.approuve_par == "testuser"
        assert conge.approuve_le is not None

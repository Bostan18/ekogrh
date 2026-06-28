from datetime import date
from decimal import Decimal

import pytest
from django.urls import reverse

from apps.operations.models import LogTravail, Site, TacheCatalogue
from apps.rh.models import Employe


@pytest.mark.django_db
class TestSiteModel:
    def test_create_site(self):
        site = Site.objects.create(
            nom="Plantation Toupah",
            type_site="parcelle",
            localisation="Toupah",
        )
        assert site.code.startswith("SIT-")
        assert str(site) == f"{site.code} — Plantation Toupah"

    def test_generate_code(self):
        s1 = Site.objects.create(nom="Site A")
        s2 = Site.objects.create(nom="Site B")
        assert s2.code != s1.code


@pytest.mark.django_db
class TestSiteAPI:
    def test_list_sites(self, auth_client):
        Site.objects.create(nom="Chantier A", type_site="chantier")
        Site.objects.create(nom="Parcelle B", type_site="parcelle")
        url = reverse("site-list")
        response = auth_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) >= 2

    def test_create_site(self, auth_client):
        url = reverse("site-list")
        payload = {"nom": "Nouveau site", "type_site": "chantier"}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 201
        assert response.data["code"].startswith("SIT-")


@pytest.mark.django_db
class TestTacheCatalogueModel:
    def test_create_tache(self):
        tache = TacheCatalogue.objects.create(
            libelle="Désherbage",
            type_objectif="surface",
            unite_label="m²",
            tarif_reference=Decimal("500.00"),
            seuil=Decimal("15.00"),
        )
        assert tache.code.startswith("TAC-")
        assert tache.seuil == Decimal("15.00")

    def test_tache_defaults(self):
        tache = TacheCatalogue.objects.create(
            libelle="Tâche simple",
            type_objectif="forfait",
            unite_label="forfait",
        )
        assert tache.actif is True
        assert tache.seuil == 0


@pytest.mark.django_db
class TestLogTravailModel:
    @pytest.fixture
    def site_tache_employe(self):
        emp = Employe.objects.create(
            code="EMP-LOG-01",
            nom="Log",
            prenom="Test",
            type_contrat="journalier",
            statut="actif",
            taux_journalier=Decimal("5000.00"),
        )
        site = Site.objects.create(nom="Site test", type_site="chantier")
        tache = TacheCatalogue.objects.create(
            libelle="Tâche test",
            type_objectif="surface",
            unite_label="m²",
            tarif_reference=Decimal("1000.00"),
        )
        return emp, site, tache

    def test_rendement_calcule(self, site_tache_employe):
        emp, site, tache = site_tache_employe
        log = LogTravail.objects.create(
            employe=emp,
            date=date.today(),
            site=site,
            tache=tache,
            objectif_realise=Decimal("50.00"),
            duree_heures=Decimal("8.0"),
        )
        # rendement = 50 / 8 = 6.25
        assert log.rendement == Decimal("6.25")

    def test_rendement_zero_si_pas_dheures(self, site_tache_employe):
        emp, site, tache = site_tache_employe
        log = LogTravail.objects.create(
            employe=emp,
            date=date.today(),
            site=site,
            tache=tache,
            objectif_realise=Decimal("50.00"),
            duree_heures=Decimal("0"),
        )
        assert log.rendement == 0


@pytest.mark.django_db
class TestLogTravailAPI:
    @pytest.fixture
    def setup(self):
        emp = Employe.objects.create(
            code="EMP-LOG-02",
            nom="API",
            prenom="Test",
            type_contrat="journalier",
            statut="actif",
            taux_journalier=Decimal("5000.00"),
        )
        site = Site.objects.create(nom="Site API", type_site="chantier")
        tache = TacheCatalogue.objects.create(
            libelle="Tâche API",
            type_objectif="unite",
            unite_label="u",
            tarif_reference=Decimal("2000.00"),
        )
        return emp, site, tache

    def test_create_log(self, auth_client, setup):
        emp, site, tache = setup
        url = reverse("logtravail-list")
        payload = {
            "employe": emp.id,
            "date": str(date.today()),
            "site": site.id,
            "tache": tache.id,
            "objectif_realise": "30.00",
            "duree_heures": "6.0",
        }
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 201
        assert response.data["rendement"] == "5.00"

    def test_task_payroll_endpoint(self, auth_client, setup):
        emp, site, tache = setup
        LogTravail.objects.create(
            employe=emp,
            date=date.today(),
            site=site,
            tache=tache,
            objectif_realise=Decimal("20.00"),
            duree_heures=Decimal("8.0"),
        )
        url = reverse("logtravail-task-payroll")
        response = auth_client.get(url, {"site": site.id})
        assert response.status_code == 200
        assert "lignes" in response.data
        assert response.data["total"] >= 0

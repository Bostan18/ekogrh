import pytest
from datetime import date, timedelta
from decimal import Decimal

from apps.rh.models import (
    Employe,
    PresenceJournaliere,
    BulletinPaie,
    LigneBulletin,
    Conge,
    Certification,
    Competence,
    CompetenceEmploye,
    MissionMoo,
    Paiement,
    HistoriqueContrat,
)


@pytest.mark.django_db
class TestEmploye:

    def test_create_employe(self):
        emp = Employe.objects.create(
            code="EMP-001",
            nom="Dupont",
            prenom="Jean",
            type_contrat="cdi",
            poste="Chauffeur",
            statut="actif",
            salaire_mensuel=Decimal("300000.00"),
            taux_journalier=Decimal("15000.00"),
            numero_cnps="CNPS-12345",
        )
        assert emp.code == "EMP-001"
        assert emp.nom == "Dupont"
        assert emp.prenom == "Jean"
        assert emp.type_contrat == "cdi"
        assert emp.statut == "actif"
        assert emp.salaire_mensuel == Decimal("300000.00")
        assert emp.taux_journalier == Decimal("15000.00")
        assert str(emp) == "EMP-001 — Dupont Jean"

    def test_nom_complet(self):
        emp = Employe(nom="Koné", prenom="Awa")
        assert emp.nom_complet == "Koné Awa"

    def test_soft_delete(self):
        emp = Employe.objects.create(
            code="EMP-002",
            nom="Traoré",
            prenom="Moussa",
            type_contrat="cdd",
            statut="actif",
            salaire_mensuel=Decimal("250000.00"),
        )
        assert not emp.is_deleted
        emp.is_deleted = True
        emp.save()
        emp.refresh_from_db()
        assert emp.is_deleted
        # Vérifie que l'employé n'apparaît plus dans le queryset non supprimé
        assert Employe.objects.filter(is_deleted=False, code="EMP-002").count() == 0


@pytest.mark.django_db
class TestPresenceJournaliere:

    def test_auto_calculates_montant_du(self):
        emp = Employe.objects.create(
            code="EMP-003",
            nom="Bamba",
            prenom="Fatou",
            type_contrat="journalier",
            statut="actif",
            taux_journalier=Decimal("5000.00"),
        )
        presence = PresenceJournaliere.objects.create(
            employe=emp,
            date=date.today(),
            present=True,
            heures_travaillees=Decimal("8.0"),
        )
        assert presence.montant_du == Decimal("5000.00")

    def test_montant_du_zero_if_not_present(self):
        emp = Employe.objects.create(
            code="EMP-004",
            nom="Coulibaly",
            prenom="Siaka",
            type_contrat="journalier",
            statut="actif",
            taux_journalier=Decimal("6000.00"),
        )
        presence = PresenceJournaliere.objects.create(
            employe=emp,
            date=date.today(),
            present=False,
        )
        assert presence.montant_du == Decimal("0.00")

    def test_unique_together_employe_date(self):
        emp = Employe.objects.create(
            code="EMP-005",
            nom="Ouattara",
            prenom="Karamoko",
            type_contrat="journalier",
            statut="actif",
            taux_journalier=Decimal("5000.00"),
        )
        today = date.today()
        PresenceJournaliere.objects.create(employe=emp, date=today)
        with pytest.raises(Exception):
            PresenceJournaliere.objects.create(employe=emp, date=today)


@pytest.mark.django_db
class TestBulletinPaie:

    def test_save_generates_lignes_with_cnps(self):
        emp = Employe.objects.create(
            code="EMP-006",
            nom="Diallo",
            prenom="Aminata",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("200000.00"),
        )
        bulletin = BulletinPaie.objects.create(
            employe=emp,
            mois=date(2026, 6, 1),
            brut=Decimal("200000.00"),
        )
        lignes = bulletin.lignes.all()
        assert lignes.count() == 3

        salaire_base = lignes.get(type_ligne="salaire_base")
        assert salaire_base.montant == Decimal("200000.00")

        retenue_cnps = lignes.get(type_ligne="retenue_cnps")
        # 200000 * 0.063 = 12600
        assert retenue_cnps.montant == Decimal("-12600.00")

        net_a_payer = lignes.get(type_ligne="net_a_payer")
        assert net_a_payer.montant == Decimal("187400.00")

        bulletin.refresh_from_db()
        assert bulletin.net == Decimal("187400.00")

    def test_unique_together_employe_mois(self):
        emp = Employe.objects.create(
            code="EMP-007",
            nom="Touré",
            prenom="Bakary",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("300000.00"),
        )
        BulletinPaie.objects.create(
            employe=emp, mois=date(2026, 6, 1), brut=Decimal("300000.00")
        )
        with pytest.raises(Exception):
            BulletinPaie.objects.create(
                employe=emp, mois=date(2026, 6, 1), brut=Decimal("300000.00")
            )


@pytest.mark.django_db
class TestConge:

    def test_nb_jours_property(self):
        emp = Employe.objects.create(
            code="EMP-008",
            nom="Koné",
            prenom="Seydou",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("250000.00"),
        )
        conge = Conge.objects.create(
            employe=emp,
            type_conge="conges_payes",
            date_debut=date(2026, 6, 1),
            date_fin=date(2026, 6, 15),
            motif="Congés annuels",
        )
        assert conge.nb_jours == 15

    def test_nb_jours_same_day(self):
        emp = Employe.objects.create(
            code="EMP-009",
            nom="Yéo",
            prenom="Mariam",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("220000.00"),
        )
        conge = Conge.objects.create(
            employe=emp,
            date_debut=date(2026, 6, 1),
            date_fin=date(2026, 6, 1),
        )
        assert conge.nb_jours == 1

    def test_nb_jours_returns_zero_if_no_dates(self):
        emp = Employe.objects.create(
            code="EMP-010",
            nom="Soro",
            prenom="Yacouba",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("200000.00"),
        )
        conge = Conge(employe=emp)
        assert conge.nb_jours == 0


@pytest.mark.django_db
class TestCertification:

    @pytest.fixture
    def employe(self):
        return Employe.objects.create(
            code="EMP-011",
            nom="Fofana",
            prenom="Ibrahim",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("280000.00"),
        )

    def test_statut_valide(self, employe):
        cert = Certification.objects.create(
            employe=employe,
            libelle="CACES R482",
            organisme="AFPA",
            date_obtention=date(2025, 1, 1),
            date_expiration=date.today() + timedelta(days=365),
        )
        assert cert.statut == "valide"

    def test_statut_expiree(self, employe):
        cert = Certification.objects.create(
            employe=employe,
            libelle="Habilitation électrique",
            organisme="INRS",
            date_obtention=date(2024, 1, 1),
            date_expiration=date.today() - timedelta(days=1),
        )
        assert cert.statut == "expiree"

    def test_statut_bientot_expiree(self, employe):
        cert = Certification.objects.create(
            employe=employe,
            libelle="SST",
            organisme="CNAM",
            date_obtention=date(2025, 6, 1),
            date_expiration=date.today() + timedelta(days=30),
        )
        assert cert.statut == "bientot_expiree"

    def test_statut_bientot_expiree_limite_60_jours(self, employe):
        cert = Certification.objects.create(
            employe=employe,
            libelle="PRAP",
            organisme="INRS",
            date_obtention=date(2025, 1, 1),
            date_expiration=date.today() + timedelta(days=60),
        )
        assert cert.statut == "bientot_expiree"

    def test_statut_sans_expiration(self, employe):
        cert = Certification.objects.create(
            employe=employe,
            libelle="Diplôme ingénieur",
            organisme="INP-HB",
            date_obtention=date(2020, 9, 1),
            date_expiration=None,
        )
        assert cert.statut == "sans_expiration"

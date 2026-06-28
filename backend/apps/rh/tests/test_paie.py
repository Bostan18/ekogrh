from decimal import Decimal

import pytest

from apps.rh.models import Employe, RetenueCategorie
from apps.rh.paie import calculer_bulletin, calculer_cn, calculer_igr, get_bareme_cn_default


@pytest.mark.django_db
class TestCalculerCN:
    def test_cn_premiere_tranche(self):
        """RNI <= 300k : 1.5%, pas de fixe."""
        cn = calculer_cn(200_000)
        assert cn == 3000.0

    def test_cn_deuxieme_tranche(self):
        """RNI entre 300k et 600k : 3% + 4500 fixe."""
        cn = calculer_cn(400_000)
        assert cn == pytest.approx(4500 + (400_000 - 300_000) * 0.03)

    def test_cn_troisieme_tranche(self):
        """RNI > 600k : 5% + 13500 fixe."""
        cn = calculer_cn(1_000_000)
        assert cn == pytest.approx(13500 + (1_000_000 - 600_000) * 0.05)

    def test_cn_rni_zero(self):
        assert calculer_cn(0) == 0.0

    def test_cn_at_seuil_exact(self):
        cn = calculer_cn(300_000)
        assert cn == 4500.0


@pytest.mark.django_db
class TestCalculerIGR:
    def test_igr_celibataire_sans_enfant(self):
        """1 part, RNI 200k : (200k/1 * 10%) - 15k = 5k."""
        igr = calculer_igr(200_000, nb_parts=2)
        assert igr == pytest.approx(5000.0)

    def test_igr_marie_2_enfants(self):
        """4 parts, RNI 500k : (500k/4 * 10%) - 15k = 0 (car < 0)."""
        igr = calculer_igr(500_000, nb_parts=4)
        assert igr == 0.0

    def test_igr_ne_pas_depasser_zero(self):
        igr = calculer_igr(50_000, nb_parts=1)
        assert igr == 0.0

    def test_igr_abattement_supprime(self):
        """RNI 50k, part 1 : normalement (50k*10%)-15k = -10k => 0."""
        igr = calculer_igr(50_000, nb_parts=1, abattement=0)
        assert igr == 5000.0

    def test_igr_taux_personnalise(self):
        igr = calculer_igr(300_000, nb_parts=1, taux=0.05, abattement=0)
        assert igr == 15000.0


@pytest.mark.django_db
class TestCalculerBulletin:
    def test_cdi_salaire_minimum(self):
        emp = Employe.objects.create(
            code="EMP-TST-01",
            nom="Test",
            prenom="User",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("100000.00"),
            nb_enfants=0,
            statut_marital="celibataire",
            date_entree="2024-01-01",
        )
        result = calculer_bulletin(emp)
        assert result.brut > 100_000  # SB + anciennete + logement + alloc
        assert result.net > 0
        assert result.net < result.brut
        assert result.cnps_salarie > 0
        assert result.total_its > 0

    def test_cdi_avec_enfants(self):
        emp = Employe.objects.create(
            code="EMP-TST-02",
            nom="Parent",
            prenom="Test",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("300000.00"),
            nb_enfants=3,
            statut_marital="marie",
            date_entree="2020-06-15",
        )
        result = calculer_bulletin(emp)
        # Avec 3 enfants + marie = 6 parts fiscales, IGR devrait etre faible ou nul
        assert result.igr >= 0
        # Allocations familiales : 3 * 3500 = 10500
        assert result.brut >= 300_000 + 10_500
        # Cout employeur > brut
        assert result.cout_employeur > result.brut

    def test_employe_sans_salaire_leve_erreur(self):
        emp = Employe.objects.create(
            code="EMP-TST-03",
            nom="Zero",
            prenom="Salaire",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("0"),
        )
        with pytest.raises(ValueError, match="Salaire mensuel requis"):
            calculer_bulletin(emp)

    def test_avec_config_retenue(self):
        config = RetenueCategorie.objects.create(
            type_contrat="cdi",
            taux_cnps_salarial=Decimal("0.0630"),
            taux_cnps_patronal_retraite=Decimal("0.0770"),
            taux_cnps_patronal_pf=Decimal("0.0575"),
            taux_cnps_patronal_at=Decimal("0.0200"),
            plafond_cnps=Decimal("3375000.00"),
            plafond_pf_at=Decimal("70000.00"),
            taux_is=Decimal("0.0150"),
            taux_frais_pro=Decimal("0.2000"),
            bareme_cn=get_bareme_cn_default(),
            taux_igr=Decimal("0.1000"),
            abattement_igr=Decimal("15000.00"),
        )
        emp = Employe.objects.create(
            code="EMP-TST-04",
            nom="Config",
            prenom="Test",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("200000.00"),
            nb_enfants=0,
            statut_marital="celibataire",
            date_entree="2023-01-01",
        )
        result = calculer_bulletin(emp, config=config)
        assert result.brut > 0
        assert result.net > 0
        assert result.total_retenues > 0

    def test_salaire_eleve_plafond_cnps(self):
        emp = Employe.objects.create(
            code="EMP-TST-05",
            nom="Haut",
            prenom="Salaire",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("5000000.00"),
            nb_enfants=0,
            statut_marital="celibataire",
            date_entree="2020-01-01",
        )
        result = calculer_bulletin(emp)
        # CNPS plafonne a 3375000 * 6.3%
        assert result.cnps_salarie <= 3375000 * 0.063
        # IGR positif avec un tel revenu
        assert result.igr > 0

    def test_heures_sup_incluses(self):
        emp = Employe.objects.create(
            code="EMP-TST-06",
            nom="Sup",
            prenom="Heures",
            type_contrat="cdi",
            statut="actif",
            salaire_mensuel=Decimal("200000.00"),
            nb_enfants=0,
            statut_marital="celibataire",
            date_entree="2023-01-01",
        )
        result_avec_hs = calculer_bulletin(emp, heures_sup=10)
        result_sans = calculer_bulletin(emp)
        assert result_avec_hs.brut > result_sans.brut

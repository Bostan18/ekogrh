"""
Service de calcul de paie — conforme Code du Travail CI (Loi n°2015-532)
et CNPS 2025. Implémente la réforme ITS 2024 (IS + CN + IGR).
"""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from typing import Optional

# ── Constantes légales CI ──────────────────────────────────────────
from apps.core.constants import ALLOC_ENFANT, HEURES_MOIS, SMIG


def _r(val, decimals=0):
    """Arrondi bancaire (ROUND_HALF_UP)."""
    if isinstance(val, Decimal):
        return val.quantize(
            Decimal("1") if decimals == 0 else Decimal(f"0.{'0' * (decimals - 1)}1"),
            rounding=ROUND_HALF_UP,
        )
        return val.quantize(
            Decimal("1") if decimals == 0 else Decimal(f"0.{'0' * (decimals - 1)}1"),
            rounding=ROUND_HALF_UP,
        )
    return round(val, decimals)


@dataclass
class ResultatPaie:
    """Résultat complet du calcul d'un bulletin de paie CI."""

    brut: float
    cnps_salarie: float
    base_imposable: float
    deduction_frais: float
    rni: float
    is_impot: float
    cn: float
    igr: float
    total_its: float
    total_retenues: float
    net: float
    # Charges patronales (info employeur uniquement)
    cnps_pat_retr: float
    cnps_pat_pf: float
    cnps_pat_at: float
    cout_employeur: float


def get_bareme_cn_default():
    """Barème CN progressif par défaut (réforme ITS 2024).

    Le dernier seuil est None = pas de limite supérieure.
    """
    return [
        {"seuil": 300_000, "taux": 0.015, "fixe": 0},
        {"seuil": 600_000, "taux": 0.03, "fixe": 4_500},
        {"seuil": None, "taux": 0.05, "fixe": 13_500},
    ]


def calculer_cn(rni: float, bareme: Optional[list] = None) -> float:
    """Calcule la Contribution Nationale selon le barème progressif.

    Chaque tranche a : seuil (None = pas de limite), taux, fixe.
    """
    if bareme is None:
        bareme = get_bareme_cn_default()

    seuil_prec = 0.0
    for tranche in bareme:
        seuil = tranche["seuil"]
        if seuil is None or rni <= seuil:
            return _r(tranche["fixe"] + (rni - seuil_prec) * tranche["taux"])
        seuil_prec = seuil
    return 0.0


def calculer_igr(
    rni: float, nb_parts: int, taux: float = 0.10, abattement: float = 15_000
) -> float:
    """Calcule l'IGR selon le quotient familial."""
    if nb_parts <= 0:
        nb_parts = 1
    return max(0, _r((rni / nb_parts) * taux - abattement))


def calculer_bulletin(
    employe,
    heures_sup: float = 0,
    prime_rendement: float = 0,
    indemnite_transport: float = 0,
    config=None,
) -> ResultatPaie:
    """
    Calcule un bulletin de paie complet conforme CI.

    Args:
        employe: instance Employe (doit avoir salaire_mensuel, nb_enfants, statut_marital, date_entree)
        heures_sup: nombre d'heures supplémentaires
        prime_rendement: montant prime de rendement
        indemnite_transport: forfait transport
        config: instance RetenueCategorie (si None, utilise les défauts légaux)
    """
    from datetime import date

    sb = float(employe.salaire_mensuel or 0)
    if sb <= 0:
        raise ValueError("Salaire mensuel requis")

    # ── Défauts légaux si pas de config ──
    taux_cnps_sal = 0.063
    plaf_cnps = 3_375_000.0
    taux_cnps_pat_r = 0.077
    taux_cnps_pat_pf = 0.0575
    taux_cnps_pat_at = 0.02
    plaf_pf_at = 70_000.0
    taux_is = 0.015
    taux_frais = 0.20
    bareme_cn = get_bareme_cn_default()
    taux_igr = 0.10
    abatt_igr = 15_000.0

    if config:
        taux_cnps_sal = float(config.taux_cnps_salarial)
        plaf_cnps = float(config.plafond_cnps)
        taux_cnps_pat_r = float(config.taux_cnps_patronal_retraite)
        taux_cnps_pat_pf = float(config.taux_cnps_patronal_pf)
        taux_cnps_pat_at = float(config.taux_cnps_patronal_at)
        plaf_pf_at = float(config.plafond_pf_at)
        taux_is = float(config.taux_is)
        taux_frais = float(config.taux_frais_pro)
        if config.bareme_cn:
            bareme_cn = config.bareme_cn
        taux_igr = float(config.taux_igr)
        abatt_igr = float(config.abattement_igr)

    # ── Gains ──
    # Prime d'ancienneté (2% par année)
    annees = 0
    if employe.date_entree:
        annees = (date.today() - employe.date_entree).days // 365
    prime_anc = _r(sb * annees * 0.02)

    # Indemnité logement (30% du SB)
    indemnite_log = _r(sb * 0.30)

    # Heures supplémentaires (taux horaire × 1,25)
    hs_montant = _r((sb / HEURES_MOIS) * 1.25 * heures_sup) if heures_sup > 0 else 0.0

    # Allocations familiales CNPS
    alloc_fam = ALLOC_ENFANT * (employe.nb_enfants or 0)

    brut = _r(
        sb
        + prime_anc
        + indemnite_transport
        + indemnite_log
        + hs_montant
        + prime_rendement
        + alloc_fam
    )

    # ── CNPS salarié (6,3% plafonné) ──
    assiette_cnps = min(brut, plaf_cnps)
    cnps_sal = _r(assiette_cnps * taux_cnps_sal)

    # ── ITS (IS + CN + IGR) ──
    base_imp = _r(brut - cnps_sal)
    deduction = _r(base_imp * taux_frais)
    rni = _r(base_imp - deduction)

    is_impot = _r(rni * taux_is)

    # CN progressif avec seuil précédent
    cn = 0.0
    seuil_prec = 0.0
    for tranche in bareme_cn:
        seuil = tranche["seuil"]
        if seuil is None or rni <= seuil:
            cn = _r(tranche["fixe"] + (rni - seuil_prec) * tranche["taux"])
            break
        seuil_prec = seuil
    if cn == 0.0 and bareme_cn:
        # Au-dessus du dernier seuil (ne devrait pas arriver avec None)
        last = bareme_cn[-1]
        cn = _r(last["fixe"] + (rni - seuil_prec) * last["taux"])

    igr = calculer_igr(rni, employe.parts_fiscales(), taux_igr, abatt_igr)

    total_its = _r(is_impot + cn + igr)
    total_ret = _r(cnps_sal + total_its)
    net = _r(brut - total_ret)

    # ── Charges patronales (info employeur) ──
    cnps_pat_r = _r(min(brut, plaf_cnps) * taux_cnps_pat_r)
    cnps_pat_pf = _r(min(brut, plaf_pf_at) * taux_cnps_pat_pf)
    cnps_pat_at = _r(min(brut, plaf_pf_at) * taux_cnps_pat_at)
    cout_emp = _r(brut + cnps_pat_r + cnps_pat_pf + cnps_pat_at)

    return ResultatPaie(
        brut=brut,
        cnps_salarie=cnps_sal,
        base_imposable=base_imp,
        deduction_frais=deduction,
        rni=rni,
        is_impot=is_impot,
        cn=cn,
        igr=igr,
        total_its=total_its,
        total_retenues=total_ret,
        net=net,
        cnps_pat_retr=cnps_pat_r,
        cnps_pat_pf=cnps_pat_pf,
        cnps_pat_at=cnps_pat_at,
        cout_employeur=cout_emp,
    )

import { Link } from "react-router-dom";
import { MOIS_NOMS_1 } from "../../utils/constants";

export default function PayrollSummary({ paieResume, masseSalariale }) {
    return (
        <div className="card-padded">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-section-title text-ink">
                    Paie — {MOIS_NOMS_1[paieResume?.mois]} {paieResume?.annee}
                </h3>
                <Link to="/bulletins" className="text-body-sm font-semibold text-forest-500 hover:text-forest-600">
                    Voir tout →
                </Link>
            </div>
            <div className="space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-border-light">
                    <span className="text-body-sm text-ink-secondary">Bulletins générés</span>
                    <span className="text-2xl font-bold text-ink">{paieResume?.nbBulletins ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border-light">
                    <span className="text-body-sm text-ink-secondary">Masse salariale</span>
                    <span className="text-2xl font-bold text-forest-600">
                        {masseSalariale ? `${masseSalariale.toLocaleString()} FCFA` : "—"}
                    </span>
                </div>
            </div>
            <Link to="/bulletins" className="btn-primary w-full mt-5 text-sm justify-center">
                Générer la paie de {MOIS_NOMS_1[paieResume?.mois]}
            </Link>
        </div>
    );
}

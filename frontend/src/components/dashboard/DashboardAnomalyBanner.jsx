import { Link } from "react-router-dom";
import { ExclamationIcon } from "../Icon";

export default function DashboardAnomalyBanner({ nbAnomalies }) {
    if (!nbAnomalies || nbAnomalies <= 0) return null;

    return (
        <div className="flex items-center justify-between bg-gold-50 border border-gold-200 rounded-card p-4 mb-6">
            <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gold-100 text-gold-600">
                    <ExclamationIcon className="w-4 h-4" />
                </span>
                <div>
                    <p className="text-body-sm font-semibold text-gold-700">
                        {nbAnomalies} anomalie{nbAnomalies > 1 ? "s" : ""} détectée
                        {nbAnomalies > 1 ? "s" : ""}
                    </p>
                    <p className="text-caption text-gold-600">
                        Vérifiez les pointages pour les résoudre
                    </p>
                </div>
            </div>
            <Link to="/pointage" className="btn-primary text-sm">
                Voir les anomalies
            </Link>
        </div>
    );
}

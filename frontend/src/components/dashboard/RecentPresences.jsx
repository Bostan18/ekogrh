import { Link } from "react-router-dom";

export default function RecentPresences({ presences }) {
    return (
        <div className="card-padded">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-section-title text-ink">Derniers pointages</h3>
                <Link to="/pointage" className="text-body-sm font-semibold text-forest-500 hover:text-forest-600">
                    Voir tout →
                </Link>
            </div>
            {presences.length > 0 ? (
                <div className="space-y-1">
                    {presences.map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border-light last:border-0">
                            <div className="min-w-0">
                                <p className="text-body-sm font-semibold text-ink truncate">
                                    {p.employe_nom || `Employé #${p.employe}`}
                                </p>
                                <p className="text-caption text-sand-500">
                                    {p.date}{p.heures_travaillees ? ` · ${p.heures_travaillees}h` : ""}
                                </p>
                            </div>
                            <span className={`badge flex-shrink-0 ${p.present ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                                {p.present ? "Présent" : "Absent"}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-body-sm text-sand-500 mb-4">Aucun pointage enregistré.</p>
                    <Link to="/pointage" className="btn-primary text-sm">Effectuer un pointage</Link>
                </div>
            )}
        </div>
    );
}

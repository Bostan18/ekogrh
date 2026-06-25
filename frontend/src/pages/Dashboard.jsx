import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
    UsersIcon,
    ClipboardIcon,
    ExclamationIcon,
    CurrencyIcon,
    DocumentIcon,
    UmbrellaIcon,
} from "../components/Icon";
import OnboardingChecklist from "../components/OnboardingChecklist";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentPresences, setRecentPresences] = useState([]);
    const [paieResume, setPaieResume] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [employes, presences, anomalies, recentPres, paie] =
                    await Promise.all([
                        api.get("/rh/employes/?statut=actif"),
                        api.get("/rh/presences/"),
                        api.get("/rh/presences/anomalies/"),
                        api.get("/rh/presences/?ordering=-date&page_size=5"),
                        api.get("/rh/bulletins/?page_size=1"),
                    ]);

                const results = employes.data.results || employes.data;
                const masse = results.reduce(
                    (sum, e) => sum + (parseFloat(e.salaire_mensuel) || 0),
                    0,
                );

                setStats({
                    nbEmployes: employes.data.count,
                    nbPresences: presences.data.count,
                    nbAnomalies: anomalies.data.total,
                    masseSalariale: masse,
                });

                const recentList = (
                    recentPres.data.results || recentPres.data
                ).slice(0, 5);
                setRecentPresences(recentList);

                const today = new Date();
                setPaieResume({
                    mois: today.getMonth() + 1,
                    annee: today.getFullYear(),
                    nbBulletins: paie.data.count || 0,
                });
            } catch (err) {
                console.error("Erreur chargement dashboard", err);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const kpis = [
        {
            label: "Employés actifs",
            value: stats?.nbEmployes ?? "—",
            Icon: UsersIcon,
            color: "bg-forest-50 text-forest-700",
            to: "/employes",
        },
        {
            label: "Pointages du jour",
            value: stats?.nbPresences ?? "—",
            Icon: ClipboardIcon,
            color: "bg-gold-50 text-gold-700",
            to: "/pointage",
        },
        {
            label: "Anomalies",
            value: stats?.nbAnomalies ?? "—",
            Icon: ExclamationIcon,
            color:
                stats?.nbAnomalies > 0
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700",
            to: stats?.nbAnomalies > 0 ? "/pointage" : null,
        },
        {
            label: "Masse salariale",
            value: stats?.masseSalariale
                ? `${stats.masseSalariale.toLocaleString()} FCFA`
                : "— FCFA",
            Icon: CurrencyIcon,
            color: "bg-blue-50 text-blue-700",
            to: "/bulletins",
        },
    ];

    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-display font-bold text-ink mb-6">
                    Tableau de bord
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-card p-5 border border-sand-100 animate-pulse"
                        >
                            <div className="w-10 h-10 rounded-lg bg-sand-100 mb-3" />
                            <div className="h-7 bg-sand-100 rounded w-20 mb-1" />
                            <div className="h-4 bg-sand-50 rounded w-28" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const moisNoms = [
        "",
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ];

    return (
        <div>
            <h2 className="text-2xl font-display font-bold text-ink mb-6">
                Tableau de bord
            </h2>

            <OnboardingChecklist />

            {/* Bandeau d'alerte */}
            {stats?.nbAnomalies > 0 && (
                <div className="flex items-center justify-between bg-gold-50 border border-gold-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gold-100 text-gold-700">
                            <ExclamationIcon className="w-4 h-4" />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-gold-800">
                                {stats.nbAnomalies} anomalie
                                {stats.nbAnomalies > 1 ? "s" : ""} détectée
                                {stats.nbAnomalies > 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-gold-600">
                                Vérifiez les pointages pour les résoudre
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/pointage"
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Voir les anomalies
                    </Link>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpis.map((kpi) => {
                    const content = (
                        <div className="flex items-center justify-between mb-3">
                            <span
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${kpi.color || ""}`}
                            >
                                <kpi.Icon className="w-5 h-5" />
                            </span>
                            {kpi.to && (
                                <svg
                                    className="w-4 h-4 text-sand-300 group-hover:text-forest-500 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                    />
                                </svg>
                            )}
                        </div>
                    );

                    return kpi.to ? (
                        <Link
                            key={kpi.label}
                            to={kpi.to}
                            className="group bg-white rounded-xl shadow-card p-5 border border-sand-100 hover:shadow-md hover:border-forest-200 transition-all"
                        >
                            {content}
                            <p className="text-2xl font-display font-bold text-ink">
                                {kpi.value}
                            </p>
                            <p className="text-sm text-sand-500 mt-1">
                                {kpi.label}
                            </p>
                        </Link>
                    ) : (
                        <div
                            key={kpi.label}
                            className="bg-white rounded-xl shadow-card p-5 border border-sand-100"
                        >
                            {content}
                            <p className="text-2xl font-display font-bold text-ink">
                                {kpi.value}
                            </p>
                            <p className="text-sm text-sand-500 mt-1">
                                {kpi.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Accès rapides */}
                <div className="bg-white rounded-xl shadow-card p-6 border border-sand-100">
                    <h3 className="text-lg font-display font-semibold text-ink mb-4">
                        Accès rapides
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {
                                label: "Pointage du jour",
                                to: "/pointage",
                                Icon: ClipboardIcon,
                            },
                            {
                                label: "Liste des employés",
                                to: "/employes",
                                Icon: UsersIcon,
                            },
                            {
                                label: "Bulletins de paie",
                                to: "/bulletins",
                                Icon: DocumentIcon,
                            },
                            {
                                label: "Congés",
                                to: "/conges",
                                Icon: UmbrellaIcon,
                            },
                        ].map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center gap-2 p-3 rounded-lg bg-sand-50 hover:bg-forest-50 text-sm font-medium text-sand-700 hover:text-forest-700 transition-colors"
                            >
                                <item.Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Derniers pointages */}
                <div className="bg-white rounded-xl shadow-card p-6 border border-sand-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-display font-semibold text-ink">
                            Derniers pointages
                        </h3>
                        <Link
                            to="/pointage"
                            className="text-xs text-forest-600 hover:text-forest-700 font-medium"
                        >
                            Voir tout →
                        </Link>
                    </div>
                    {recentPresences.length > 0 ? (
                        <div className="space-y-2">
                            {recentPresences.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between py-2 border-b border-sand-50 last:border-0"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-ink truncate">
                                            {p.employe_nom ||
                                                `Employé #${p.employe}`}
                                        </p>
                                        <p className="text-xs text-sand-500">
                                            {p.date}
                                            {p.heures_travaillees
                                                ? ` · ${p.heures_travaillees}h`
                                                : ""}
                                        </p>
                                    </div>
                                    <span
                                        className={`flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                            p.present
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {p.present ? "Présent" : "Absent"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-sm text-sand-500 mb-3">
                                Aucun pointage enregistré.
                            </p>
                            <Link
                                to="/pointage"
                                className="inline-flex px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Effectuer un pointage
                            </Link>
                        </div>
                    )}
                </div>

                {/* Résumé paie du mois */}
                <div className="bg-white rounded-xl shadow-card p-6 border border-sand-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-display font-semibold text-ink">
                            Paie — {moisNoms[paieResume?.mois]}{" "}
                            {paieResume?.annee}
                        </h3>
                        <Link
                            to="/bulletins"
                            className="text-xs text-forest-600 hover:text-forest-700 font-medium"
                        >
                            Voir tout →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-sand-50">
                            <span className="text-sm text-sand-600">
                                Bulletins générés
                            </span>
                            <span className="text-lg font-bold text-ink">
                                {paieResume?.nbBulletins ?? "—"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-sand-50">
                            <span className="text-sm text-sand-600">
                                Masse salariale
                            </span>
                            <span className="text-lg font-bold text-forest-700">
                                {stats?.masseSalariale
                                    ? `${stats.masseSalariale.toLocaleString()} FCFA`
                                    : "— FCFA"}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            to="/bulletins"
                            className="block w-full py-2.5 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors text-center"
                        >
                            Générer la paie de {moisNoms[paieResume?.mois]}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
import { MOIS_NOMS_1, currentMonth, currentYear } from "../utils/constants";

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

                setRecentPresences(
                    (recentPres.data.results || recentPres.data).slice(0, 5),
                );

                setPaieResume({
                    mois: currentMonth(),
                    annee: currentYear(),
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
            color: "bg-forest-500/10 text-forest-500",
            to: "/employes",
        },
        {
            label: "Pointages du jour",
            value: stats?.nbPresences ?? "—",
            Icon: ClipboardIcon,
            color: "bg-gold-500/10 text-gold-600",
            to: "/pointage",
        },
        {
            label: "Anomalies",
            value: stats?.nbAnomalies ?? "—",
            Icon: ExclamationIcon,
            color:
                stats?.nbAnomalies > 0
                    ? "bg-red-500/10 text-danger"
                    : "bg-green-500/10 text-success",
            to: stats?.nbAnomalies > 0 ? "/pointage" : null,
        },
        {
            label: "Masse salariale",
            value: stats?.masseSalariale
                ? `${stats.masseSalariale.toLocaleString()} FCFA`
                : "—",
            Icon: CurrencyIcon,
            color: "bg-blue-500/10 text-info",
            to: "/bulletins",
        },
    ];

    if (loading) {
        return (
            <div>
                <h2 className="text-page-title text-ink mb-6">
                    Tableau de bord
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card p-5 animate-shimmer">
                            <div className="w-10 h-10 rounded-lg bg-sand-100 mb-3" />
                            <div className="h-7 bg-sand-100 rounded w-20 mb-1" />
                            <div className="h-4 bg-sand-50 rounded w-28" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-page-title text-ink mb-6">Tableau de bord</h2>

            <OnboardingChecklist />

            {/* Bandeau d'alerte */}
            {stats?.nbAnomalies > 0 && (
                <div className="flex items-center justify-between bg-gold-50 border border-gold-200 rounded-card p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gold-100 text-gold-600">
                            <ExclamationIcon className="w-4 h-4" />
                        </span>
                        <div>
                            <p className="text-body-sm font-semibold text-gold-700">
                                {stats.nbAnomalies} anomalie
                                {stats.nbAnomalies > 1 ? "s" : ""} détectée
                                {stats.nbAnomalies > 1 ? "s" : ""}
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
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {kpis.map((kpi) => {
                    const content = (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <span
                                    className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${kpi.color}`}
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
                            <p className="text-2xl font-bold text-ink leading-none mb-1">
                                {kpi.value}
                            </p>
                            <p className="text-body-sm text-ink-secondary">
                                {kpi.label}
                            </p>
                        </>
                    );

                    return kpi.to ? (
                        <Link
                            key={kpi.label}
                            to={kpi.to}
                            className="group card p-5 hover:shadow-elevation-2 transition-shadow duration-fast"
                        >
                            {content}
                        </Link>
                    ) : (
                        <div key={kpi.label} className="card p-5">
                            {content}
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Accès rapides */}
                <div className="card-padded">
                    <h3 className="text-section-title text-ink mb-4">
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
                                className="flex items-center gap-2.5 p-3 rounded-btn bg-sand-50 hover:bg-forest-50 text-body-sm font-semibold text-ink-secondary hover:text-forest-600 transition-colors duration-fast"
                            >
                                <item.Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Derniers pointages */}
                <div className="card-padded">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-section-title text-ink">
                            Derniers pointages
                        </h3>
                        <Link
                            to="/pointage"
                            className="text-body-sm font-semibold text-forest-500 hover:text-forest-600"
                        >
                            Voir tout →
                        </Link>
                    </div>
                    {recentPresences.length > 0 ? (
                        <div className="space-y-1">
                            {recentPresences.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between py-2.5 border-b border-border-light last:border-0"
                                >
                                    <div className="min-w-0">
                                        <p className="text-body-sm font-semibold text-ink truncate">
                                            {p.employe_nom ||
                                                `Employé #${p.employe}`}
                                        </p>
                                        <p className="text-caption text-sand-500">
                                            {p.date}
                                            {p.heures_travaillees
                                                ? ` · ${p.heures_travaillees}h`
                                                : ""}
                                        </p>
                                    </div>
                                    <span
                                        className={`badge flex-shrink-0 ${p.present ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                                    >
                                        {p.present ? "Présent" : "Absent"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-body-sm text-sand-500 mb-4">
                                Aucun pointage enregistré.
                            </p>
                            <Link
                                to="/pointage"
                                className="btn-primary text-sm"
                            >
                                Effectuer un pointage
                            </Link>
                        </div>
                    )}
                </div>

                {/* Résumé paie */}
                <div className="card-padded">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-section-title text-ink">
                            Paie — {MOIS_NOMS_1[paieResume?.mois]}{" "}
                            {paieResume?.annee}
                        </h3>
                        <Link
                            to="/bulletins"
                            className="text-body-sm font-semibold text-forest-500 hover:text-forest-600"
                        >
                            Voir tout →
                        </Link>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between py-3 border-b border-border-light">
                            <span className="text-body-sm text-ink-secondary">
                                Bulletins générés
                            </span>
                            <span className="text-2xl font-bold text-ink">
                                {paieResume?.nbBulletins ?? "—"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-border-light">
                            <span className="text-body-sm text-ink-secondary">
                                Masse salariale
                            </span>
                            <span className="text-2xl font-bold text-forest-600">
                                {stats?.masseSalariale
                                    ? `${stats.masseSalariale.toLocaleString()} FCFA`
                                    : "—"}
                            </span>
                        </div>
                    </div>
                    <Link
                        to="/bulletins"
                        className="btn-primary w-full mt-5 text-sm justify-center"
                    >
                        Générer la paie de {MOIS_NOMS_1[paieResume?.mois]}
                    </Link>
                </div>
            </div>
        </div>
    );
}

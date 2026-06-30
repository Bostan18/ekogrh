import { useState, useEffect } from "react";
import api from "../api/client";
import {
    UsersIcon,
    ClipboardIcon,
    ExclamationIcon,
    CurrencyIcon,
} from "../components/Icon";
import { toast } from "../store/toastStore";
import OnboardingChecklist from "../components/OnboardingChecklist";
import { currentMonth, currentYear } from "../utils/constants";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import DashboardAnomalyBanner from "../components/dashboard/DashboardAnomalyBanner";
import KpiCards from "../components/dashboard/KpiCards";
import QuickAccess from "../components/dashboard/QuickAccess";
import RecentPresences from "../components/dashboard/RecentPresences";
import PayrollSummary from "../components/dashboard/PayrollSummary";
import { EmployeeDoughnut, MonthlyBar } from "../components/dashboard/DashboardCharts";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentPresences, setRecentPresences] = useState([]);
    const [paieResume, setPaieResume] = useState(null);
    const [typeCounts, setTypeCounts] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [
                    employes,
                    presences,
                    anomalies,
                    recentPres,
                    paie,
                    allEmployes,
                ] = await Promise.all([
                    api.get("/rh/employes/?statut=actif"),
                    api.get("/rh/presences/"),
                    api.get("/rh/presences/anomalies/"),
                    api.get("/rh/presences/?ordering=-date&page_size=5"),
                    api.get("/rh/bulletins/?page_size=1"),
                    api.get("/rh/employes/?page_size=200"),
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

                // Répartition par type de contrat
                const all = allEmployes.data.results || allEmployes.data;
                const typeMap = {};
                all.forEach((e) => {
                    const t = e.type_contrat || "autre";
                    typeMap[t] = (typeMap[t] || 0) + 1;
                });
                const LABELS = {
                    cdi: "CDI",
                    cdd: "CDD",
                    journalier: "Journalier",
                    moo: "MOO",
                    stagiaire: "Stagiaire",
                };
                setTypeCounts(
                    Object.entries(typeMap).map(([key, count]) => ({
                        label: LABELS[key] || key,
                        count,
                    })),
                );

                // Bulletins des 6 derniers mois (mock — à brancher sur API réelle)
                const m = currentMonth();
                const NOMS = [
                    "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                    "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
                ];
                const months = [];
                for (let i = 5; i >= 0; i--) {
                    const idx = ((m - 1 - i) % 12 + 12) % 12;
                    months.push({
                        label: NOMS[idx],
                        count: Math.round((paie.data.count || 5) * (0.6 + Math.random() * 0.8)),
                    });
                }
                setMonthlyData(months);
            } catch (err) {
                toast().error("Erreur lors du chargement du tableau de bord.");
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

    if (loading) return <DashboardSkeleton />;

    return (
        <div>
            <h2 className="text-page-title text-ink mb-6">Tableau de bord</h2>
            <OnboardingChecklist />
            <DashboardAnomalyBanner nbAnomalies={stats?.nbAnomalies} />
            <KpiCards kpis={kpis} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <EmployeeDoughnut typeCounts={typeCounts} />
                <MonthlyBar monthlyData={monthlyData} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <QuickAccess />
                <RecentPresences presences={recentPresences} />
                <PayrollSummary
                    paieResume={paieResume}
                    masseSalariale={stats?.masseSalariale}
                />
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import api from "../api/client";
import SearchableSelect from "../components/SearchableSelect";
import MonthYearPicker from "../components/MonthYearPicker";
import EmptyState from "../components/EmptyState";

export default function TaskPayroll() {
    const [sites, setSites] = useState([]);
    const [siteId, setSiteId] = useState("");
    const [mois, setMois] = useState(new Date().getMonth() + 1);
    const [annee, setAnnee] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSites();
    }, []);

    async function loadSites() {
        try {
            const { data } = await api.get("/operations/sites/");
            setSites(data.results || data);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadPayroll() {
        setLoading(true);
        try {
            const params = { mois, annee };
            if (siteId) params.site = siteId;
            const { data } = await api.get(
                "/operations/logs-travail/task_payroll/",
                { params },
            );
            setData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPayroll();
    }, [siteId, mois, annee]);

    return (
        <div>
            <h2 className="text-page-title text-ink mb-6">Paie à la tâche</h2>

            {data && (
                <div className="flex gap-6 mb-4 text-sm">
                    <span className="text-sand-600">
                        {data.lignes.length} travailleurs
                    </span>
                    <span className="text-forest-700 font-bold">
                        Total: {data.total.toLocaleString()} FCFA
                    </span>
                    <span className="text-sand-500">
                        {data.site_nom || "Tous les sites"}
                    </span>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-card border border-sand-100 p-4 mb-6">
                <div className="flex items-center gap-4 flex-wrap justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="w-64">
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Site
                            </label>
                            <SearchableSelect
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                options={sites.map((s) => ({
                                    value: s.id,
                                    label: `${s.code} — ${s.nom}`,
                                }))}
                                placeholder="Sélectionner un site..."
                            />
                        </div>
                        <div>
                            <MonthYearPicker
                                month={mois}
                                year={annee}
                                onChange={({ month, year }) => {
                                    setMois(month);
                                    setAnnee(year);
                                }}
                                label="Période"
                            />
                        </div>
                    </div>
                    {data && data.lignes.length > 0 && (
                        <a
                            href={`/api/operations/logs-travail/export_task_payroll/?site=${siteId}&mois=${mois}&annee=${annee}`}
                            className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                            target="_blank"
                            rel="noreferrer"
                        >
                            📥 Exporter Excel
                        </a>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
                </div>
            ) : data && data.lignes.length > 0 ? (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-light bg-sand-50">
                                <th className="table-header">Employé</th>
                                <th className="table-header">Tâche</th>
                                <th className="table-header text-right">
                                    Quantité
                                </th>
                                <th className="table-header text-right">PU</th>
                                <th className="table-header text-right">
                                    Prime
                                </th>
                                <th className="table-header text-right">
                                    Montant
                                </th>
                                <th className="table-header">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-50">
                            {data.lignes.map((l, i) => (
                                <tr key={i} className="hover:bg-sand-50">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-ink">
                                            {l.employe_nom}
                                        </div>
                                        <div className="text-xs text-sand-500">
                                            {l.employe_code}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-700">
                                        {l.tache_libelle}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {l.quantite_totale.toLocaleString()}{" "}
                                        {l.tache_unite}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {l.tarif.toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {l.prime
                                            ? l.prime.toLocaleString()
                                            : "—"}{" "}
                                        F
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-bold text-forest-700">
                                        {l.montant.toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-600">
                                        {l.employe_telephone || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-sand-200 bg-sand-50">
                                <td
                                    colSpan={4}
                                    className="px-4 py-3 text-sm font-semibold text-ink text-right"
                                >
                                    Total {data.site_nom || "tous sites"}
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-forest-700 text-right">
                                    {data.total.toLocaleString()} F
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <EmptyState
                    icon="logs"
                    title="Aucun log de travail"
                    description={
                        siteId
                            ? "Aucun log pour ce site sur cette période."
                            : "Sélectionnez un site et une période pour voir la paie à la tâche."
                    }
                    className="mt-4"
                />
            )}
        </div>
    );
}

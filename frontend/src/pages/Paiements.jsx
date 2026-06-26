import { useState, useEffect } from "react";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";

export default function Paiements() {
    const [paiements, setPaiements] = useState([]);
    const [restants, setRestants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("paiements");
    const modeColors = {
        especes: "bg-green-100 text-green-700",
        orange: "bg-orange-100 text-orange-700",
        mtn: "bg-yellow-100 text-yellow-700",
        moov: "bg-blue-100 text-blue-700",
        virement: "bg-purple-100 text-purple-700",
        cheque: "bg-slate-100 text-slate-700",
    };

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [pRes, rRes] = await Promise.all([
                api.get("/rh/paiements/"),
                api.get("/rh/presences/restant_a_payer/"),
            ]);
            setPaiements(pRes.data.results || pRes.data);
            setRestants(rRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const tabBtn = (name) =>
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors " +
        (tab === name
            ? "bg-forest-500 text-white"
            : "bg-sand-100 text-sand-600 hover:bg-sand-200");

    return (
        <div>
            <h2 className="text-page-title text-ink mb-6">Paiements</h2>
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setTab("paiements")}
                    className={tabBtn("paiements")}
                >
                    Historique des paiements
                </button>
                <button
                    onClick={() => setTab("restants")}
                    className={tabBtn("restants")}
                >
                    Restant a payer
                </button>
            </div>
            {loading ? (
                <TableSkeleton rows={4} cols={6} />
            ) : tab === "paiements" ? (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-light bg-sand-50">
                                <th className="table-header">Date</th>
                                <th className="table-header">Employe</th>
                                <th className="table-header text-right">
                                    Montant
                                </th>
                                <th className="table-header">Mode</th>
                                <th className="table-header">Reference</th>
                                <th className="table-header">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paiements.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3 text-sm text-sand-600">
                                        {p.date}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-ink">
                                        {p.employe_nom}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-bold text-forest-700">
                                        {Number(p.montant).toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                "inline-block px-2 py-0.5 rounded text-xs font-medium " +
                                                (modeColors[p.mode] || "")
                                            }
                                        >
                                            {p.mode_display}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-500">
                                        {p.reference || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-500 max-w-[200px] truncate">
                                        {p.notes || "-"}
                                    </td>
                                </tr>
                            ))}
                            {paiements.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState
                                            icon="paiements"
                                            title="Aucun paiement enregistré"
                                            description="Consultez l'onglet « Restant à payer » pour effectuer des règlements."
                                            className="border-0 shadow-none"
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-light bg-sand-50">
                                <th className="table-header">Employe</th>
                                <th className="table-header text-right">
                                    Total du
                                </th>
                                <th className="table-header text-right">
                                    Total paye
                                </th>
                                <th className="table-header text-right">
                                    Restant
                                </th>
                                <th className="table-header text-center">
                                    Jours non payes
                                </th>
                                <th className="table-header text-center">
                                    Bordereau
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-50">
                            {restants.map((r) => (
                                <tr
                                    key={r.employe_id}
                                    className="hover:bg-sand-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-ink">
                                        {r.employe_nom}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {r.total_du.toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-green-700">
                                        {r.total_paye.toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                                        {r.restant.toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {r.jours_non_payes}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <a
                                            href={`/api/rh/presences/export_bordereau/?employe_id=${r.employe_id}`}
                                            className="px-3 py-1 text-xs font-medium rounded-lg bg-forest-50 text-forest-700 hover:bg-forest-100 transition-colors"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Export
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {restants.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState
                                            icon="paiements"
                                            title="Aucun montant restant à payer"
                                            description="Tous les journaliers sont à jour."
                                            className="border-0 shadow-none"
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

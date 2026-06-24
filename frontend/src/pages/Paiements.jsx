import { useState, useEffect } from "react";
import api from "../api/client";

export default function Paiements() {
    const [paiements, setPaiements] = useState([]);
    const [restants, setRestants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("paiements");
    const modeColors = {
        especes: "bg-green-100 text-green-700",
        virement: "bg-blue-100 text-blue-700",
        cheque: "bg-purple-100 text-purple-700",
        mobile: "bg-gold-100 text-gold-700",
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
            <h2 className="text-2xl font-display font-bold text-ink mb-6">
                Paiements
            </h2>
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
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
                </div>
            ) : tab === "paiements" ? (
                <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-sand-100 bg-sand-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Date
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Employe
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Montant
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Mode
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Reference
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-50">
                            {paiements.map((p) => (
                                <tr
                                    key={p.id}
                                    className="hover:bg-sand-50 transition-colors"
                                >
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
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-sand-500"
                                    >
                                        Aucun paiement enregistre.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-sand-100 bg-sand-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Employe
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Total du
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Total paye
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Restant
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Jours non payes
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
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
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-sand-500"
                                    >
                                        Aucun montant restant a payer.
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

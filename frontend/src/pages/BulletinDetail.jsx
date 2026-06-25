import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function BulletinDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bulletin, setBulletin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get("/rh/bulletins/" + id + "/");
                setBulletin(data);
            } catch {
                navigate("/bulletins");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    async function marquerPaye() {
        setPaying(true);
        try {
            await api.post("/rh/bulletins/marquer_paye/", {
                bulletin_id: Number(id),
            });
            const { data } = await api.get("/rh/bulletins/" + id + "/");
            setBulletin(data);
        } catch (err) {
            alert("Erreur lors du marquage comme payé");
        } finally {
            setPaying(false);
        }
    }

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
            </div>
        );
    if (!bulletin) return null;

    return (
        <div>
            <button
                onClick={() => navigate("/bulletins")}
                className="text-forest-600 hover:underline text-sm mb-4 inline-block"
            >
                Retour aux bulletins
            </button>
            <div className="bg-white rounded-xl shadow-card border border-sand-100 p-6 max-w-2xl">
                <div className="text-center mb-8 pb-6 border-b border-sand-100">
                    <h2 className="text-xl font-display font-bold text-forest-700">
                        EKOGRH
                    </h2>
                    <p className="text-sm text-sand-500 mt-1">
                        Bulletin de paie - {bulletin.mois}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-xs text-sand-500">Employe</p>
                        <p className="text-sm font-medium text-ink">
                            {bulletin.employe_nom}
                        </p>
                        <p className="text-xs text-sand-400">
                            {bulletin.employe_code}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-sand-500">Poste</p>
                        <p className="text-sm font-medium text-ink">
                            {bulletin.employe_poste || "-"}
                        </p>
                    </div>
                </div>
                <table className="w-full mb-6">
                    <thead>
                        <tr className="border-b border-sand-100">
                            <th className="text-left py-2 text-xs font-semibold text-sand-500 uppercase">
                                Rubrique
                            </th>
                            <th className="text-right py-2 text-xs font-semibold text-sand-500 uppercase">
                                Montant
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-50">
                        {(bulletin.lignes || []).map((ligne) => (
                            <tr key={ligne.id}>
                                <td className="py-2.5 text-sm text-ink">
                                    {ligne.libelle}
                                </td>
                                <td
                                    className={
                                        ligne.montant < 0
                                            ? "py-2.5 text-sm text-right font-medium text-red-600"
                                            : "py-2.5 text-sm text-right font-medium text-ink"
                                    }
                                >
                                    {Number(ligne.montant).toLocaleString()} F
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-forest-200">
                            <td className="py-3 text-sm font-bold text-ink">
                                Net a payer
                            </td>
                            <td className="py-3 text-sm text-right font-bold text-forest-700 text-lg">
                                {Number(bulletin.net).toLocaleString()} FCFA
                            </td>
                        </tr>
                    </tfoot>
                </table>
                <div className="flex items-center justify-between pt-4 border-t border-sand-100">
                    <span
                        className={
                            bulletin.statut === "paye"
                                ? "px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-700"
                                : "px-3 py-1 rounded-lg text-sm font-medium bg-gold-100 text-gold-700"
                        }
                    >
                        {bulletin.statut === "paye"
                            ? "Paye le " + bulletin.paye_le
                            : "En attente de paiement"}
                    </span>
                    {bulletin.statut !== "paye" && (
                        <button
                            onClick={marquerPaye}
                            disabled={paying}
                            className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {paying ? "Paiement..." : "Marquer comme payé"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "../store/toastStore";

export default function CongesList() {
    const [conges, setConges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const statutColors = {
        demande: "bg-gold-100 text-gold-700",
        approuve: "bg-green-100 text-green-700",
        refuse: "bg-red-100 text-red-700",
        annule: "bg-gray-100 text-gray-600",
    };

    useEffect(() => {
        loadConges();
    }, [filter]);

    async function loadConges() {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.statut = filter;
            const { data } = await api.get("/rh/conges/", { params });
            setConges(data.results || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function approuver(id) {
        try {
            await api.post("/rh/conges/" + id + "/approuver/");
            toast().success("Congé approuvé.");
            loadConges();
        } catch {
            toast().error("Erreur lors de l'approbation.");
        }
    }
    async function refuser(id) {
        try {
            await api.post("/rh/conges/" + id + "/refuser/");
            toast().success("Congé refusé.");
            loadConges();
        } catch {
            toast().error("Erreur lors du refus.");
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-page-title text-ink">Conges & absences</h2>
                <button className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors">
                    + Nouvelle demande
                </button>
            </div>
            <div className="flex gap-3 mb-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-sand-200 rounded-lg text-sm"
                >
                    <option value="">Tous les statuts</option>
                    <option value="demande">Demande</option>
                    <option value="approuve">Approuve</option>
                    <option value="refuse">Refuse</option>
                    <option value="annule">Annule</option>
                </select>
            </div>
            {loading ? (
                <TableSkeleton rows={4} cols={7} />
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full table-ekogrh table-striped">
                        <thead>
                            <tr className="border-b border-border-light bg-sand-50">
                                <th className="table-header">Employe</th>
                                <th className="table-header">Type</th>
                                <th className="table-header">Du</th>
                                <th className="table-header">Au</th>
                                <th className="table-header text-center">
                                    Jours
                                </th>
                                <th className="table-header">Statut</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {conges.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-4 py-3 text-sm font-medium text-ink">
                                        {c.employe_nom}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-600">
                                        {c.type_conge_display}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-600">
                                        {c.date_debut}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-600">
                                        {c.date_fin}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {c.nb_jours}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                "inline-block px-2 py-0.5 rounded text-xs font-medium " +
                                                (statutColors[c.statut] || "")
                                            }
                                        >
                                            {c.statut_display}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {c.statut === "demande" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        approuver(c.id)
                                                    }
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                >
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        refuser(c.id)
                                                    }
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {conges.length === 0 && (
                                <tr>
                                    <td colSpan={7}>
                                        <EmptyState
                                            icon="conges"
                                            title="Aucun congé trouvé"
                                            description={
                                                filter
                                                    ? "Essayez de modifier le filtre."
                                                    : "Ajoutez une première demande de congé."
                                            }
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

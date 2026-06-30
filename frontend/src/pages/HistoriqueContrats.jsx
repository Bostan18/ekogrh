import { useState, useEffect } from "react";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "../store/toastStore";

export default function HistoriqueContrats() {
    const [contrats, setContrats] = useState([]);
    const [employes, setEmployes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        employe: "",
        type_contrat: "cdi",
        poste: "",
        date_debut: new Date().toISOString().slice(0, 10),
        date_fin: "",
        salaire_mensuel: "",
        taux_journalier: "",
        motif_fin: "",
        notes: "",
    });

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        setLoading(true);
        try {
            const [cRes, eRes] = await Promise.all([
                api.get("/rh/historique-contrats/"),
                api.get("/rh/employes/"),
            ]);
            setContrats(cRes.data.results || cRes.data);
            setEmployes(eRes.data.results || eRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        const payload = { ...form };
        if (payload.salaire_mensuel)
            payload.salaire_mensuel = parseFloat(payload.salaire_mensuel);
        else delete payload.salaire_mensuel;
        if (payload.taux_journalier)
            payload.taux_journalier = parseFloat(payload.taux_journalier);
        else delete payload.taux_journalier;
        try {
            await api.post("/rh/historique-contrats/", payload);
            setShowForm(false);
            setForm({
                employe: "",
                type_contrat: "cdi",
                poste: "",
                date_debut: new Date().toISOString().slice(0, 10),
                date_fin: "",
                salaire_mensuel: "",
                taux_journalier: "",
                motif_fin: "",
                notes: "",
            });
            toast().success("Contrat créé.");
            loadAll();
        } catch (err) {
            toast().error("Erreur lors de la création.");
        } finally {
            setSaving(false);
        }
    }

    if (loading)
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="h-8 bg-sand-100 rounded w-48 animate-shimmer" />
                    <div className="h-9 bg-sand-100 rounded w-36 animate-shimmer" />
                </div>
                <TableSkeleton rows={4} cols={9} />
            </div>
        );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ink">
                    Historique contrats
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {showForm ? "Annuler" : "+ Nouveau contrat"}
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-card shadow-card border border-sand-100 p-6 mb-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Employé
                            </label>
                            <select
                                required
                                value={form.employe}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        employe: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            >
                                <option value="">Sélectionner...</option>
                                {employes.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.nom_complet} ({e.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Type
                            </label>
                            <select
                                value={form.type_contrat}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        type_contrat: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            >
                                <option value="cdi">CDI</option>
                                <option value="cdd">CDD</option>
                                <option value="journalier">Journalier</option>
                                <option value="moo">MOO</option>
                                <option value="stagiaire">Stagiaire</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Poste
                            </label>
                            <input
                                value={form.poste}
                                onChange={(e) =>
                                    setForm({ ...form, poste: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Date début
                            </label>
                            <input
                                required
                                type="date"
                                value={form.date_debut}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        date_debut: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Date fin
                            </label>
                            <input
                                type="date"
                                value={form.date_fin}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        date_fin: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Salaire mensuel
                            </label>
                            <input
                                type="number"
                                value={form.salaire_mensuel}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        salaire_mensuel: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Taux journalier
                            </label>
                            <input
                                type="number"
                                value={form.taux_journalier}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        taux_journalier: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Motif fin
                            </label>
                            <input
                                value={form.motif_fin}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        motif_fin: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Notes
                            </label>
                            <input
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                </form>
            )}

            <div className="card overflow-hidden">
                <table className="w-full table-ekogrh table-striped">
                    <thead>
                        <tr className="border-b border-border-light bg-sand-50">
                            <th className="table-header">Employé</th>
                            <th className="table-header">Type</th>
                            <th className="table-header">Poste</th>
                            <th className="table-header">Période</th>
                            <th className="table-header text-right">Salaire</th>
                            <th className="table-header text-center">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contrats.map((c) => (
                            <tr key={c.id}>
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-ink">
                                        {c.employe_nom}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-sand-600">
                                    {c.type_contrat_display}
                                </td>
                                <td className="px-4 py-3 text-sm text-sand-600">
                                    {c.poste || "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-sand-600">
                                    {c.date_debut}
                                    {c.date_fin
                                        ? ` → ${c.date_fin}`
                                        : " → en cours"}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium">
                                    {c.salaire_mensuel
                                        ? parseFloat(
                                              c.salaire_mensuel,
                                          ).toLocaleString()
                                        : c.taux_journalier
                                          ? parseFloat(
                                                c.taux_journalier,
                                            ).toLocaleString()
                                          : "—"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {c.est_en_cours ? (
                                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                            En cours
                                        </span>
                                    ) : (
                                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-sand-100 text-sand-600">
                                            Clos
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {contrats.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <EmptyState
                                        icon="sites"
                                        title="Aucun contrat dans l'historique"
                                        description="Ajoutez un contrat pour suivre l'évolution des employés."
                                        actionLabel="Nouveau contrat"
                                        onAction={() => setShowForm(true)}
                                        className="border-0 shadow-none"
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

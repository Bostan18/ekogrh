import { useState, useEffect } from "react";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "../store/toastStore";

export default function SiteList() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        code: "",
        nom: "",
        type_site: "chantier",
        localisation: "",
    });
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    async function handleDelete(id) {
        const confirmed = await toast().confirm("Supprimer ce site ?");
        if (!confirmed) return;
        try {
            await api.delete(`/operations/sites/${id}/`);
            toast().success("Site supprimé.");
            load();
        } catch {
            toast().error("Erreur lors de la suppression.");
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const { data } = await api.get("/operations/sites/");
            setSites(data.results || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/operations/sites/${editingId}/`, form);
                toast().success("Site modifié.");
            } else {
                await api.post("/operations/sites/", form);
                toast().success("Site créé avec succès.");
            }
            setShowForm(false);
            setEditingId(null);
            setForm({
                code: "",
                nom: "",
                type_site: "chantier",
                localisation: "",
            });
            load();
        } catch (err) {
            toast().error("Erreur lors de l'enregistrement.");
        } finally {
            setSaving(false);
        }
    }

    function startEdit(site) {
        setForm({
            code: site.code,
            nom: site.nom,
            type_site: site.type_site,
            localisation: site.localisation || "",
        });
        setEditingId(site.id);
        setShowForm(true);
    }

    if (loading) return <TableSkeleton rows={4} cols={5} />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ink">
                    Sites
                </h2>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setForm({
                            code: "",
                            nom: "",
                            type_site: "chantier",
                            localisation: "",
                        });
                    }}
                    className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {showForm ? "Annuler" : "+ Nouveau site"}
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow-card border border-sand-100 p-6 mb-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Code
                            </label>
                            <input
                                value={form.code}
                                disabled
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm bg-sand-50 text-sand-500"
                                onChange={(e) =>
                                    setForm({ ...form, code: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Nom
                            </label>
                            <input
                                required
                                value={form.nom}
                                onChange={(e) =>
                                    setForm({ ...form, nom: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Type
                            </label>
                            <select
                                value={form.type_site}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        type_site: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                            >
                                <option value="chantier">Chantier</option>
                                <option value="parcelle">Parcelle</option>
                                <option value="pepiniere">Pépinière</option>
                                <option value="espace_vert">Espace vert</option>
                                <option value="depot">Dépôt</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                                Localisation
                            </label>
                            <input
                                value={form.localisation}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        localisation: e.target.value,
                                    })
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

            <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-sand-100 bg-sand-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Code
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Nom
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Type
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Localisation
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-50">
                        {sites.map((s) => (
                            <tr key={s.id} className="hover:bg-sand-50">
                                <td className="px-4 py-3 font-mono text-sm text-forest-600">
                                    {s.code}
                                </td>
                                <td className="px-4 py-3 font-medium text-ink">
                                    {s.nom}
                                </td>
                                <td className="px-4 py-3 text-sm text-sand-600">
                                    {s.type_site_display}
                                </td>
                                <td className="px-4 py-3 text-sm text-sand-600">
                                    {s.localisation || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => startEdit(s)}
                                        className="text-forest-600 hover:text-forest-800 text-xs font-medium transition-colors mr-2"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
                                    >
                                        Suppr.
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sites.length === 0 && (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState
                                        icon="sites"
                                        title="Aucun site enregistré"
                                        description="Ajoutez un site d'intervention."
                                        actionLabel="Nouveau site"
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

import { useState, useEffect } from "react";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "../store/toastStore";

const CATEGORIE_OPTIONS = [
    { value: "technique", label: "Technique" },
    { value: "comportementale", label: "Comportementale" },
    { value: "management", label: "Management" },
    { value: "reglementaire", label: "Réglementaire" },
    { value: "linguistique", label: "Linguistique" },
];

const INITIAL_FORM = {
    code: "",
    libelle: "",
    categorie: "technique",
    niveau_max: 5,
    description: "",
    actif: true,
};

export default function CompetenceList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState(INITIAL_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (!showCreate) return;
        const max = items.reduce((m, i) => {
            const n = parseInt((i.code || "").replace(/\D/g, ""), 10);
            return n > m ? n : m;
        }, 0);
        setCreateForm((f) => ({ ...f, code: `COMP-${String(max + 1).padStart(3, "0")}` }));
    }, [showCreate, items]);

    async function load() {
        setLoading(true);
        try {
            const { data } = await api.get("/rh/competences/");
            setItems(data.results || data);
        } catch { toast().error("Erreur de chargement."); }
        finally { setLoading(false); }
    }

    function startEdit(item) {
        setEditId(item.id);
        setEditForm({
            libelle: item.libelle,
            categorie: item.categorie,
            niveau_max: item.niveau_max,
            description: item.description || "",
            actif: item.actif,
        });
    }

    async function saveEdit() {
        try {
            await api.put(`/rh/competences/${editId}/`, editForm);
            setEditId(null);
            toast().success("Compétence mise à jour.");
            load();
        } catch (err) {
            const msg = err.response?.data;
            if (typeof msg === "object") {
                const detail = Object.entries(msg).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n");
                toast().error(detail);
            } else {
                toast().error("Erreur de mise à jour.");
            }
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post("/rh/competences/", createForm);
            setShowCreate(false);
            setCreateForm(INITIAL_FORM);
            toast().success("Compétence créée.");
            load();
        } catch (err) {
            const msg = err.response?.data;
            if (typeof msg === "object") {
                const detail = Object.entries(msg).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n");
                toast().error(detail);
            } else {
                toast().error("Erreur de création.");
            }
        }
        finally { setSaving(false); }
    }

    async function handleDelete(id) {
        const confirmed = await toast().confirm("Supprimer cette compétence ?");
        if (!confirmed) return;
        try {
            await api.delete(`/rh/competences/${id}/`);
            toast().success("Compétence supprimée.");
            load();
        } catch { toast().error("Erreur de suppression."); }
    }

    if (loading) return <TableSkeleton rows={5} cols={6} />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-page-title text-ink">Compétences</h2>
                <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors">
                    {showCreate ? "Annuler" : "+ Nouvelle compétence"}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="form-label">Libellé</label>
                            <input required value={createForm.libelle} onChange={(e) => setCreateForm({ ...createForm, libelle: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="form-label">Catégorie</label>
                            <select value={createForm.categorie} onChange={(e) => setCreateForm({ ...createForm, categorie: e.target.value })} className="select-field">
                                {CATEGORIE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Niveau max</label>
                            <input type="number" min={1} value={createForm.niveau_max} onChange={(e) => setCreateForm({ ...createForm, niveau_max: +e.target.value })} className="input-field" />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="comp-actif" checked={createForm.actif} onChange={(e) => setCreateForm({ ...createForm, actif: e.target.checked })} className="w-4 h-4 text-forest-500 border-sand-200 rounded focus:ring-forest-500" />
                            <label htmlFor="comp-actif" className="text-sm font-medium text-ink">Active</label>
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">Description</label>
                            <textarea rows={2} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="input-field" />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary">{saving ? "Enregistrement..." : "Enregistrer"}</button>
                </form>
            )}

            <div className="card overflow-hidden">
                <table className="w-full table-ekogrh table-striped">
                    <thead>
                        <tr className="border-b border-border-light bg-sand-50">
                            <th className="table-header">Code</th>
                            <th className="table-header">Libellé</th>
                            <th className="table-header">Catégorie</th>
                            <th className="table-header text-center">Niveau max</th>
                            <th className="table-header text-center">Actif</th>
                            <th className="table-header text-center">Employés</th>
                            <th className="table-header text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={7}><EmptyState icon="default" title="Aucune compétence" description="Créez votre première compétence." className="border-0 shadow-none" /></td></tr>
                        ) : items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 font-mono text-sm text-forest-600">{item.code}</td>
                                {editId === item.id ? (
                                    <>
                                        <td className="px-4 py-3">
                                            <input value={editForm.libelle} onChange={(e) => setEditForm({ ...editForm, libelle: e.target.value })} className="w-full px-2 py-1 border border-sand-200 rounded text-sm" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select value={editForm.categorie} onChange={(e) => setEditForm({ ...editForm, categorie: e.target.value })} className="px-2 py-1 border border-sand-200 rounded text-sm">
                                                {CATEGORIE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input type="number" min={1} value={editForm.niveau_max} onChange={(e) => setEditForm({ ...editForm, niveau_max: +e.target.value })} className="w-16 px-2 py-1 border border-sand-200 rounded text-sm text-center" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input type="checkbox" checked={editForm.actif} onChange={(e) => setEditForm({ ...editForm, actif: e.target.checked })} className="w-4 h-4 text-forest-500" />
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-sand-600">{item.nb_employes || 0}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={saveEdit} className="px-2 py-1 text-xs font-medium rounded bg-forest-500 text-white hover:bg-forest-600 mr-1">✓</button>
                                            <button onClick={() => setEditId(null)} className="px-2 py-1 text-xs font-medium rounded bg-sand-100 text-sand-600 hover:bg-sand-200">✗</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 font-medium text-ink">{item.libelle}</td>
                                        <td className="px-4 py-3 text-sm text-sand-600">{item.categorie_display}</td>
                                        <td className="px-4 py-3 text-sm text-center font-medium">{item.niveau_max}</td>
                                        <td className="px-4 py-3 text-center">{item.actif ? <span className="text-green-600">✓</span> : <span className="text-red-400">✗</span>}</td>
                                        <td className="px-4 py-3 text-center text-sm text-sand-600">{item.nb_employes || 0}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => startEdit(item)} className="text-xs text-forest-600 hover:text-forest-800 font-medium mr-3">Modifier</button>
                                            <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Suppr.</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

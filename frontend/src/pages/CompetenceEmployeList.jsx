import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { toast } from "../store/toastStore";
import Spinner from "../components/Spinner";

export default function CompetenceEmployeList() {
    const { id: employeId } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [employe, setEmploye] = useState(null);
    const [competences, setCompetences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ competence: "", niveau: 1, date_acquisition: "", notes: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                const [empRes, compRes, acqRes] = await Promise.all([
                    api.get(`/rh/employes/${employeId}/`),
                    api.get("/rh/competences/", { params: { actif: true } }),
                    api.get("/rh/competences-employes/", { params: { employe: employeId } }),
                ]);
                setEmploye(empRes.data);
                setCompetences(compRes.data.results || compRes.data);
                setItems(acqRes.data.results || acqRes.data);
            } catch { toast().error("Erreur de chargement."); navigate("/employes"); }
            finally { setLoading(false); }
        }
        init();
    }, [employeId, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post("/rh/competences-employes/", { ...form, employe: +employeId, niveau: +form.niveau });
            setShowForm(false);
            setForm({ competence: "", niveau: 1, date_acquisition: "", notes: "" });
            toast().success("Compétence ajoutée.");
            const { data } = await api.get("/rh/competences-employes/", { params: { employe: employeId } });
            setItems(data.results || data);
        } catch { toast().error("Erreur d'enregistrement."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id) {
        const confirmed = await toast().confirm("Retirer cette compétence ?");
        if (!confirmed) return;
        try {
            await api.delete(`/rh/competences-employes/${id}/`);
            toast().success("Compétence retirée.");
            setItems(items.filter(i => i.id !== id));
        } catch { toast().error("Erreur de suppression."); }
    }

    const available = competences.filter(c => c.actif && !items.some(i => i.competence === c.id));

    if (loading) return <Spinner className="h-64" />;
    if (!employe) return null;

    return (
        <div>
            <button onClick={() => navigate(`/employes/${employeId}`)} className="text-forest-600 hover:underline text-sm mb-4 inline-block">
                ← Retour à {employe.nom_complet}
            </button>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-page-title text-ink">Compétences — {employe.nom_complet}</h2>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors">
                    {showForm ? "Annuler" : "+ Ajouter"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card p-6 mb-6">
                    {available.length === 0 && competences.length > 0 && (
                        <div className="mb-4 p-3 bg-gold-50 border border-gold-200 rounded-lg text-sm text-gold-700">
                            Toutes les compétences du catalogue sont déjà attribuées à cet employé.
                        </div>
                    )}
                    {competences.length === 0 && (
                        <div className="mb-4 p-3 bg-gold-50 border border-gold-200 rounded-lg text-sm text-gold-700">
                            Aucune compétence dans le catalogue. <Link to="/competences" className="underline font-semibold">Créez-en une</Link>.
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="form-label">Compétence *</label>
                            <select required value={form.competence} onChange={e => setForm({ ...form, competence: e.target.value })} className="select-field" disabled={available.length === 0}>
                                <option value="">— Sélectionner —</option>
                                {available.map(c => <option key={c.id} value={c.id}>{c.code} — {c.libelle}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Niveau (1-{competences.find(c => c.id === +form.competence)?.niveau_max || 5})</label>
                            <input type="number" min={1} max={competences.find(c => c.id === +form.competence)?.niveau_max || 5} required value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="form-label">Date d'acquisition</label>
                            <input type="date" value={form.date_acquisition} onChange={e => setForm({ ...form, date_acquisition: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="form-label">Notes</label>
                            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" />
                        </div>
                    </div>
                    <button type="submit" disabled={saving || available.length === 0} className="btn-primary">{saving ? "Enregistrement..." : "Ajouter"}</button>
                </form>
            )}

            <div className="card overflow-hidden">
                <table className="w-full table-ekogrh table-striped">
                    <thead>
                        <tr className="border-b border-border-light bg-sand-50">
                            <th className="table-header">Compétence</th>
                            <th className="table-header">Catégorie</th>
                            <th className="table-header text-center">Niveau</th>
                            <th className="table-header text-center">/ Max</th>
                            <th className="table-header">Acquise le</th>
                            <th className="table-header">Notes</th>
                            <th className="table-header text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-sand-500">Aucune compétence attribuée.</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 font-medium text-ink">{item.competence_nom}</td>
                                <td className="px-4 py-3 text-sm text-sand-600">{item.competence_categorie}</td>
                                <td className="px-4 py-3 text-center font-medium">{item.niveau}</td>
                                <td className="px-4 py-3 text-center text-sm text-sand-500">{item.niveau_max}</td>
                                <td className="px-4 py-3 text-sm text-sand-600">{item.date_acquisition || "—"}</td>
                                <td className="px-4 py-3 text-sm text-sand-600 max-w-[150px] truncate">{item.notes || "—"}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Retirer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

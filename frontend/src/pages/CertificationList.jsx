import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { toast } from "../store/toastStore";
import Spinner from "../components/Spinner";

export default function CertificationList() {
    const { id: employeId } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [employe, setEmploye] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        libelle: "",
        organisme: "",
        numero: "",
        date_obtention: "",
        date_expiration: "",
        notes: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                const [empRes, certRes] = await Promise.all([
                    api.get(`/rh/employes/${employeId}/`),
                    api.get("/rh/certifications/", { params: { employe: employeId } }),
                ]);
                setEmploye(empRes.data);
                setItems(certRes.data.results || certRes.data);
            } catch { toast().error("Erreur de chargement."); navigate("/employes"); }
            finally { setLoading(false); }
        }
        init();
    }, [employeId, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post("/rh/certifications/", { ...form, employe: +employeId });
            setShowForm(false);
            setForm({ libelle: "", organisme: "", numero: "", date_obtention: "", date_expiration: "", notes: "" });
            toast().success("Certification ajoutée.");
            const { data } = await api.get("/rh/certifications/", { params: { employe: employeId } });
            setItems(data.results || data);
        } catch { toast().error("Erreur d'enregistrement."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id) {
        const confirmed = await toast().confirm("Supprimer cette certification ?");
        if (!confirmed) return;
        try {
            await api.delete(`/rh/certifications/${id}/`);
            toast().success("Certification supprimée.");
            setItems(items.filter(i => i.id !== id));
        } catch { toast().error("Erreur de suppression."); }
    }

    if (loading) return <Spinner className="h-64" />;
    if (!employe) return null;

    return (
        <div>
            <button onClick={() => navigate(`/employes/${employeId}`)} className="text-forest-600 hover:underline text-sm mb-4 inline-block">
                ← Retour à {employe.nom_complet}
            </button>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-page-title text-ink">Certifications — {employe.nom_complet}</h2>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors">
                    {showForm ? "Annuler" : "+ Ajouter"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="form-label">Libellé *</label>
                            <input required value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="form-label">Organisme</label>
                            <input value={form.organisme} onChange={e => setForm({ ...form, organisme: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="form-label">Numéro</label>
                            <input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="form-label">Date d'obtention *</label>
                            <input type="date" required value={form.date_obtention} onChange={e => setForm({ ...form, date_obtention: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="form-label">Date d'expiration</label>
                            <input type="date" value={form.date_expiration} onChange={e => setForm({ ...form, date_expiration: e.target.value })} className="input-field" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">Notes</label>
                            <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary">{saving ? "Enregistrement..." : "Enregistrer"}</button>
                </form>
            )}

            <div className="card overflow-hidden">
                <table className="w-full table-ekogrh table-striped">
                    <thead>
                        <tr className="border-b border-border-light bg-sand-50">
                            <th className="table-header">Libellé</th>
                            <th className="table-header">Organisme</th>
                            <th className="table-header">N°</th>
                            <th className="table-header">Obtenue le</th>
                            <th className="table-header">Expire le</th>
                            <th className="table-header text-center">Statut</th>
                            <th className="table-header">Notes</th>
                            <th className="table-header text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-sand-500">Aucune certification enregistrée.</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 font-medium text-ink">{item.libelle}</td>
                                <td className="px-4 py-3 text-sm text-sand-600">{item.organisme || "—"}</td>
                                <td className="px-4 py-3 text-sm text-sand-600 font-mono">{item.numero || "—"}</td>
                                <td className="px-4 py-3 text-sm text-sand-600">{item.date_obtention}</td>
                                <td className="px-4 py-3 text-sm text-sand-600">{item.date_expiration || "—"}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${item.statut === "valide" ? "bg-green-100 text-green-700" : item.statut === "expire" ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"}`}>
                                        {item.statut || "—"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-sand-600 max-w-[150px] truncate">{item.notes || "—"}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Suppr.</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

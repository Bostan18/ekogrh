import { useState, useEffect } from "react";
import api from "../api/client";
import { toast } from "../store/toastStore";
import LogTravailSkeleton from "../components/logtravail/LogTravailSkeleton";
import LogTravailFilters from "../components/logtravail/LogTravailFilters";
import LogTravailForm from "../components/logtravail/LogTravailForm";
import LogTravailTable from "../components/logtravail/LogTravailTable";

const INITIAL_FORM = {
    employe: "",
    site: "",
    tache: "",
    date: new Date().toISOString().slice(0, 10),
    objectif_realise: "",
    duree_heures: "8.0",
    prime: "",
    mode_paiement: "especes",
    notes: "",
};

export default function LogTravailList() {
    const [logs, setLogs] = useState([]);
    const [employes, setEmployes] = useState([]);
    const [sites, setSites] = useState([]);
    const [taches, setTaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filterEmploye, setFilterEmploye] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [form, setForm] = useState({ ...INITIAL_FORM });

    useEffect(() => {
        loadAll();
    }, [filterEmploye, filterDate]);

    async function loadAll() {
        setLoading(true);
        try {
            const params = {};
            if (filterEmploye) params.employe = filterEmploye;
            if (filterDate) params.date = filterDate;
            const [lRes, eRes, sRes, tRes] = await Promise.all([
                api.get("/operations/logs-travail/", { params }),
                api.get("/rh/employes/?statut=actif"),
                api.get("/operations/sites/"),
                api.get("/operations/taches-catalogue/"),
            ]);
            setLogs(lRes.data.results || lRes.data);
            setEmployes(eRes.data.results || eRes.data);
            setSites(sRes.data.results || sRes.data);
            setTaches(tRes.data.results || tRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            objectif_realise: parseFloat(form.objectif_realise),
            duree_heures: parseFloat(form.duree_heures),
            prime: parseFloat(form.prime) || 0,
        };
        try {
            await api.post("/operations/logs-travail/", payload);
            setShowForm(false);
            setForm({ ...INITIAL_FORM });
            toast().success("Log de travail créé.");
            loadAll();
        } catch (err) {
            toast().error("Erreur lors de la création.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        const confirmed = await toast().confirm("Supprimer ce log ?");
        if (!confirmed) return;
        try {
            await api.delete(`/operations/logs-travail/${id}/`);
            toast().success("Log supprimé.");
            loadAll();
        } catch {
            toast().error("Erreur lors de la suppression.");
        }
    }

    async function handlePayer(id) {
        const confirmed = await toast().confirm("Marquer ce log comme payé ? Un paiement sera créé.");
        if (!confirmed) return;
        try {
            await api.post(`/operations/logs-travail/${id}/marquer_paye/`);
            toast().success("Log marqué payé et paiement créé.");
            loadAll();
        } catch {
            toast().error("Erreur lors du paiement.");
        }
    }

    if (loading) return <LogTravailSkeleton />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ink">Logs de travail</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {showForm ? "Annuler" : "+ Nouveau log"}
                </button>
            </div>

            <LogTravailFilters
                employes={employes}
                filterEmploye={filterEmploye}
                onEmployeChange={setFilterEmploye}
                filterDate={filterDate}
                onDateChange={setFilterDate}
            />

            {showForm && (
                <LogTravailForm
                    form={form}
                    onChange={setForm}
                    employes={employes}
                    sites={sites}
                    taches={taches}
                    saving={saving}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <LogTravailTable
                logs={logs}
                filterEmploye={filterEmploye}
                filterDate={filterDate}
                onPayer={handlePayer}
                onDelete={handleDelete}
                onNew={() => setShowForm(true)}
            />
        </div>
    );
}

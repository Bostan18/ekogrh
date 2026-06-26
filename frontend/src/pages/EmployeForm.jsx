import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

const INITIAL = {
    code: "",
    nom: "",
    prenom: "",
    type_contrat: "cdi",
    poste: "",
    statut: "actif",
    date_entree: new Date().toISOString().slice(0, 10),
    salaire_mensuel: "",
    taux_journalier: "",
    telephone: "",
    email: "",
    adresse: "",
    numero_cnps: "",
};

function InputField({
    label,
    name,
    type,
    required,
    value,
    onChange,
    disabled,
}) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="input-field disabled:bg-sand-50 disabled:text-sand-500"
            />
        </div>
    );
}

export default function EmployeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) return;
        api.get("/rh/employes/")
            .then(({ data }) => {
                const items = data.results || data;
                if (items.length > 0) {
                    const last = items[items.length - 1];
                    const num =
                        parseInt((last.code || "").replace(/\D/g, "")) || 0;
                    setForm((f) => ({
                        ...f,
                        code: `EMP-${String(num + 1).padStart(3, "0")}`,
                    }));
                } else {
                    setForm((f) => ({ ...f, code: "EMP-001" }));
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        api.get(`/rh/employes/${id}/`)
            .then(({ data }) => {
                setForm({
                    code: data.code || "",
                    nom: data.nom || "",
                    prenom: data.prenom || "",
                    type_contrat: data.type_contrat || "cdi",
                    poste: data.poste || "",
                    statut: data.statut || "actif",
                    date_entree: data.date_entree || "",
                    salaire_mensuel: data.salaire_mensuel || "",
                    taux_journalier: data.taux_journalier || "",
                    telephone: data.telephone || "",
                    email: data.email || "",
                    adresse: data.adresse || "",
                    numero_cnps: data.numero_cnps || "",
                });
            })
            .catch(() => navigate("/employes"));
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        const payload = { ...form };
        payload.salaire_mensuel = payload.salaire_mensuel
            ? parseFloat(payload.salaire_mensuel)
            : null;
        payload.taux_journalier = payload.taux_journalier
            ? parseFloat(payload.taux_journalier)
            : null;
        Object.keys(payload).forEach((k) => {
            if (payload[k] === "" || payload[k] === null) delete payload[k];
        });

        try {
            if (isEdit) {
                await api.put(`/rh/employes/${id}/`, payload);
                navigate(`/employes/${id}`);
            } else {
                const { data } = await api.post("/rh/employes/", payload);
                navigate(`/employes/${data.id}`);
            }
        } catch (err) {
            const msg = err.response?.data;
            if (typeof msg === "object") {
                setError(
                    Object.entries(msg)
                        .map(
                            ([k, v]) =>
                                `${k}: ${Array.isArray(v) ? v.join(", ") : v}`,
                        )
                        .join("\n"),
                );
            } else {
                setError("Erreur lors de l'enregistrement");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => navigate(-1)}
                className="text-forest-600 hover:underline text-sm mb-4 inline-block"
            >
                ← Retour
            </button>
            <h2 className="text-page-title text-ink mb-6">
                {isEdit ? "Modifier employé" : "Nouvel employé"}
            </h2>

            <form onSubmit={handleSubmit} className="card p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-line">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <InputField
                        label="Code"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        disabled
                    />
                    <InputField
                        label="Nom"
                        name="nom"
                        value={form.nom}
                        onChange={handleChange}
                        required
                    />
                    <InputField
                        label="Prénom"
                        name="prenom"
                        value={form.prenom}
                        onChange={handleChange}
                        required
                    />
                    <div className="form-group">
                        <label className="form-label">Type de contrat</label>
                        <select
                            name="type_contrat"
                            value={form.type_contrat}
                            onChange={handleChange}
                            className="select-field"
                        >
                            <option value="cdi">CDI</option>
                            <option value="cdd">CDD</option>
                            <option value="journalier">Journalier</option>
                            <option value="moo">MOO</option>
                            <option value="stagiaire">Stagiaire</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Statut</label>
                        <select
                            name="statut"
                            value={form.statut}
                            onChange={handleChange}
                            className="select-field"
                        >
                            <option value="actif">Actif</option>
                            <option value="inactif">Inactif</option>
                            <option value="conge">Congé</option>
                        </select>
                    </div>
                    <InputField
                        label="Poste"
                        name="poste"
                        value={form.poste}
                        onChange={handleChange}
                        required
                    />
                    <InputField
                        label="Date d'entrée"
                        name="date_entree"
                        type="date"
                        value={form.date_entree}
                        onChange={handleChange}
                        required
                    />
                    <InputField
                        label="Salaire mensuel (FCFA)"
                        name="salaire_mensuel"
                        type="number"
                        value={form.salaire_mensuel}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Taux journalier (FCFA)"
                        name="taux_journalier"
                        type="number"
                        value={form.taux_journalier}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Téléphone"
                        name="telephone"
                        value={form.telephone}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Adresse"
                        name="adresse"
                        value={form.adresse}
                        onChange={handleChange}
                    />
                    <InputField
                        label="N° CNPS"
                        name="numero_cnps"
                        value={form.numero_cnps}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving
                            ? "Enregistrement..."
                            : isEdit
                              ? "Mettre à jour"
                              : "Enregistrer"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-outline"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}

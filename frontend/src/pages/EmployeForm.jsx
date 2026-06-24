import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

function InputField({ label, name, type, required, value, onChange }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
        </div>
    );
}

export default function EmployeForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

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
        // Remove empty optional fields
        Object.keys(payload).forEach((k) => {
            if (payload[k] === "" || payload[k] === null) delete payload[k];
        });

        try {
            const { data } = await api.post("/rh/employes/", payload);
            navigate(`/employes/${data.id}`);
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
                setError("Erreur lors de la création");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => navigate("/employes")}
                className="text-forest-600 hover:underline text-sm mb-4 inline-block"
            >
                ← Retour à la liste
            </button>
            <h2 className="text-2xl font-display font-bold text-ink mb-6">
                Nouvel employé
            </h2>

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-card border border-sand-100 p-6"
            >
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
                        required
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
                    <div>
                        <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                            Type de contrat
                        </label>
                        <select
                            name="type_contrat"
                            value={form.type_contrat}
                            onChange={handleChange}
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
                            Statut
                        </label>
                        <select
                            name="statut"
                            value={form.statut}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
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
                        className="px-6 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/employes")}
                        className="px-6 py-2 border border-sand-200 hover:bg-sand-50 text-sand-700 text-sm font-medium rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}

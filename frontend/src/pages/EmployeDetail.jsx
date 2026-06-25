import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { UserCircleIcon } from "../components/Icon";
import { toast } from "../store/toastStore";

export default function EmployeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employe, setEmploye] = useState(null);
    const [loading, setLoading] = useState(true);

    async function handleDelete() {
        const confirmed = await toast().confirm(
            "Supprimer définitivement cet employé ?",
        );
        if (!confirmed) return;
        try {
            await api.delete(`/rh/employes/${id}/`);
            navigate("/employes");
        } catch {
            toast().error("Erreur lors de la suppression.");
        }
    }

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get(`/rh/employes/${id}/`);
                setEmploye(data);
            } catch {
                navigate("/employes");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
            </div>
        );
    }

    if (!employe) return null;

    return (
        <div>
            <button
                onClick={() => navigate("/employes")}
                className="text-forest-600 hover:underline text-sm mb-4 inline-block"
            >
                ← Retour à la liste
            </button>

            <div className="bg-white rounded-xl shadow-card border border-sand-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center text-2xl">
                                <UserCircleIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-ink">
                                    {employe.nom_complet}
                                </h2>
                                <p className="text-sm text-sand-500">
                                    {employe.code} —{" "}
                                    {employe.poste || "Sans poste"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${employe.statut === "actif" ? "bg-green-100 text-green-700" : employe.statut === "inactif" ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"}`}
                    >
                        {employe.statut}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-sand-500 uppercase">
                            Informations
                        </h3>
                        <Info
                            label="Type de contrat"
                            value={employe.type_contrat?.toUpperCase()}
                        />
                        <Info
                            label="Téléphone"
                            value={employe.telephone || "—"}
                        />
                        <Info label="Email" value={employe.email || "—"} />
                        <Info label="Adresse" value={employe.adresse || "—"} />
                        <Info
                            label="Date d'entrée"
                            value={employe.date_entree || "—"}
                        />
                        <Info
                            label="Date de sortie"
                            value={employe.date_sortie || "—"}
                        />
                        <Info
                            label="N° CNPS"
                            value={employe.numero_cnps || "—"}
                        />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-sand-500 uppercase">
                            Rémunération
                        </h3>
                        <Info
                            label="Salaire mensuel"
                            value={
                                employe.salaire_mensuel
                                    ? `${employe.salaire_mensuel.toLocaleString()} FCFA`
                                    : "—"
                            }
                        />
                        <Info
                            label="Taux journalier"
                            value={
                                employe.taux_journalier
                                    ? `${employe.taux_journalier.toLocaleString()} FCFA/j`
                                    : "—"
                            }
                        />
                        <Info
                            label="Jours non payés"
                            value={employe.jours_non_payes || 0}
                        />
                        <Info
                            label="Restant à payer"
                            value={
                                employe.restant
                                    ? `${employe.restant.toLocaleString()} FCFA`
                                    : "—"
                            }
                        />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-sand-500 uppercase">
                            Actions
                        </h3>
                        <button
                            className="w-full px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                            onClick={() => navigate(`/employes/${id}/modifier`)}
                        >
                            Modifier
                        </button>
                        <Link
                            to="/historique"
                            className="block w-full px-4 py-2 border border-sand-200 hover:bg-sand-50 text-sand-700 text-sm font-medium rounded-lg transition-colors text-center"
                        >
                            Historique contrat
                        </Link>
                        <button className="w-full px-4 py-2 border border-sand-200 hover:bg-sand-50 text-sand-700 text-sm font-medium rounded-lg transition-colors">
                            Certifications
                        </button>
                        <button
                            className="w-full px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors"
                            onClick={handleDelete}
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <dt className="text-xs text-sand-500">{label}</dt>
            <dd className="text-sm text-ink font-medium mt-0.5">{value}</dd>
        </div>
    );
}

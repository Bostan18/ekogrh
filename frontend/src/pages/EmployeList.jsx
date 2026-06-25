import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";

export default function EmployeList() {
    const [employes, setEmployes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    useEffect(() => {
        loadEmployes();
    }, [typeFilter, search]);

    async function loadEmployes() {
        setLoading(true);
        try {
            const params = {};
            if (typeFilter) params.type_contrat = typeFilter;
            if (search) params.search = search;
            const { data } = await api.get("/rh/employes/", { params });
            setEmployes(data.results || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const typeColors = {
        cdi: "bg-blue-100 text-blue-700",
        cdd: "bg-purple-100 text-purple-700",
        journalier: "bg-gold-100 text-gold-700",
        moo: "bg-orange-100 text-orange-700",
        stagiaire: "bg-teal-100 text-teal-700",
    };

    const statutColors = {
        actif: "bg-green-100 text-green-700",
        inactif: "bg-red-100 text-red-700",
        conge: "bg-gold-100 text-gold-700",
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ink">
                    Employés
                </h2>
                <Link to="/employes/nouveau" className="btn-primary">
                    + Nouvel employé
                </Link>
            </div>

            {/* Filtres */}
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field w-64"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="select-field w-44"
                >
                    <option value="">Tous les types</option>
                    <option value="cdi">CDI</option>
                    <option value="cdd">CDD</option>
                    <option value="journalier">Journalier</option>
                    <option value="moo">MOO</option>
                    <option value="stagiaire">Stagiaire</option>
                </select>
            </div>

            {loading ? (
                <TableSkeleton rows={5} cols={6} />
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-light bg-sand-50">
                                <th className="table-header">Code</th>
                                <th className="table-header">Nom</th>
                                <th className="table-header">Poste</th>
                                <th className="table-header">Type</th>
                                <th className="table-header">Statut</th>
                                <th className="table-header">Taux</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-50">
                            {employes.map((emp) => (
                                <tr
                                    key={emp.id}
                                    className="hover:bg-sand-50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`/employes/${emp.id}`}
                                            className="text-forest-600 font-mono text-sm hover:underline"
                                        >
                                            {emp.code}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`/employes/${emp.id}`}
                                            className="text-ink font-medium hover:text-forest-600"
                                        >
                                            {emp.nom_complet}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-600">
                                        {emp.poste || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[emp.type_contrat] || ""}`}
                                        >
                                            {emp.type_contrat.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statutColors[emp.statut] || ""}`}
                                        >
                                            {emp.statut}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-700">
                                        {emp.salaire_mensuel
                                            ? `${emp.salaire_mensuel.toLocaleString()} FCFA`
                                            : emp.taux_journalier
                                              ? `${emp.taux_journalier.toLocaleString()} FCFA/j`
                                              : "—"}
                                    </td>
                                </tr>
                            ))}
                            {employes.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState
                                            icon="employes"
                                            title="Aucun employé trouvé"
                                            description={
                                                search || typeFilter
                                                    ? "Essayez de modifier vos filtres."
                                                    : "Commencez par créer votre premier employé."
                                            }
                                            actionLabel={
                                                !search && !typeFilter
                                                    ? "Créer un employé"
                                                    : ""
                                            }
                                            actionTo={
                                                !search && !typeFilter
                                                    ? "/employes/nouveau"
                                                    : ""
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

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
                <Link
                    to="/employes/nouveau"
                    className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
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
                    className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 w-64"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
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
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
                </div>
            ) : (
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
                                    Poste
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Type
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Statut
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Taux
                                </th>
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
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-sand-500"
                                    >
                                        Aucun employé trouvé.
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function BulletinList() {
    const [bulletins, setBulletins] = useState([]);
    const [employes, setEmployes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [mois, setMois] = useState(new Date().getMonth() + 1);
    const [annee, setAnnee] = useState(new Date().getFullYear());
    const [selectedIds, setSelectedIds] = useState([]);
    const [showSelect, setShowSelect] = useState(false);
    const moisNoms = [
        "",
        "Janvier",
        "Fevrier",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Aout",
        "Septembre",
        "Octobre",
        "Novembre",
        "Decembre",
    ];

    useEffect(() => {
        loadBulletins();
        loadEmployes();
    }, [mois, annee]);

    async function loadBulletins() {
        setLoading(true);
        try {
            const premierJour =
                annee + "-" + String(mois).padStart(2, "0") + "-01";
            const { data } = await api.get("/rh/bulletins/", {
                params: { mois: premierJour },
            });
            setBulletins(data.results || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadEmployes() {
        try {
            const { data } = await api.get("/rh/employes/", {
                params: { statut: "actif" },
            });
            const all = data.results || data;
            setEmployes(
                all.filter(
                    (e) =>
                        ["cdi", "cdd", "stagiaire"].includes(e.type_contrat) &&
                        e.salaire_mensuel,
                ),
            );
        } catch (err) {
            console.error(err);
        }
    }

    function toggleSelectAll() {
        if (selectedIds.length === employes.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(employes.map((e) => e.id));
        }
    }

    function toggleEmploye(id) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    }

    async function generer() {
        if (selectedIds.length === 0) {
            alert("Veuillez sélectionner au moins un employé.");
            return;
        }
        setGenerating(true);
        try {
            await api.post("/rh/bulletins/generer/", {
                mois,
                annee,
                employe_ids: selectedIds,
            });
            setShowSelect(false);
            setSelectedIds([]);
            loadBulletins();
        } catch (err) {
            alert("Erreur lors de la génération");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ink">
                    Bulletins de paie
                </h2>
                <button
                    onClick={() => setShowSelect(!showSelect)}
                    className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {showSelect ? "Annuler" : "Générer des bulletins"}
                </button>
            </div>

            <div className="flex gap-3 mb-4">
                <select
                    value={mois}
                    onChange={(e) => setMois(Number(e.target.value))}
                    className="px-3 py-2 border border-sand-200 rounded-lg text-sm"
                >
                    {moisNoms.map(
                        (nom, i) =>
                            i > 0 && (
                                <option key={i} value={i}>
                                    {nom}
                                </option>
                            ),
                    )}
                </select>
                <input
                    type="number"
                    value={annee}
                    onChange={(e) => setAnnee(Number(e.target.value))}
                    className="px-3 py-2 border border-sand-200 rounded-lg text-sm w-24"
                />
            </div>

            {/* Panneau de sélection des employés */}
            {showSelect && (
                <div className="bg-white rounded-xl shadow-card border border-forest-200 p-4 mb-4">
                    <p className="text-sm font-medium text-ink mb-3">
                        Sélectionnez les employés pour lesquels générer le
                        bulletin de {moisNoms[mois]} {annee} :
                    </p>
                    <div className="max-h-48 overflow-y-auto border border-sand-100 rounded-lg mb-3">
                        <label className="flex items-center gap-2 px-3 py-2 border-b border-sand-50 bg-sand-50 cursor-pointer hover:bg-sand-100">
                            <input
                                type="checkbox"
                                checked={
                                    selectedIds.length === employes.length &&
                                    employes.length > 0
                                }
                                onChange={toggleSelectAll}
                                className="rounded"
                            />
                            <span className="text-sm font-medium text-ink">
                                Tout sélectionner
                            </span>
                        </label>
                        {employes.map((emp) => (
                            <label
                                key={emp.id}
                                className="flex items-center gap-2 px-3 py-2 border-b border-sand-50 cursor-pointer hover:bg-sand-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(emp.id)}
                                    onChange={() => toggleEmploye(emp.id)}
                                    className="rounded"
                                />
                                <span className="text-sm text-ink">
                                    {emp.nom_complet}
                                </span>
                                <span className="text-xs text-sand-400 ml-auto">
                                    {emp.code} — {emp.poste || emp.type_contrat}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-sand-500">
                            {selectedIds.length} employé(s) sélectionné(s)
                        </span>
                        <button
                            onClick={generer}
                            disabled={generating || selectedIds.length === 0}
                            className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {generating
                                ? "Génération..."
                                : `Générer ${selectedIds.length} bulletin(s)`}
                        </button>
                    </div>
                </div>
            )}

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
                                    Employé
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Poste
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Mois
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Brut
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Net
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Statut
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-50">
                            {bulletins.map((b) => (
                                <tr
                                    key={b.id}
                                    className="hover:bg-sand-50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            to={"/bulletins/" + b.id}
                                            className="text-ink font-medium hover:text-forest-600"
                                        >
                                            {b.employe_nom}
                                        </Link>
                                        <span className="text-xs text-sand-400 ml-2">
                                            {b.employe_code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-600">
                                        {b.employe_poste || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-sand-600">
                                        {b.mois}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium">
                                        {Number(b.brut).toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-bold text-forest-700">
                                        {Number(b.net).toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                b.statut === "paye"
                                                    ? "inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700"
                                                    : "inline-block px-2 py-0.5 rounded text-xs font-medium bg-gold-100 text-gold-700"
                                            }
                                        >
                                            {b.statut === "paye"
                                                ? "Payé"
                                                : "Généré"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {bulletins.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-sand-500"
                                    >
                                        Aucun bulletin pour cette période.
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

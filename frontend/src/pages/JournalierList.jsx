import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { CardSkeleton, TableSkeleton } from "../components/Skeleton";
import { toast } from "../store/toastStore";
import PaymentModal from "../components/PaymentModal";

export default function JournalierList() {
    const [journaliers, setJournaliers] = useState([]);
    const [restants, setRestants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("ensemble");
    const [selectedForPayment, setSelectedForPayment] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        loadAll();
    }, [search]);

    async function loadAll() {
        setLoading(true);
        try {
            const params = { type_contrat: "journalier", statut: "actif" };
            if (search) params.search = search;

            const [jRes, rRes] = await Promise.all([
                api.get("/rh/employes/", { params }),
                api.get("/rh/presences/restant_a_payer/"),
            ]);
            setJournaliers(jRes.data.results || jRes.data);
            setRestants(rRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleMarquerPayes() {
        const restantsNonPayes = restants.filter((r) => r.restant > 0);
        if (restantsNonPayes.length === 0) return;

        const confirmed = await toast().confirm(
            `Marquer toutes les présences de ${restantsNonPayes.length} journalier(s) comme payées ?`,
        );
        if (!confirmed) return;

        try {
            const ids = restantsNonPayes.map((r) => r.employe_id);
            await api.post("/rh/presences/marquer_payees/", {
                ids,
                paye_le: new Date().toISOString().slice(0, 10),
            });
            toast().success(
                `${restantsNonPayes.length} journalier(s) marqué(s) payé(s).`,
            );
            loadAll();
        } catch {
            toast().error("Erreur lors du règlement.");
        }
    }

    const modeColors = {
        especes: "bg-green-100 text-green-700",
        orange: "bg-orange-100 text-orange-700",
        mtn: "bg-yellow-100 text-yellow-700",
        moov: "bg-blue-100 text-blue-700",
        virement: "bg-purple-100 text-purple-700",
        cheque: "bg-slate-100 text-slate-700",
    };

    const tabBtn = (name) =>
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors " +
        (tab === name
            ? "bg-forest-500 text-white"
            : "bg-sand-100 text-sand-600 hover:bg-sand-200");

    const totalRestant = restants.reduce((sum, r) => sum + (r.restant || 0), 0);
    const nbRestants = restants.filter((r) => r.restant > 0).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ink">
                    Journaliers
                </h2>
                <div className="flex gap-2">
                    <Link
                        to="/pointage"
                        className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        📋 Pointer
                    </Link>
                    <Link
                        to="/employes/nouveau"
                        className="px-4 py-2 border border-forest-300 text-forest-700 hover:bg-forest-50 text-sm font-medium rounded-lg transition-colors"
                    >
                        + Nouveau
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setTab("ensemble")}
                    className={tabBtn("ensemble")}
                >
                    Vue d'ensemble
                </button>
                <button
                    onClick={() => setTab("financier")}
                    className={tabBtn("financier")}
                >
                    Financier {nbRestants > 0 && `(${nbRestants})`}
                </button>
            </div>

            {loading ? (
                tab === "financier" ? (
                    <TableSkeleton rows={4} cols={6} />
                ) : (
                    <CardSkeleton count={6} />
                )
            ) : tab === "financier" ? (
                /* ----- Financier ----- */
                restants.length === 0 ? (
                    <EmptyState
                        icon="paiements"
                        title="Aucun montant restant à payer"
                        description="Tous les journaliers sont à jour de paiement."
                    />
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white rounded-lg shadow-card border border-sand-100 px-4 py-2">
                                <span className="text-xs text-sand-500">
                                    Restant total
                                </span>
                                <p className="text-lg font-bold text-red-600">
                                    {totalRestant.toLocaleString()} FCFA
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-card border border-sand-100 px-4 py-2">
                                <span className="text-xs text-sand-500">
                                    Journaliers
                                </span>
                                <p className="text-lg font-bold text-ink">
                                    {nbRestants}
                                </p>
                            </div>
                            {nbRestants > 0 && (
                                <button
                                    onClick={() => {
                                        const selected = restants.filter(
                                            (r) => r.restant > 0,
                                        );
                                        setSelectedForPayment(selected);
                                        setShowPaymentModal(true);
                                    }}
                                    className="ml-auto px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    💰 Payer tout (
                                    {totalRestant.toLocaleString()} FCFA)
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-sand-100 bg-sand-50">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                            Employé
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                            Total dû
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                            Payé
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                            Restant
                                        </th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                            Jours non payés
                                        </th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                            Bordereau
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sand-50">
                                    {restants.map((r) => (
                                        <tr
                                            key={r.employe_id}
                                            className="hover:bg-sand-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-ink">
                                                <Link
                                                    to={`/employes/${r.employe_id}`}
                                                    className="hover:text-forest-600"
                                                >
                                                    {r.employe_nom}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                {r.total_du.toLocaleString()} F
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-green-700">
                                                {r.total_paye.toLocaleString()}{" "}
                                                F
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                                                {r.restant.toLocaleString()} F
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                {r.jours_non_payes}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <a
                                                    href={`/api/rh/presences/export_bordereau/?employe_id=${r.employe_id}`}
                                                    className="px-3 py-1 text-xs font-medium rounded-lg bg-forest-50 text-forest-700 hover:bg-forest-100 transition-colors"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Export
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )
            ) : /* ----- Vue d'ensemble ----- */
            journaliers.length === 0 ? (
                <EmptyState
                    icon="employes"
                    title="Aucun journalier actif"
                    description={
                        search
                            ? "Essayez de modifier votre recherche."
                            : "Ajoutez un employé de type journalier."
                    }
                    actionLabel={!search ? "Nouvel employé" : ""}
                    actionTo={!search ? "/employes/nouveau" : ""}
                />
            ) : (
                <>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Rechercher un journalier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 w-64"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {journaliers.map((emp) => {
                            const restant = restants.find(
                                (r) => r.employe_id === emp.id,
                            );
                            return (
                                <Link
                                    key={emp.id}
                                    to={`/employes/${emp.id}`}
                                    className="bg-white rounded-xl shadow-card border border-sand-100 p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-ink">
                                                {emp.nom_complet}
                                            </h3>
                                            <p className="text-xs text-sand-500 font-mono">
                                                {emp.code}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                                emp.statut === "actif"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-sand-100 text-sand-700"
                                            }`}
                                        >
                                            {emp.statut}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-sand-500">
                                                Poste
                                            </span>
                                            <span className="text-ink font-medium">
                                                {emp.poste || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sand-500">
                                                Taux journalier
                                            </span>
                                            <span className="text-ink font-medium">
                                                {emp.taux_journalier
                                                    ? `${parseFloat(emp.taux_journalier).toLocaleString()} FCFA`
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sand-500">
                                                Jours non payés
                                            </span>
                                            <span
                                                className={`font-medium ${
                                                    (restant?.jours_non_payes ||
                                                        emp.jours_non_payes ||
                                                        0) > 0
                                                        ? "text-red-600"
                                                        : "text-ink"
                                                }`}
                                            >
                                                {restant?.jours_non_payes ??
                                                    emp.jours_non_payes ??
                                                    0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sand-500">
                                                Restant à payer
                                            </span>
                                            <span
                                                className={`font-medium ${
                                                    (restant?.restant ||
                                                        emp.restant ||
                                                        0) > 0
                                                        ? "text-red-600"
                                                        : "text-green-700"
                                                }`}
                                            >
                                                {restant?.restant
                                                    ? `${parseFloat(restant.restant).toLocaleString()} FCFA`
                                                    : emp.restant
                                                      ? `${parseFloat(emp.restant).toLocaleString()} FCFA`
                                                      : "0 FCFA"}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}

            {showPaymentModal && (
                <PaymentModal
                    items={selectedForPayment}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedForPayment([]);
                    }}
                    onPaid={() => {
                        setShowPaymentModal(false);
                        setSelectedForPayment([]);
                        loadAll();
                    }}
                />
            )}
        </div>
    );
}

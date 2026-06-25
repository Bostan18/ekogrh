import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { toast } from "../store/toastStore";
import { TableSkeleton } from "../components/Skeleton";

export default function Pointage() {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [journaliers, setJournaliers] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadFeuille = useCallback(async () => {
        setLoading(true);
        try {
            const [{ data: feuille }, { data: anom }] = await Promise.all([
                api.get("/rh/presences/feuille_journee/", { params: { date } }),
                api.get("/rh/presences/anomalies/"),
            ]);
            setJournaliers(feuille.presences);
            setAnomalies(anom.alertes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        loadFeuille();
    }, [loadFeuille]);

    useEffect(() => {
        api.get("/operations/sites/")
            .then(({ data }) => setSites(data.results || data))
            .catch(() => {});
    }, []);

    const togglePresence = (idx) => {
        const updated = [...journaliers];
        const current = updated[idx];
        if (current.present) {
            updated[idx] = {
                ...current,
                present: false,
                heures_travaillees: "0",
            };
        } else {
            updated[idx] = {
                ...current,
                present: true,
                heures_travaillees: "8.0",
            };
        }
        setJournaliers(updated);
    };

    const updateField = (idx, field, value) => {
        const updated = [...journaliers];
        updated[idx] = { ...updated[idx], [field]: value };
        setJournaliers(updated);
    };

    const save = async () => {
        setSaving(true);
        try {
            const presences = journaliers
                .filter((j) => j.present !== null)
                .map((j) => ({
                    employe_id: j.employe_id,
                    present: j.present,
                    heures_travaillees: parseFloat(j.heures_travaillees) || 0,
                    projet_ref: j.projet_ref || "",
                    site_ref: j.site_ref || "",
                    notes: j.notes || "",
                }));
            await api.post("/rh/presences/saisie_journee/", {
                date,
                presences,
            });
            toast().success("Pointages enregistrés avec succès.");
            loadFeuille();
        } catch (err) {
            toast().error("Erreur lors de l'enregistrement.");
        } finally {
            setSaving(false);
        }
    };

    const valider = async () => {
        setSaving(true);
        try {
            const ids = journaliers
                .filter((j) => j.presence_id && j.statut === "brouillon")
                .map((j) => j.presence_id);
            if (ids.length > 0) {
                await api.post("/rh/presences/valider/", { ids });
                toast().success(`${ids.length} pointage(s) validé(s).`);
                loadFeuille();
            }
        } catch (err) {
            toast().error("Erreur lors de la validation.");
        } finally {
            setSaving(false);
        }
    };

    const cloturer = async () => {
        const confirmed = await toast().confirm(
            "Clôturer tous les pointages de ce mois ?",
        );
        if (!confirmed) return;
        setSaving(true);
        try {
            const [annee, mois] = date.split("-");
            const { data } = await api.post("/rh/presences/cloturer/", {
                mois: parseInt(mois),
                annee: parseInt(annee),
            });
            toast().success(
                `${data.cloturees} pointage(s) clôturé(s) pour ${mois}/${annee}.`,
            );
            loadFeuille();
        } catch (err) {
            toast().error("Erreur lors de la clôture.");
        } finally {
            setSaving(false);
        }
    };

    const nbPresents = journaliers.filter((j) => j.present).length;
    const nbAbsents = journaliers.filter((j) => j.present === false).length;
    const nbNonPointe = journaliers.filter((j) => j.present === null).length;
    const nbBrouillon = journaliers.filter(
        (j) => j.statut === "brouillon",
    ).length;
    const anomAujourdhui = anomalies.filter((a) => a.date === date).length;

    const statutBadge = (statut) => {
        if (statut === "valide") return "bg-green-100 text-green-700";
        if (statut === "cloture") return "bg-sand-200 text-sand-600";
        return "bg-gold-100 text-gold-700";
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ink">
                    Pointage journalier
                </h2>
                <Link
                    to="/pointage-semaine"
                    className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-sand-700 text-sm font-medium rounded-lg transition-colors"
                >
                    Vue semaine →
                </Link>
            </div>

            {anomAujourdhui > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    ⚠ {anomAujourdhui} anomalie(s) détectée(s) aujourd'hui (0h
                    présentes, doubles pointages...)
                </div>
            )}

            {anomalies.length > 0 && anomAujourdhui === 0 && (
                <div className="mb-4 p-3 bg-gold-50 border border-gold-200 rounded-lg text-sm text-gold-700">
                    {anomalies.length} anomalie(s) détectée(s) au total ce
                    mois-ci.
                </div>
            )}

            <div className="bg-white rounded-xl shadow-card border border-sand-100 p-4 mb-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-sand-700">
                            Date :
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                        />
                    </div>
                    <div className="flex gap-4 text-sm">
                        <span className="text-green-700 font-medium">
                            {nbPresents} présents
                        </span>
                        <span className="text-red-600 font-medium">
                            {nbAbsents} absents
                        </span>
                        <span className="text-sand-500">
                            {nbNonPointe} non pointés
                        </span>
                        {nbBrouillon > 0 && (
                            <span className="text-gold-700 font-medium">
                                {nbBrouillon} brouillon
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={cloturer}
                            disabled={saving}
                            className="px-4 py-2 bg-sand-200 hover:bg-sand-300 text-sand-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            Clôturer
                        </button>
                        <button
                            onClick={valider}
                            disabled={saving}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            Valider
                        </button>
                        <button
                            onClick={save}
                            disabled={saving}
                            className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {saving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <TableSkeleton rows={8} cols={5} />
            ) : (
                <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-sand-100 bg-sand-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase w-10">
                                    #
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Employé
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Présence
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Heures
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Montant
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Statut
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Projet
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Site
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                    Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-50">
                            {journaliers.map((j, idx) => {
                                const rowBg =
                                    j.present === false ? "bg-red-50/30" : "";
                                const btnCls =
                                    j.present === true
                                        ? "px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"
                                        : j.present === false
                                          ? "px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                                          : "px-3 py-1 rounded text-xs font-medium bg-sand-100 text-sand-500 hover:bg-sand-200";
                                const btnLabel =
                                    j.present === true
                                        ? "Présent"
                                        : j.present === false
                                          ? "Absent"
                                          : "Non pointé";
                                const zeroHeures =
                                    j.present &&
                                    parseFloat(j.heures_travaillees) === 0;
                                return (
                                    <tr
                                        key={j.employe_id}
                                        className={
                                            "hover:bg-sand-50 transition-colors " +
                                            rowBg
                                        }
                                    >
                                        <td className="px-4 py-2.5 text-sm text-sand-400">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className="text-sm font-medium text-ink">
                                                {j.employe_nom}
                                            </span>
                                            <span className="text-xs text-sand-400 ml-2">
                                                {j.employe_code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <button
                                                onClick={() =>
                                                    togglePresence(idx)
                                                }
                                                className={btnCls}
                                            >
                                                {btnLabel}
                                            </button>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="24"
                                                value={j.heures_travaillees}
                                                onChange={(e) =>
                                                    updateField(
                                                        idx,
                                                        "heures_travaillees",
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={!j.present}
                                                className="w-16 px-2 py-1 border border-sand-200 rounded text-sm text-center disabled:opacity-50"
                                            />
                                            {zeroHeures && (
                                                <span
                                                    className="ml-1 text-red-500 text-xs"
                                                    title="Présent à 0h"
                                                >
                                                    ⚠
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm font-medium text-ink">
                                            {j.montant_du
                                                ? Number(
                                                      j.montant_du,
                                                  ).toLocaleString()
                                                : "0"}{" "}
                                            F
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span
                                                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statutBadge(j.statut)}`}
                                            >
                                                {j.statut || "brouillon"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <input
                                                type="text"
                                                value={j.projet_ref || ""}
                                                onChange={(e) =>
                                                    updateField(
                                                        idx,
                                                        "projet_ref",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-28 px-2 py-1 border border-sand-200 rounded text-sm"
                                                placeholder="Projet"
                                            />
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <select
                                                value={j.site_ref || ""}
                                                onChange={(e) =>
                                                    updateField(
                                                        idx,
                                                        "site_ref",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-32 px-2 py-1 border border-sand-200 rounded text-sm bg-white"
                                            >
                                                <option value="">
                                                    — Site —
                                                </option>
                                                {sites.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.nom}
                                                    >
                                                        {s.nom}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <input
                                                type="text"
                                                value={j.notes || ""}
                                                onChange={(e) =>
                                                    updateField(
                                                        idx,
                                                        "notes",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-32 px-2 py-1 border border-sand-200 rounded text-sm"
                                                placeholder="Notes"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

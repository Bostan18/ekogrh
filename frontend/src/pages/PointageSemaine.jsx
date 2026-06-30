import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "../store/toastStore";

function getLundi(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
}

function formatDate(str) {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function formatShort(str) {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function PointageSemaine() {
    const [semaine, setSemaine] = useState(() => getLundi(new Date()));
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modified, setModified] = useState(new Set());

    const load = useCallback(async (lundi) => {
        setLoading(true);
        try {
            const { data } = await api.get("/rh/presences/feuille_semaine/", {
                params: { semaine: lundi },
            });
            setData(data);
            setModified(new Set());
        } catch (err) {
            toast().error("Erreur lors du chargement de la semaine.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(semaine);
    }, [semaine, load]);

    const prevWeek = () => {
        const d = new Date(semaine + "T00:00:00");
        d.setDate(d.getDate() - 7);
        setSemaine(d.toISOString().slice(0, 10));
    };

    const nextWeek = () => {
        const d = new Date(semaine + "T00:00:00");
        d.setDate(d.getDate() + 7);
        setSemaine(d.toISOString().slice(0, 10));
    };

    const togglePresence = (ligneIdx, jourIdx) => {
        if (!data) return;
        const lignes = [...data.lignes];
        const ligne = { ...lignes[ligneIdx] };
        const jours = [...ligne.jours];
        const jour = { ...jours[jourIdx] };

        // Cycle: null → true → false → null
        if (jour.present === null || jour.present === undefined) {
            jour.present = true;
            jour.heures_travaillees = "8.0";
        } else if (jour.present === true) {
            jour.present = false;
            jour.heures_travaillees = "0";
        } else {
            jour.present = null;
            jour.heures_travaillees = "0";
        }

        jours[jourIdx] = jour;
        ligne.jours = jours;
        lignes[ligneIdx] = ligne;

        // Recalculate total
        let total = 0;
        ligne.jours.forEach((j) => {
            if (j.present)
                total += parseFloat(j.montant_du || ligne.taux_journalier || 0);
        });
        ligne.total_montant = String(total);

        setData({ ...data, lignes });
        setModified((prev) =>
            new Set(prev).add(`${ligne.employe_id}-${jour.date}`),
        );
    };

    const handleSave = async () => {
        if (!data || saving) return;
        setSaving(true);

        const payload = [];
        data.lignes.forEach((ligne) => {
            ligne.jours.forEach((jour) => {
                if (jour.present !== null && jour.present !== undefined) {
                    payload.push({
                        employe_id: ligne.employe_id,
                        date: jour.date,
                        present: jour.present,
                        heures_travaillees: jour.heures_travaillees || "8.0",
                        projet_ref: jour.projet_ref || "",
                        notes: jour.notes || "",
                    });
                }
            });
        });

        try {
            await api.post("/rh/presences/saisie_semaine/", {
                lignes: payload,
            });
            setModified(new Set());
            load(semaine);
        } catch (err) {
            toast().error("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const cellClass = (present) => {
        if (present === true)
            return "bg-green-100 text-green-700 hover:bg-green-200";
        if (present === false) return "bg-red-50 text-red-400 hover:bg-red-100";
        return "bg-sand-50 text-sand-300 hover:bg-sand-100";
    };

    const cellLabel = (present) => {
        if (present === true) return "✓";
        if (present === false) return "✗";
        return "·";
    };

    if (loading) {
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="h-8 bg-sand-100 rounded w-48 animate-shimmer" />
                    <div className="h-9 bg-sand-100 rounded w-56 animate-shimmer" />
                </div>
                <TableSkeleton rows={6} cols={8} />
            </div>
        );
    }

    if (data && data.lignes.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-page-title text-ink">Pointage — Semaine</h2>
                </div>
                <EmptyState
                    icon="logs"
                    title="Aucun pointage cette semaine"
                    description="Revenez sur la page de pointage journalier pour effectuer les saisies."
                />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-page-title text-ink">Pointage — Semaine</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevWeek}
                        className="px-3 py-1.5 border border-sand-200 rounded-lg text-sm hover:bg-sand-50 transition-colors"
                    >
                        ← Précédent
                    </button>
                    <span className="text-sm font-medium text-sand-700 min-w-[180px] text-center">
                        {data?.semaine_debut
                            ? formatDate(data.semaine_debut)
                            : ""}{" "}
                        →{" "}
                        {data?.jours?.length ? formatShort(data.jours[6]) : ""}
                    </span>
                    <button
                        onClick={nextWeek}
                        className="px-3 py-1.5 border border-sand-200 rounded-lg text-sm hover:bg-sand-50 transition-colors"
                    >
                        Suivant →
                    </button>
                </div>
            </div>

            {/* Info bar */}
            {data && (
                <div className="flex items-center gap-4 mb-4 text-xs text-sand-500">
                    <span>
                        <span className="inline-block w-4 h-4 bg-green-100 rounded mr-1 align-middle"></span>{" "}
                        Présent
                    </span>
                    <span>
                        <span className="inline-block w-4 h-4 bg-red-50 rounded mr-1 align-middle"></span>{" "}
                        Absent
                    </span>
                    <span>
                        <span className="inline-block w-4 h-4 bg-sand-50 rounded mr-1 align-middle"></span>{" "}
                        Non pointé
                    </span>
                    <span className="ml-auto">
                        {data.lignes.length} journaliers · Modifications:{" "}
                        {modified.size}
                    </span>
                </div>
            )}

            {/* Grid */}
            {data && (
                <div className="card overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-border-light bg-sand-50">
                                <th className="table-header sticky left-0 bg-sand-50 z-10">
                                    Employé
                                </th>
                                {data.jours.map((jour) => (
                                    <th
                                        key={jour}
                                        className="text-center px-2 py-2 text-xs font-semibold text-sand-500 uppercase w-[9%]"
                                    >
                                        {formatShort(jour)}
                                    </th>
                                ))}
                                <th className="text-center px-3 py-2 text-xs font-semibold text-sand-500 uppercase w-[9%]">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-50">
                            {data.lignes.map((ligne, li) => (
                                <tr
                                    key={ligne.employe_id}
                                    className="hover:bg-sand-50/50 transition-colors"
                                >
                                    <td className="px-3 py-2 sticky left-0 bg-white z-10">
                                        <div className="text-sm font-medium text-ink truncate max-w-[160px]">
                                            {ligne.employe_nom}
                                        </div>
                                        <div className="text-xs text-sand-500">
                                            {ligne.employe_code}
                                        </div>
                                    </td>
                                    {ligne.jours.map((jour, ji) => {
                                        const modKey = `${ligne.employe_id}-${jour.date}`;
                                        const isModified = modified.has(modKey);
                                        return (
                                            <td
                                                key={jour.date}
                                                className="text-center px-1 py-2"
                                            >
                                                <button
                                                    onClick={() =>
                                                        togglePresence(li, ji)
                                                    }
                                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${cellClass(jour.present)} ${isModified ? "ring-2 ring-forest-400" : ""}`}
                                                    title={`${jour.date}: ${jour.present === true ? "Présent" : jour.present === false ? "Absent" : "Non pointé"}`}
                                                >
                                                    {cellLabel(jour.present)}
                                                </button>
                                            </td>
                                        );
                                    })}
                                    <td className="text-center px-3 py-2">
                                        <span className="text-sm font-semibold text-ink">
                                            {parseFloat(
                                                ligne.total_montant || 0,
                                            ).toLocaleString()}{" "}
                                            F
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Save button */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving || modified.size === 0}
                    className="px-6 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    {saving
                        ? "Enregistrement..."
                        : modified.size > 0
                          ? `Enregistrer (${modified.size})`
                          : "Enregistrer"}
                </button>
            </div>
        </div>
    );
}

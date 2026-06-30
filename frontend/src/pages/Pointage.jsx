import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { toast } from "../store/toastStore";
import { TableSkeleton } from "../components/Skeleton";
import PointageHeader from "../components/pointage/PointageHeader";
import AnomalyBanner from "../components/pointage/AnomalyBanner";
import PointageToolbar from "../components/pointage/PointageToolbar";
import PointageTable from "../components/pointage/PointageTable";

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
            .catch(() => toast().error("Erreur lors du chargement des sites."));
    }, []);

    const togglePresence = (idx) => {
        const updated = [...journaliers];
        const current = updated[idx];
        if (current.present) {
            updated[idx] = { ...current, present: false, heures_travaillees: "0" };
        } else {
            updated[idx] = { ...current, present: true, heures_travaillees: "8.0" };
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
            await api.post("/rh/presences/saisie_journee/", { date, presences });
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
        const confirmed = await toast().confirm("Clôturer tous les pointages de ce mois ?");
        if (!confirmed) return;
        setSaving(true);
        try {
            const [annee, mois] = date.split("-");
            const { data } = await api.post("/rh/presences/cloturer/", {
                mois: parseInt(mois),
                annee: parseInt(annee),
            });
            toast().success(`${data.cloturees} pointage(s) clôturé(s) pour ${mois}/${annee}.`);
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
    const nbBrouillon = journaliers.filter((j) => j.statut === "brouillon").length;

    return (
        <div>
            <PointageHeader />
            <AnomalyBanner anomalies={anomalies} date={date} />
            <PointageToolbar
                date={date}
                onDateChange={setDate}
                nbPresents={nbPresents}
                nbAbsents={nbAbsents}
                nbNonPointe={nbNonPointe}
                nbBrouillon={nbBrouillon}
                saving={saving}
                onSave={save}
                onValider={valider}
                onCloturer={cloturer}
            />
            {loading ? (
                <TableSkeleton rows={8} cols={5} />
            ) : (
                <PointageTable
                    journaliers={journaliers}
                    sites={sites}
                    onToggle={togglePresence}
                    onFieldChange={updateField}
                />
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "../store/toastStore";

export default function TacheCatalogueList() {
    const [taches, setTaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const { data } = await api.get("/operations/taches-catalogue/");
            setTaches(data.results || data);
        } catch (err) {
            toast().error("Erreur lors du chargement des tâches.");
        } finally {
            setLoading(false);
        }
    }

    function startEdit(t) {
        setEditId(t.id);
        setEditForm({
            libelle: t.libelle,
            tarif_reference: t.tarif_reference || "",
            unite_label: t.unite_label,
            seuil: t.seuil || "",
            actif: t.actif,
        });
    }

    async function saveEdit() {
        try {
            await api.put(`/operations/taches-catalogue/${editId}/`, editForm);
            setEditId(null);
            toast().success("Tâche mise à jour.");
            load();
        } catch {
            toast().error("Erreur lors de la mise à jour.");
        }
    }

    if (loading) return <TableSkeleton rows={5} cols={7} />;

    return (
        <div>
            <h2 className="text-page-title text-ink mb-6">Tâches catalogue</h2>

            <div className="card overflow-hidden">
                <table className="w-full table-ekogrh table-striped">
                    <thead>
                        <tr className="border-b border-border-light bg-sand-50">
                            <th className="table-header">Code</th>
                            <th className="table-header">Libellé</th>
                            <th className="table-header">Type</th>
                            <th className="table-header">Unité</th>
                            <th className="table-header text-right">
                                Tarif (FCFA)
                            </th>
                            <th className="table-header text-right">Seuil</th>
                            <th className="table-header text-center">Actif</th>
                            <th className="table-header text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {taches.length === 0 ? (
                            <tr>
                                <td colSpan={8}>
                                    <EmptyState
                                        icon="default"
                                        title="Aucune tâche catalogue"
                                        description="Créez des tâches depuis le module Opérations."
                                        className="border-0 shadow-none"
                                    />
                                </td>
                            </tr>
                        ) : taches.map((t) => (
                            <tr key={t.id}>
                                <td className="px-4 py-3 font-mono text-sm text-forest-600">
                                    {t.code}
                                </td>
                                {editId === t.id ? (
                                    <>
                                        <td className="px-4 py-3">
                                            <input
                                                value={editForm.libelle}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        libelle: e.target.value,
                                                    })
                                                }
                                                className="w-full px-2 py-1 border border-sand-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-sand-600">
                                            {t.type_objectif_display}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                value={editForm.unite_label}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        unite_label:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-20 px-2 py-1 border border-sand-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={editForm.tarif_reference}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        tarif_reference:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-24 px-2 py-1 border border-sand-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-forest-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={editForm.seuil}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        seuil: e.target.value,
                                                    })
                                                }
                                                className="w-20 px-2 py-1 border border-sand-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-forest-500"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={editForm.actif}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        actif: e.target.checked,
                                                    })
                                                }
                                                className="w-4 h-4 text-forest-500 border-sand-200 rounded focus:ring-forest-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={saveEdit}
                                                className="px-2 py-1 text-xs font-medium rounded bg-forest-500 text-white hover:bg-forest-600 mr-1"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => setEditId(null)}
                                                className="px-2 py-1 text-xs font-medium rounded bg-sand-100 text-sand-600 hover:bg-sand-200"
                                            >
                                                ✗
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 font-medium text-ink">
                                            {t.libelle}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-sand-600">
                                            {t.type_objectif_display}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-sand-600">
                                            {t.unite_label}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">
                                            {t.tarif_reference
                                                ? parseFloat(
                                                      t.tarif_reference,
                                                  ).toLocaleString()
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-sand-500">
                                            {t.seuil
                                                ? parseFloat(
                                                      t.seuil,
                                                  ).toLocaleString()
                                                : 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {t.actif ? (
                                                <span className="text-green-600 text-sm font-medium">✓</span>
                                            ) : (
                                                <span className="text-red-400 text-sm font-medium">✗</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => startEdit(t)}
                                                className="text-xs text-forest-600 hover:text-forest-800 font-medium"
                                            >
                                                Modifier
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

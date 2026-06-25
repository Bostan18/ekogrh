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
            console.error(err);
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
            <h2 className="text-2xl font-display font-bold text-ink mb-6">
                Tâches catalogue
            </h2>

            <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-sand-100 bg-sand-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Code
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Libellé
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Type
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Unité
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Tarif (FCFA)
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Seuil
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-sand-500 uppercase">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-50">
                        {taches.map((t) => (
                            <tr key={t.id} className="hover:bg-sand-50">
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

import { useState, useEffect } from "react";
import api from "../api/client";
import { toast } from "../store/toastStore";
import Spinner from "../components/Spinner";
import { TYPE_LABELS } from "../utils/constants";

export default function RetenueCategorieList() {
    const [retenues, setRetenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const { data } = await api.get("/rh/retenues-categories/");
            setRetenues(data.results || data);
        } catch (err) {
            toast().error("Erreur lors du chargement des retenues.");
        } finally {
            setLoading(false);
        }
    }

    async function save(id, field, value) {
        setSaving(id);
        try {
            await api.patch("/rh/retenues-categories/" + id + "/", {
                [field]: value,
            });
            setRetenues((prev) =>
                prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
            );
        } catch (err) {
            toast().error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(null);
        }
    }

    function toPercent(decimal) {
        return (Number(decimal) * 100).toFixed(1);
    }

    if (loading)
        return <Spinner className="h-48" />;

    return (
        <div>
            <h2 className="text-2xl font-display font-bold text-ink mb-2">
                Configuration des retenues
            </h2>
            <p className="text-sm text-sand-500 mb-6">
                Taux légaux CI applicables par catégorie d'employé. Conforme
                Code du Travail n°2015-532, CNPS 2025 et réforme ITS 2024.
            </p>

            <div className="space-y-4">
                {retenues.map((r) => (
                    <div
                        key={r.id}
                        className="bg-white rounded-card shadow-card border border-sand-100 overflow-hidden"
                    >
                        {/* En-tête cliquable */}
                        <button
                            onClick={() =>
                                setExpanded(expanded === r.id ? null : r.id)
                            }
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-sand-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`w-2.5 h-2.5 rounded-full ${r.actif ? "bg-green-500" : "bg-sand-300"}`}
                                ></span>
                                <span className="text-sm font-semibold text-ink">
                                    {TYPE_LABELS[r.type_contrat] ||
                                        r.type_contrat}
                                </span>
                                <span className="text-xs text-sand-400">
                                    CNPS {toPercent(r.taux_cnps_salarial)}% · IS{" "}
                                    {toPercent(r.taux_is)}%
                                </span>
                            </div>
                            <span className="text-xs text-sand-400">
                                {expanded === r.id ? "▴" : "▾"}
                            </span>
                        </button>

                        {/* Détail */}
                        {expanded === r.id && (
                            <div className="px-4 py-3 border-t border-sand-100 space-y-4">
                                {/* CNPS — Salarié */}
                                <div>
                                    <p className="text-xs font-semibold text-sand-500 uppercase mb-2">
                                        CNPS — Part salariale
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="text-xs text-sand-500">
                                            Retraite salarié (%)
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={toPercent(
                                                    r.taux_cnps_salarial,
                                                )}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "taux_cnps_salarial",
                                                        Number(e.target.value) /
                                                            100,
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                        <label className="text-xs text-sand-500">
                                            Plafond retraite (FCFA)
                                            <input
                                                type="number"
                                                step="1"
                                                min="0"
                                                value={Number(r.plafond_cnps)}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "plafond_cnps",
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* CNPS — Employeur */}
                                <div>
                                    <p className="text-xs font-semibold text-sand-500 uppercase mb-2">
                                        CNPS — Parts patronales (info)
                                    </p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <label className="text-xs text-sand-500">
                                            Retraite (%)
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={toPercent(
                                                    r.taux_cnps_patronal_retraite,
                                                )}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "taux_cnps_patronal_retraite",
                                                        Number(e.target.value) /
                                                            100,
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                        <label className="text-xs text-sand-500">
                                            PF + Maternité (%)
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={toPercent(
                                                    r.taux_cnps_patronal_pf,
                                                )}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "taux_cnps_patronal_pf",
                                                        Number(e.target.value) /
                                                            100,
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                        <label className="text-xs text-sand-500">
                                            AT/MP (%)
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={toPercent(
                                                    r.taux_cnps_patronal_at,
                                                )}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "taux_cnps_patronal_at",
                                                        Number(e.target.value) /
                                                            100,
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* ITS */}
                                <div>
                                    <p className="text-xs font-semibold text-sand-500 uppercase mb-2">
                                        ITS — Impôt sur Traitements et Salaires
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="text-xs text-sand-500">
                                            Taux IS (%)
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={toPercent(r.taux_is)}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "taux_is",
                                                        Number(e.target.value) /
                                                            100,
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                        <label className="text-xs text-sand-500">
                                            Frais pro (%)
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={toPercent(
                                                    r.taux_frais_pro,
                                                )}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "taux_frais_pro",
                                                        Number(e.target.value) /
                                                            100,
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                        <label className="text-xs text-sand-500">
                                            Taux IGR (%)
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={toPercent(r.taux_igr)}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "taux_igr",
                                                        Number(e.target.value) /
                                                            100,
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                        <label className="text-xs text-sand-500">
                                            Abattement IGR (FCFA)
                                            <input
                                                type="number"
                                                step="1"
                                                min="0"
                                                value={Number(r.abattement_igr)}
                                                onChange={(e) =>
                                                    save(
                                                        r.id,
                                                        "abattement_igr",
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="w-full mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                disabled={saving === r.id}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* CN progressif */}
                                <div>
                                    <p className="text-xs font-semibold text-sand-500 uppercase mb-2">
                                        CN — Contribution Nationale (barème progressif)
                                    </p>
                                    <div className="space-y-2">
                                        {r.bareme_cn?.length > 0
                                            ? r.bareme_cn.map((tranche, i) => (
                                                  <div
                                                      key={i}
                                                      className="flex items-center gap-2"
                                                  >
                                                      <span className="text-xs text-sand-400 w-12">
                                                          Tranche {i + 1}
                                                      </span>
                                                      <label className="text-xs text-sand-500">
                                                          Seuil (FCFA)
                                                          <input
                                                              type="number"
                                                              step="1"
                                                              min="0"
                                                              value={
                                                                  tranche.seuil ??
                                                                  ""
                                                              }
                                                              onChange={(e) => {
                                                                  const bareme =
                                                                      [
                                                                          ...r.bareme_cn,
                                                                      ];
                                                                  bareme[i] = {
                                                                      ...bareme[
                                                                          i
                                                                      ],
                                                                      seuil:
                                                                          e.target
                                                                              .value ===
                                                                          ""
                                                                              ? null
                                                                              : Number(
                                                                                    e.target
                                                                                        .value,
                                                                                ),
                                                                  };
                                                                  save(
                                                                      r.id,
                                                                      "bareme_cn",
                                                                      bareme,
                                                                  );
                                                              }}
                                                              className="w-28 mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                              disabled={
                                                                  saving === r.id
                                                              }
                                                          />
                                                      </label>
                                                      <label className="text-xs text-sand-500">
                                                          Taux (%)
                                                          <input
                                                              type="number"
                                                              step="0.1"
                                                              min="0"
                                                              max="100"
                                                              value={
                                                                  tranche.taux
                                                                      ? Number(
                                                                            tranche.taux,
                                                                        ) *
                                                                          100
                                                                      : ""
                                                              }
                                                              onChange={(e) => {
                                                                  const bareme =
                                                                      [
                                                                          ...r.bareme_cn,
                                                                      ];
                                                                  bareme[i] = {
                                                                      ...bareme[
                                                                          i
                                                                      ],
                                                                      taux:
                                                                          Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ) /
                                                                          100,
                                                                  };
                                                                  save(
                                                                      r.id,
                                                                      "bareme_cn",
                                                                      bareme,
                                                                  );
                                                              }}
                                                              className="w-20 mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                              disabled={
                                                                  saving === r.id
                                                              }
                                                          />
                                                      </label>
                                                      <label className="text-xs text-sand-500">
                                                          Fixe (FCFA)
                                                          <input
                                                              type="number"
                                                              step="1"
                                                              min="0"
                                                              value={
                                                                  tranche.fixe ??
                                                                  ""
                                                              }
                                                              onChange={(e) => {
                                                                  const bareme =
                                                                      [
                                                                          ...r.bareme_cn,
                                                                      ];
                                                                  bareme[i] = {
                                                                      ...bareme[
                                                                          i
                                                                      ],
                                                                      fixe:
                                                                          Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                  };
                                                                  save(
                                                                      r.id,
                                                                      "bareme_cn",
                                                                      bareme,
                                                                  );
                                                              }}
                                                              className="w-24 mt-1 px-2 py-1.5 border border-sand-200 rounded text-sm"
                                                              disabled={
                                                                  saving === r.id
                                                              }
                                                          />
                                                      </label>
                                                      <button
                                                          onClick={() => {
                                                              const bareme =
                                                                  r.bareme_cn.filter(
                                                                      (_, j) =>
                                                                          j !==
                                                                          i,
                                                                  );
                                                              save(
                                                                  r.id,
                                                                  "bareme_cn",
                                                                  bareme,
                                                              );
                                                          }}
                                                          className="p-1 text-red-400 hover:text-red-600 text-xs"
                                                      >
                                                          ✕
                                                      </button>
                                                  </div>
                                              ))
                                            : null}
                                        <button
                                            onClick={() => {
                                                const bareme = [
                                                    ...(r.bareme_cn || []),
                                                    {
                                                        seuil: null,
                                                        taux: 0,
                                                        fixe: 0,
                                                    },
                                                ];
                                                save(
                                                    r.id,
                                                    "bareme_cn",
                                                    bareme,
                                                );
                                            }}
                                            className="text-xs text-forest-600 hover:text-forest-800 font-medium"
                                        >
                                            + Ajouter une tranche
                                        </button>
                                    </div>
                                </div>

                                {/* Activation */}
                                <div className="flex items-center justify-between pt-2 border-t border-sand-100">
                                    <span className="text-xs text-sand-500">
                                        Catégorie{" "}
                                        {r.actif ? "active" : "inactive"}
                                    </span>
                                    <button
                                        onClick={() =>
                                            save(r.id, "actif", !r.actif)
                                        }
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                            r.actif
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-sand-100 text-sand-500 hover:bg-sand-200"
                                        }`}
                                        disabled={saving === r.id}
                                    >
                                        {r.actif ? "Désactiver" : "Activer"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

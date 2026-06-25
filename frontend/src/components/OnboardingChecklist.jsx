import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const STEPS = [
    {
        key: "employes",
        label: "Créer un premier employé",
        desc: "Ajoutez votre premier employé dans le système",
        link: "/employes/nouveau",
        check: async () => {
            try {
                const { data } = await api.get("/rh/employes/?limit=1");
                return (data.count || 0) > 0;
            } catch {
                return false;
            }
        },
    },
    {
        key: "pointage",
        label: "Effectuer un pointage",
        desc: "Pointez les présences de la journée",
        link: "/pointage",
        check: async () => {
            try {
                const { data } = await api.get("/rh/presences/?limit=1");
                return (data.count || 0) > 0;
            } catch {
                return false;
            }
        },
    },
    {
        key: "paie",
        label: "Générer un bulletin de paie",
        desc: "Générez les bulletins de paie du mois",
        link: "/bulletins",
        check: async () => {
            try {
                const { data } = await api.get("/rh/bulletins/?limit=1");
                return (data.count || 0) > 0;
            } catch {
                return false;
            }
        },
    },
    {
        key: "explore",
        label: "Explorer les autres modules",
        desc: "Familiarisez-vous avec les sites, tâches et logs de travail",
        link: "/sites",
        check: () => Promise.resolve(false),
    },
];

export default function OnboardingChecklist({ onDismiss }) {
    const [steps, setSteps] = useState(
        STEPS.map((s) => ({ ...s, done: false, loading: true })),
    );
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("ekogrh_onboarding_dismissed");
        if (stored === "true") {
            setDismissed(true);
            return;
        }
        checkAll();
    }, []);

    async function checkAll() {
        const results = await Promise.all(
            STEPS.map(async (step, i) => {
                try {
                    const done = await step.check();
                    return { ...step, done, loading: false };
                } catch {
                    return { ...step, done: false, loading: false };
                }
            }),
        );
        setSteps(results);

        const allDone = results.every((s) => s.done);
        if (allDone) {
            localStorage.setItem("ekogrh_onboarding_dismissed", "true");
            setDismissed(true);
            onDismiss?.();
        }
    }

    const handleDismiss = () => {
        localStorage.setItem("ekogrh_onboarding_dismissed", "true");
        setDismissed(true);
        onDismiss?.();
    };

    const doneCount = steps.filter((s) => s.done).length;
    const totalCount = steps.length;
    const progress = Math.round((doneCount / totalCount) * 100);

    if (dismissed) return null;

    // If all steps except the last one are done, auto-dismiss
    if (
        steps.length > 0 &&
        steps.filter((s) => !s.loading).every((s) => s.done)
    ) {
        localStorage.setItem("ekogrh_onboarding_dismissed", "true");
        return null;
    }

    return (
        <div className="card-padded mb-6 border-gold-200">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-display font-semibold text-ink">
                        👋 Bienvenue sur EKOGRH
                    </h3>
                    <p className="text-sm text-sand-500 mt-1">
                        Suivez ces étapes pour bien démarrer :
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-sand-400 hover:text-sand-600 transition-colors p-1"
                    title="Fermer"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-sand-500 mb-1.5">
                    <span>Progression</span>
                    <span>
                        {doneCount}/{totalCount} étapes
                    </span>
                </div>
                <div className="w-full bg-sand-100 rounded-full h-2">
                    <div
                        className="bg-forest-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                {steps.map((step) => (
                    <div
                        key={step.key}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                            step.done
                                ? "bg-green-50 border-green-200"
                                : step.loading
                                  ? "bg-sand-50 border-sand-100"
                                  : "bg-sand-50 border-sand-100 hover:bg-sand-100"
                        }`}
                    >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                            {step.loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sand-400"></div>
                            ) : step.done ? (
                                <span className="text-green-600">✅</span>
                            ) : (
                                <span className="text-sand-300">○</span>
                            )}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-sm font-medium ${step.done ? "text-green-700" : "text-ink"}`}
                            >
                                {step.label}
                            </p>
                            <p className="text-xs text-sand-500">{step.desc}</p>
                        </div>
                        {!step.done && !step.loading && (
                            <Link
                                to={step.link}
                                className="btn-primary text-xs"
                            >
                                Commencer
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

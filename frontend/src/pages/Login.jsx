import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate("/", { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(username, password);
            navigate("/", { replace: true });
        } catch {
            setError("Identifiants invalides. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left — brand panel */}
            <div className="hidden lg:flex w-[480px] bg-sidebar-dark flex-col justify-between p-10 relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-forest-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-gold-500/8 blur-[80px]" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-lg bg-forest-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                E
                            </span>
                        </div>
                        <h1 className="text-display-3 text-white">
                            EKO<span className="text-forest-400">GRH</span>
                        </h1>
                    </div>

                    <div className="space-y-8 max-w-sm">
                        <div>
                            <p className="text-body text-sand-400 leading-relaxed">
                                Plateforme de gestion RH et paie pour les
                                secteurs agricole, BTP et services en Côte
                                d'Ivoire.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    label: "Gestion des employés",
                                    desc: "CDI, CDD, Journaliers, MOO, Stagiaires",
                                },
                                {
                                    label: "Pointage & présences",
                                    desc: "Journalier et hebdomadaire avec alertes",
                                },
                                {
                                    label: "Paie intégrée",
                                    desc: "Bulletins, paiements, missions et exports",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-forest-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg
                                            className="w-3 h-3 text-forest-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4.5 12.75l6 6 9-13.5"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-body-sm font-semibold text-white">
                                            {item.label}
                                        </p>
                                        <p className="text-caption text-sand-500">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="relative z-10 text-caption text-sand-600">
                    © {new Date().getFullYear()} EKO SARL. Tous droits réservés.
                </p>
            </div>

            {/* Right — login form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-content-bg">
                <div className="w-full max-w-[380px]">
                    {/* Mobile brand */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-forest-500 mb-4">
                            <span className="text-white font-bold text-xl">
                                E
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-ink">
                            EKO<span className="text-forest-500">GRH</span>
                        </h1>
                    </div>

                    <div className="card-padded">
                        <div className="mb-6">
                            <h2 className="text-page-title text-ink mb-1">
                                Connexion
                            </h2>
                            <p className="text-body-sm text-sand-500">
                                Accédez à votre espace de gestion
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-body-sm rounded-input">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-body-sm font-semibold text-ink-secondary mb-1.5">
                                    Nom d'utilisateur
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="admin"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-body-sm font-semibold text-ink-secondary mb-1.5">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Connexion...
                                    </span>
                                ) : (
                                    "Se connecter"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

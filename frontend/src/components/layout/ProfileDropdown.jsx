import { LogoutIcon } from "../Icon";

const ROLE_LABELS = {
    admin: "Administrateur",
    rh: "Ressources Humaines",
    comptable: "Comptable",
    chef_equipe: "Chef d'équipe",
    lecture: "Lecture seule",
};

export default function ProfileDropdown({ username, role, onLogout, onClose }) {
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-card-bg rounded-card shadow-modal border border-border-light z-50 py-1">
                <div className="px-4 py-3 border-b border-border-light">
                    <p className="text-body-sm font-semibold text-ink">{username || "Utilisateur"}</p>
                    <p className="text-caption text-sand-500">{ROLE_LABELS[role] || "Utilisateur"}</p>
                </div>
                <button
                    onClick={() => { onLogout(); onClose(); }}
                    className="w-full text-left px-4 py-2.5 text-body-sm text-ink-secondary hover:bg-sand-50 transition-colors duration-fast flex items-center gap-2"
                >
                    <LogoutIcon className="w-4 h-4" />
                    Déconnexion
                </button>
            </div>
        </>
    );
}

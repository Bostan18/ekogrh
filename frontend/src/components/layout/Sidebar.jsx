import { NavLink } from "react-router-dom";
import {
    DashboardIcon,
    UsersIcon,
    ClipboardIcon,
    DocumentIcon,
    UmbrellaIcon,
    CurrencyIcon,
    LogoutIcon,
} from "../Icon";

const NAV_SECTIONS = [
    {
        label: "Principal",
        roles: ["admin", "rh", "comptable", "chef_equipe", "lecture"],
        items: [{ to: "/", label: "Tableau de bord", Icon: DashboardIcon, end: true }],
    },
    {
        label: "Ressources Humaines",
        roles: ["admin", "rh", "comptable"],
        items: [
            { to: "/employes", label: "Employés", Icon: UsersIcon },
            { to: "/pointage", label: "Pointage jour", Icon: ClipboardIcon },
            { to: "/pointage-semaine", label: "Pointage semaine", Icon: ClipboardIcon },
            { to: "/conges", label: "Congés", Icon: UmbrellaIcon },
        ],
    },
    {
        label: "Paie",
        roles: ["admin", "comptable"],
        items: [
            { to: "/bulletins", label: "Bulletins", Icon: DocumentIcon },
            { to: "/paiements", label: "Paiements", Icon: CurrencyIcon },
            { to: "/missions", label: "Missions MOO", Icon: CurrencyIcon },
            { to: "/journaliers", label: "Journaliers", Icon: UsersIcon },
            { to: "/task-payroll", label: "Paie à la tâche", Icon: CurrencyIcon },
            { to: "/retenues", label: "Retenues", Icon: DocumentIcon },
        ],
    },
    {
        label: "Opérations",
        roles: ["admin", "rh", "chef_equipe"],
        items: [
            { to: "/sites", label: "Sites", Icon: DashboardIcon },
            { to: "/taches", label: "Tâches catalogue", Icon: ClipboardIcon },
            { to: "/logs", label: "Logs de travail", Icon: DocumentIcon },
            { to: "/historique", label: "Historique contrats", Icon: DocumentIcon },
        ],
    },
];

const ROLE_LABELS = {
    admin: "Administrateur",
    rh: "Ressources Humaines",
    comptable: "Comptable",
    chef_equipe: "Chef d'équipe",
    lecture: "Lecture seule",
};

const linkClass = ({ isActive }) =>
    isActive
        ? "flex items-center gap-3 px-3 py-2 rounded-btn text-submenu font-semibold bg-forest-500/15 text-forest-400"
        : "flex items-center gap-3 px-3 py-2 rounded-btn text-submenu font-medium text-sand-300 hover:bg-white/5 hover:text-white transition-colors duration-fast";

export default function Sidebar({ role, username, onLogout, onNavClick }) {
    return (
        <aside className="flex flex-col h-full bg-sidebar-dark text-white">
            <div className="flex items-center gap-3 px-5 h-[navbar-h] shrink-0 border-b border-white/5">
                <div className="w-9 h-9 rounded-lg bg-forest-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">E</span>
                </div>
                <div className="min-w-0">
                    <h1 className="text-menu font-bold text-white leading-none">
                        EKO<span className="text-forest-400">GRH</span>
                    </h1>
                    <p className="text-caption text-sand-400 mt-0.5">Gestion RH & Paie</p>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                {NAV_SECTIONS.filter((s) => s.roles.includes(role)).map((section) => (
                    <div key={section.label}>
                        <p className="px-3 mb-1.5 text-[0.6875rem] font-bold text-sand-500 uppercase tracking-[0.1em]">
                            {section.label}
                        </p>
                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={linkClass}
                                    onClick={onNavClick}
                                >
                                    <item.Icon className="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                            {(username || "U")[0].toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-white truncate">{username || "Utilisateur"}</p>
                        <p className="text-caption text-sand-500">{ROLE_LABELS[role] || "Utilisateur"}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="text-sand-500 hover:text-danger transition-colors duration-fast p-1"
                        title="Déconnexion"
                    >
                        <LogoutIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

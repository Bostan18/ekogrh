import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import {
    DashboardIcon,
    UsersIcon,
    ClipboardIcon,
    DocumentIcon,
    UmbrellaIcon,
    CurrencyIcon,
    LogoutIcon,
    MenuIcon,
} from "./Icon";
import Breadcrumb from "./Breadcrumb";
import GlobalSearch from "./GlobalSearch";
import ToastContainer from "./Toast";

const NAV_SECTIONS = [
    {
        label: "Principal",
        roles: ["admin", "rh", "comptable", "chef_equipe", "lecture"],
        items: [
            {
                to: "/",
                label: "Tableau de bord",
                Icon: DashboardIcon,
                end: true,
            },
        ],
    },
    {
        label: "Ressources Humaines",
        roles: ["admin", "rh", "comptable"],
        items: [
            { to: "/employes", label: "Employés", Icon: UsersIcon },
            { to: "/pointage", label: "Pointage jour", Icon: ClipboardIcon },
            {
                to: "/pointage-semaine",
                label: "Pointage semaine",
                Icon: ClipboardIcon,
            },
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
            {
                to: "/task-payroll",
                label: "Paie à la tâche",
                Icon: CurrencyIcon,
            },
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
            {
                to: "/historique",
                label: "Historique contrats",
                Icon: DocumentIcon,
            },
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

export default function Layout() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const role = user?.role || "admin";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const closeSidebar = () => setSidebarOpen(false);

    const linkClass = ({ isActive }) =>
        isActive
            ? "flex items-center gap-3 px-3 py-2 rounded-btn text-submenu font-semibold bg-forest-500/15 text-forest-400"
            : "flex items-center gap-3 px-3 py-2 rounded-btn text-submenu font-medium text-sand-300 hover:bg-white/5 hover:text-white transition-colors duration-fast";

    const isRoot = location.pathname === "/";

    const sidebar = (
        <aside className="flex flex-col h-full bg-sidebar-dark text-white">
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 h-[navbar-h] shrink-0 border-b border-white/5">
                <div className="w-9 h-9 rounded-lg bg-forest-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">E</span>
                </div>
                <div className="min-w-0">
                    <h1 className="text-menu font-bold text-white leading-none">
                        EKO<span className="text-forest-400">GRH</span>
                    </h1>
                    <p className="text-caption text-sand-400 mt-0.5">
                        Gestion RH & Paie
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {NAV_SECTIONS.filter((s) => s.roles.includes(role)).map(
                    (section) => (
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
                                        onClick={closeSidebar}
                                    >
                                        <item.Icon className="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ),
                )}
            </nav>

            {/* User footer */}
            <div className="px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                            {(user?.username || "U")[0].toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-white truncate">
                            {user?.username || "Utilisateur"}
                        </p>
                        <p className="text-caption text-sand-500">
                            {ROLE_LABELS[role] || "Utilisateur"}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sand-500 hover:text-danger transition-colors duration-fast p-1"
                        title="Déconnexion"
                    >
                        <LogoutIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-content-bg">
            <ToastContainer />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={closeSidebar}
                />
            )}

            {/* Mobile sidebar drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-[258px] transform transition-transform duration-300 ease-out lg:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {sidebar}
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:block w-sidebar shrink-0">
                <div className="fixed inset-y-0 w-sidebar">{sidebar}</div>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Top bar */}
                <header className="flex items-center gap-4 h-[navbar-h] shrink-0 px-5 bg-card-bg border-b border-border-light shadow-elevation-1 z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-ink-secondary hover:text-ink transition-colors duration-fast"
                        aria-label="Menu"
                    >
                        <MenuIcon className="w-5 h-5" />
                    </button>

                    <div className="hidden lg:block flex-1">
                        {!isRoot && <Breadcrumb />}
                    </div>

                    <GlobalSearch />
                </header>

                {/* Page content */}
                <div className="flex-1 p-5 lg:p-7 max-w-[1400px] mx-auto w-full">
                    <div className="lg:hidden mb-3">
                        {!isRoot && <Breadcrumb />}
                    </div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

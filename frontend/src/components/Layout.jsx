import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
            {
                to: "/retenues",
                label: "Retenues",
                Icon: DocumentIcon,
            },
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const role = user?.role || "admin";

    const linkClass = ({ isActive }) =>
        isActive
            ? "flex items-center gap-2.5 px-3 py-1.5 rounded text-sm font-medium bg-forest-50 text-forest-700"
            : "flex items-center gap-2.5 px-3 py-1.5 rounded text-sm font-medium text-sand-600 hover:bg-sand-50 hover:text-ink transition-colors";

    const closeSidebar = () => setSidebarOpen(false);

    const sidebar = (
        <>
            <div className="p-4 border-b border-sand-100">
                <h1 className="text-lg font-display font-bold text-forest-700">
                    <span className="text-forest-500">EKO</span>GRH
                </h1>
                <p className="text-xs text-sand-500 mt-0.5">
                    Gestion RH & Paie
                </p>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-3">
                {NAV_SECTIONS.filter((section) =>
                    section.roles.includes(role),
                ).map((section) => (
                    <div key={section.label}>
                        <p className="px-3 py-1 text-xs font-semibold text-sand-400 uppercase tracking-wider">
                            {section.label}
                        </p>
                        <div className="space-y-0.5 mt-0.5">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={linkClass}
                                    onClick={closeSidebar}
                                >
                                    <item.Icon className="w-4 h-4 flex-shrink-0" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-3 border-t border-sand-100">
                <div className="flex items-center justify-between">
                    <div className="text-sm leading-tight">
                        <p className="font-medium text-ink text-xs">
                            {user?.username || "Utilisateur"}
                        </p>
                        <p className="text-xs text-sand-400">
                            {ROLE_LABELS[role] || "Utilisateur"}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sand-400 hover:text-red-500 transition-colors p-1"
                        title="Déconnexion"
                    >
                        <LogoutIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-sand-50">
            <ToastContainer />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-sand-200 flex flex-col transform transition-transform duration-200 lg:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {sidebar}
            </aside>

            <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-sand-200 shrink-0">
                {sidebar}
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="lg:hidden flex items-center gap-3 p-4 border-b border-sand-200 bg-white">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-sand-600 hover:text-ink"
                        aria-label="Menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h2 className="font-display font-bold text-forest-700 text-lg flex-1">
                        <span className="text-forest-500">EKO</span>GRH
                    </h2>
                </div>

                <div className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-sand-200 bg-white">
                    <Breadcrumb />
                    <GlobalSearch />
                </div>

                <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                    <div className="lg:hidden mb-4">
                        <Breadcrumb />
                    </div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

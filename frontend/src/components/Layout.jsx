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

const NAV_ITEMS = [
    { to: "/", label: "Tableau de bord", Icon: DashboardIcon },
    { to: "/employes", label: "Employés", Icon: UsersIcon },
    { to: "/pointage", label: "Pointage", Icon: ClipboardIcon },
    { to: "/bulletins", label: "Bulletins", Icon: DocumentIcon },
    { to: "/conges", label: "Congés", Icon: UmbrellaIcon },
    { to: "/paiements", label: "Paiements", Icon: CurrencyIcon },
];

export default function Layout() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const linkClass = ({ isActive }) =>
        isActive
            ? "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-forest-50 text-forest-700"
            : "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sand-600 hover:bg-sand-50 hover:text-ink transition-colors";

    const closeSidebar = () => setSidebarOpen(false);

    const sidebar = (
        <>
            <div className="p-5 border-b border-sand-100">
                <h1 className="text-xl font-display font-bold text-forest-700">
                    <span className="text-forest-500">EKO</span>GRH
                </h1>
                <p className="text-xs text-sand-500 mt-0.5">
                    Gestion RH & Paie
                </p>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        className={linkClass}
                        onClick={closeSidebar}
                    >
                        <item.Icon className="w-5 h-5 flex-shrink-0" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-sand-100">
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <p className="font-medium text-ink">
                            {user?.username || "Utilisateur"}
                        </p>
                        <p className="text-xs text-sand-500">Administrateur</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sand-400 hover:text-red-500 transition-colors"
                        title="Déconnexion"
                    >
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-sand-50">
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar mobile (overlay) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-sand-200 flex flex-col transform transition-transform duration-200 lg:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {sidebar}
            </aside>

            {/* Sidebar desktop (always visible) */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-sand-200 shrink-0">
                {sidebar}
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top bar mobile */}
                <div className="lg:hidden flex items-center gap-3 p-4 border-b border-sand-200 bg-white">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-sand-600 hover:text-ink"
                        aria-label="Menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h2 className="font-display font-bold text-forest-700 text-lg">
                        <span className="text-forest-500">EKO</span>GRH
                    </h2>
                </div>

                <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

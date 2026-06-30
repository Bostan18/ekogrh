import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { MenuIcon } from "./Icon";
import Sidebar from "./layout/Sidebar";
import ProfileDropdown from "./layout/ProfileDropdown";
import Breadcrumb from "./Breadcrumb";
import GlobalSearch from "./GlobalSearch";
import ToastContainer from "./Toast";

export default function Layout() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const role = user?.role || "admin";

    const handleLogout = () => { logout(); navigate("/login"); };
    const closeSidebar = () => setSidebarOpen(false);
    const isRoot = location.pathname === "/";

    return (
        <div className="flex h-screen bg-content-bg">
            <ToastContainer />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={closeSidebar} />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-[258px] transform transition-transform duration-300 ease-out lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <Sidebar role={role} username={user?.username} onLogout={handleLogout} onNavClick={closeSidebar} />
            </div>

            <div className="hidden lg:block w-sidebar shrink-0">
                <div className="fixed inset-y-0 w-sidebar">
                    <Sidebar role={role} username={user?.username} onLogout={handleLogout} />
                </div>
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col">
                <header className="flex items-center gap-3 h-[navbar-h] shrink-0 px-6 bg-card-bg border-b border-border-light z-10">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-sand-500 hover:text-ink transition-colors duration-fast" aria-label="Menu">
                        <MenuIcon className="w-5 h-5" />
                    </button>

                    <span className="lg:hidden font-bold text-ink text-lg">
                        EKO<span className="text-forest-500">GRH</span>
                    </span>

                    <div className="hidden lg:block flex-1">
                        {!isRoot && <Breadcrumb />}
                    </div>

                    <div className="flex-1 lg:hidden" />

                    <GlobalSearch />

                    <div className="relative">
                        <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-fast">
                            <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{(user?.username || "U")[0].toUpperCase()}</span>
                            </div>
                            <span className="hidden md:block text-body-sm font-semibold text-ink">{user?.username || "Utilisateur"}</span>
                        </button>

                        {profileOpen && (
                            <ProfileDropdown
                                username={user?.username}
                                role={role}
                                onLogout={handleLogout}
                                onClose={() => setProfileOpen(false)}
                            />
                        )}
                    </div>
                </header>

                <div className="flex-1 p-5 lg:p-7 max-w-[1400px] mx-auto w-full">
                    <div className="lg:hidden mb-3">{!isRoot && <Breadcrumb />}</div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

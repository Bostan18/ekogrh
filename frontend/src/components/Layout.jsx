import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";
import { MenuIcon, BellIcon, EmailIcon } from "./Icon";
import Sidebar from "./layout/Sidebar";

import NotificationDropdown from "./layout/NotificationDropdown";
import MessageDropdown from "./layout/MessageDropdown";
import Breadcrumb from "./Breadcrumb";
import GlobalSearch from "./GlobalSearch";
import ToastContainer from "./Toast";

export default function Layout() {
    const { logout, user } = useAuthStore();
    const { fetchAll, unreadNotifCount, unreadMsgCount } =
        useNotificationStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [notifOpen, setNotifOpen] = useState(false);
    const [messageOpen, setMessageOpen] = useState(false);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);
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
                <header className="flex items-center gap-3 h-navbar-h shrink-0 px-6 bg-card-bg border-b border-border-light z-10">
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

                    <div className="flex items-center gap-1">
                        <div className="relative">
                            <button onClick={() => { setNotifOpen(!notifOpen); setMessageOpen(false); }} className="relative p-2 text-sand-500 hover:text-ink transition-colors duration-fast" aria-label="Notifications">
                                <BellIcon className="w-5 h-5" />
                                {unreadNotifCount > 0 && (
                                    <span className="absolute top-1.5 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-card-bg animate-pulse-notif" />
                                )}
                            </button>
                            {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
                        </div>

                        <div className="relative">
                            <button onClick={() => { setMessageOpen(!messageOpen); setNotifOpen(false); }} className="relative p-2 text-sand-500 hover:text-ink transition-colors duration-fast" aria-label="Messages">
                                <EmailIcon className="w-5 h-5" />
                                {unreadMsgCount > 0 && (
                                    <span className="absolute top-1.5 right-1 w-2.5 h-2.5 bg-success rounded-full border-2 border-card-bg animate-pulse-notif" />
                                )}
                            </button>
                            {messageOpen && <MessageDropdown onClose={() => setMessageOpen(false)} />}
                        </div>
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

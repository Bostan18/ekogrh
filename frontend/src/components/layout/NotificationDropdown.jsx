import useNotificationStore from "../../store/notificationStore";

const ICON_PATHS = {
    calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    settings:
        "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
    account:
        "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
};

const ICON_COLORS = {
    calendar: "bg-success",
    settings: "bg-warning",
    account: "bg-info",
};

export default function NotificationDropdown({ onClose }) {
    const { notifications, markRead, markAllRead } = useNotificationStore();

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className="absolute right-0 top-full mt-2 min-w-[220px] bg-card-bg rounded-card shadow-modal border-0 z-50 overflow-hidden">
                <h6 className="px-3 py-4 bg-sidebar-dark text-white text-body-sm font-semibold">
                    Notifications
                </h6>
                <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 && (
                        <div className="py-8 text-center text-caption text-sand-500">
                            Aucune notification
                        </div>
                    )}
                    {notifications.map((item, i) => (
                        <div key={item.id}>
                            {i > 0 && (
                                <div className="mx-3 border-t border-border-light" />
                            )}
                            <button
                                className="w-full text-left px-6 py-3 flex items-start gap-3 hover:bg-sand-50 transition-colors duration-fast"
                                onClick={() => markRead(item.id)}
                            >
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${ICON_COLORS[item.icon] || "bg-forest-500"}`}
                                >
                                    {ICON_PATHS[item.icon] ? (
                                        <svg
                                            className="w-[18px] h-[18px] text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d={ICON_PATHS[item.icon]}
                                            />
                                        </svg>
                                    ) : (
                                        <span className="text-xs font-bold text-white">
                                            {item.title[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 leading-none">
                                    <h6 className="text-body-sm font-normal text-ink mb-0.5">
                                        {item.title}
                                    </h6>
                                    <p className="text-caption text-sand-500 truncate">
                                        {item.description}
                                    </p>
                                    <p className="text-caption text-sand-400 mt-0.5">
                                        {item.time_ago}
                                    </p>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="border-t border-border-light">
                    <button
                        className="w-full text-center text-body-sm text-sand-600 hover:text-ink hover:bg-sand-50 transition-colors duration-fast py-3"
                        onClick={() => {
                            markAllRead();
                            onClose();
                        }}
                    >
                        Voir toutes les notifications
                    </button>
                </div>
            </div>
        </>
    );
}

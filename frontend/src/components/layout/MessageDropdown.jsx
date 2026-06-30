import useNotificationStore from "../../store/notificationStore";

const AVATAR_COLORS = [
    "bg-forest-500",
    "bg-gold-500",
    "bg-info",
    "bg-danger",
    "bg-success",
    "bg-warning",
];

export default function MessageDropdown({ onClose }) {
    const { messages, markRead } = useNotificationStore();

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className="absolute right-0 top-full mt-2 min-w-[220px] bg-card-bg rounded-card shadow-modal border-0 z-50 overflow-hidden">
                <h6 className="px-3 py-4 bg-sidebar-dark text-white text-body-sm font-semibold">
                    Messages
                </h6>
                <div className="max-h-[320px] overflow-y-auto">
                    {messages.length === 0 && (
                        <div className="py-8 text-center text-caption text-sand-500">
                            Aucun message
                        </div>
                    )}
                    {messages.map((item, i) => (
                        <div key={item.id}>
                            {i > 0 && (
                                <div className="mx-3 border-t border-border-light" />
                            )}
                            <button
                                className="w-full text-left px-6 py-3 flex items-start gap-3 hover:bg-sand-50 transition-colors duration-fast"
                                onClick={() => markRead(item.id)}
                            >
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                                >
                                    <span className="text-xs font-bold text-white">
                                        {(item.title || "?")[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 leading-none">
                                    <h6 className="text-body-sm font-normal text-ink truncate mb-0.5">
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
                        onClick={onClose}
                    >
                        {messages.length > 0
                            ? `${messages.filter((m) => !m.is_read).length} nouveau${messages.filter((m) => !m.is_read).length > 1 ? "x" : ""} message${messages.length > 1 ? "s" : ""}`
                            : "Aucun message"}
                    </button>
                </div>
            </div>
        </>
    );
}

import useToastStore from "../store/toastStore";

const ICONS = {
    success: (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    error: (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    warning: (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
        </svg>
    ),
    info: (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
        </svg>
    ),
};

const COLORS = {
    success: "border-success/20 bg-success/5 text-success",
    error: "border-danger/20 bg-danger/5 text-danger",
    warning: "border-gold-200 bg-gold-50/80 text-gold-700",
    info: "border-info/20 bg-info/5 text-info",
    confirm: "border-border-light bg-card-bg text-ink",
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore();
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) =>
                toast.type === "confirm" ? (
                    <ConfirmToast
                        key={toast.id}
                        toast={toast}
                        onDismiss={removeToast}
                    />
                ) : (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-card border shadow-modal backdrop-blur-sm animate-slide-in ${COLORS[toast.type] || COLORS.info}`}
                    >
                        <span className="flex-shrink-0 mt-0.5">
                            {ICONS[toast.type] || ICONS.info}
                        </span>
                        <p className="text-body-sm flex-1">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                ),
            )}
        </div>
    );
}

function ConfirmToast({ toast, onDismiss }) {
    return (
        <div className="pointer-events-auto card p-4 shadow-modal">
            <p className="text-body-sm text-ink mb-3">{toast.message}</p>
            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => {
                        toast.onCancel?.();
                        onDismiss(toast.id);
                    }}
                    className="btn-outline text-sm"
                >
                    Annuler
                </button>
                <button
                    onClick={() => {
                        toast.onConfirm?.();
                        onDismiss(toast.id);
                    }}
                    className="btn-primary text-sm"
                >
                    Confirmer
                </button>
            </div>
        </div>
    );
}

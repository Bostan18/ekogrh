import { create } from "zustand";
import api from "../api/client";

const useNotificationStore = create((set, get) => ({
    notifications: [],
    messages: [],
    unreadNotifCount: 0,
    unreadMsgCount: 0,
    loading: false,

    fetchAll: async () => {
        set({ loading: true });
        try {
            const [notifRes, msgRes, countRes] = await Promise.all([
                api.get("/core/notifications/", {
                    params: { type: "notification" },
                }),
                api.get("/core/notifications/", {
                    params: { type: "message" },
                }),
                api.get("/core/notifications/unread_count/"),
            ]);

            set({
                notifications: notifRes.data.results || notifRes.data || [],
                messages: msgRes.data.results || msgRes.data || [],
                unreadNotifCount: countRes.data.notifications || 0,
                unreadMsgCount: countRes.data.messages || 0,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    markRead: async (id) => {
        try {
            await api.post(`/core/notifications/${id}/mark_read/`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n,
                ),
                messages: state.messages.map((m) =>
                    m.id === id ? { ...m, is_read: true } : m,
                ),
                unreadNotifCount: Math.max(0, state.unreadNotifCount - 1),
                unreadMsgCount: Math.max(0, state.unreadMsgCount - 1),
            }));
        } catch {}
    },

    markAllRead: async () => {
        try {
            await api.post("/core/notifications/mark_all_read/");
            set((state) => ({
                notifications: state.notifications.map((n) => ({
                    ...n,
                    is_read: true,
                })),
                messages: state.messages.map((m) => ({
                    ...m,
                    is_read: true,
                })),
                unreadNotifCount: 0,
                unreadMsgCount: 0,
            }));
        } catch {}
    },
}));

export default useNotificationStore;

import { create } from "zustand";
import api from "../api/client";

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    loading: true,

    login: async (username, password) => {
        const { data } = await api.post("/token/", { username, password });
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        // Decode JWT payload for role
        let role = "admin";
        try {
            const payload = JSON.parse(atob(data.access.split(".")[1]));
            role = payload.role || "admin";
        } catch {}

        set({
            user: { username, role, isAdmin: role === "admin" },
            isAuthenticated: true,
            loading: false,
        });
        return { username, role };
    },

    logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        set({ user: null, isAuthenticated: false, loading: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            set({ loading: false });
            return;
        }
        try {
            const refresh = localStorage.getItem("refresh_token");
            if (refresh) {
                await api.post("/token/refresh/", { refresh });
            }

            // Decode JWT payload for role
            let role = "admin";
            let username = "admin";
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                role = payload.role || "admin";
                username = payload.username || "admin";
            } catch {}

            set({
                user: { username, role, isAdmin: role === "admin" },
                isAuthenticated: true,
                loading: false,
            });
        } catch {
            localStorage.clear();
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },
}));

export default useAuthStore;

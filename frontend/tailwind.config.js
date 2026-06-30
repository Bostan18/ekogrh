/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            // ──────────────────────────────────────────────
            // 🎨 Palette principale — EKOGRH (Terre & Précision)
            // ──────────────────────────────────────────────
            colors: {
                // ▸ Brand — vert forêt profond, signature EKO
                forest: {
                    50: "#eaf7ef",
                    100: "#d3eedc",
                    200: "#a7e3c0",
                    300: "#6cc996",
                    400: "#3ba973",
                    500: "#1f8f53",
                    600: "#157a45",
                    700: "#1a6539",
                    800: "#1c4f33",
                    900: "#173e29",
                    950: "#0f2b1c",
                },

                // ▸ Neutre chaud — sable ivoirien
                sand: {
                    50: "#fafaf6",
                    100: "#f3f1eb",
                    200: "#dedbd2",
                    300: "#c1bdb1",
                    400: "#a09b8d",
                    500: "#7e7a6e",
                    600: "#605d54",
                    700: "#48463f",
                    800: "#33312c",
                },

                // ▸ Accent — or africain, chaleur et action
                gold: {
                    50: "#fdf8e8",
                    100: "#f5ecc8",
                    200: "#e5cd8b",
                    300: "#d4b257",
                    400: "#d0a634",
                    500: "#c89a1d",
                    600: "#a98317",
                    700: "#8a6c11",
                    800: "#6b520c",
                    900: "#4d3a08",
                },

                // ▸ Texte principal — encre profonde
                ink: "#1a1814",
                "ink-secondary": "#5c5950",

                // ▸ Sidebar dark
                "sidebar-dark": "#181824",
                "sidebar-light": "#ffffff",

                // ▸ Thème boutons — Connect Plus (Nordic UI)
                btn: {
                    primary: "#0062ff",
                    secondary: "#8e94a9",
                    success: "#44ce42",
                    info: "#a461d8",
                    warning: "#ffc542",
                    danger: "#fc5a5a",
                    light: "#aab2bd",
                    dark: "#001737",
                },

                // ▸ Backgrounds applicatifs
                "content-bg": "#f0f2f5",
                "card-bg": "#ffffff",

                // ▸ Bordures
                "border-color": "rgba(151,151,151, 0.3)",
                "border-light": "#e8e5df",

                // ▸ Tableaux
                "table-accent": "#f0f1f6",
                "table-dark-bg": "#2a2b32",
            },

            // ──────────────────────────────────────────────
            // 🔤 Typographie — Nunito (300 / 400 / 600 / 700)
            // ──────────────────────────────────────────────
            fontFamily: {
                display: ['"Nunito"', "sans-serif"],
                body: ['"Nunito"', "sans-serif"],
                mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
            },
            fontSize: {
                "display-1": [
                    "3.75rem",
                    { lineHeight: "1.1", fontWeight: "700" },
                ],
                "display-2": [
                    "2.5rem",
                    { lineHeight: "1.2", fontWeight: "700" },
                ],
                "display-3": [
                    "1.875rem",
                    { lineHeight: "1.25", fontWeight: "700" },
                ],
                "page-title": [
                    "1.5rem",
                    { lineHeight: "1.3", fontWeight: "700" },
                ],
                "section-title": [
                    "1.125rem",
                    { lineHeight: "1.4", fontWeight: "700" },
                ],
                menu: ["0.937rem", { lineHeight: "1.4", fontWeight: "600" }],
                submenu: [
                    "0.8125rem",
                    { lineHeight: "1.4", fontWeight: "400" },
                ],
                body: ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }],
                "body-sm": [
                    "0.8125rem",
                    { lineHeight: "1.5", fontWeight: "400" },
                ],
                caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
            },

            // ──────────────────────────────────────────────
            // 📐 Dimensions & Layout
            // ──────────────────────────────────────────────
            spacing: {
                sidebar: "16.125rem", // 258px
                "sidebar-min": "11.5625rem", // 185px
                "sidebar-icon": "4.375rem", // 70px
                "navbar-h": "4rem", // 64px
            },

            // ──────────────────────────────────────────────
            // 📦 Box Shadows — elevation system
            // ──────────────────────────────────────────────
            boxShadow: {
                "elevation-0": "none",
                "elevation-1":
                    "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
                "elevation-2":
                    "0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)",
                "elevation-3":
                    "0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.05)",
                "elevation-4":
                    "0 20px 25px rgba(0,0,0,0.06), 0 10px 10px rgba(0,0,0,0.04)",
                drawer: "-8px 0 40px rgba(0,0,0,0.12)",
                modal: "0 25px 50px rgba(0,0,0,0.15)",
            },

            // ──────────────────────────────────────────────
            // 🔘 Border Radius
            // ──────────────────────────────────────────────
            borderRadius: {
                btn: "0.1875rem", // 3px — boutons (Connect Plus)
                input: "2px", // 2px — champs (Connect Plus)
                card: "0.75rem", // 12px — cartes
                modal: "0.875rem", // 14px — modales
                full: "9999px",
                DEFAULT: "0.5rem",
            },

            // ──────────────────────────────────────────────
            // ⏱ Transitions
            // ──────────────────────────────────────────────
            transitionDuration: {
                DEFAULT: "250ms",
                fast: "150ms",
                slow: "350ms",
            },
            transitionTimingFunction: {
                DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
            },

            keyframes: {
                "pulse-notif": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.3" },
                },
            },
            animation: {
                "pulse-notif": "pulse-notif 3s ease-out infinite",
            },
        },
    },
    plugins: [],
};

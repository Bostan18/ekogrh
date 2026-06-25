import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

function SearchIcon({ className = "w-5 h-5" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
        </svg>
    );
}

const CATEGORY_LABELS = {
    employes: "Employés",
    bulletins: "Bulletins de paie",
    sites: "Sites",
    missions: "Missions MOO",
};

const CATEGORY_ICONS = {
    employes: "👤",
    bulletins: "📄",
    sites: "📍",
    missions: "📋",
};

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    const flatResults = results
        ? Object.entries(results).flatMap(([category, items]) =>
              items.map((item) => ({ ...item, _category: category })),
          )
        : [];

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
            setQuery("");
            setResults(null);
            setSelectedIndex(0);
        }
    }, [open]);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults(null);
            return;
        }
        const timer = setTimeout(() => {
            search(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    const search = useCallback(async (q) => {
        setLoading(true);
        try {
            const { data } = await api.get("/search/", { params: { q } });
            setResults(data.results || data);
        } catch {
            setResults(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSelect = (item) => {
        setOpen(false);
        switch (item._category) {
            case "employes":
                navigate(`/employes/${item.id}`);
                break;
            case "bulletins":
                navigate(`/bulletins/${item.id}`);
                break;
            case "sites":
                navigate("/sites");
                break;
            case "missions":
                navigate("/missions");
                break;
            default:
                break;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                Math.min(prev + 1, flatResults.length - 1),
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex]);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-body-sm text-sand-500 bg-sand-50 hover:bg-white border border-border-light rounded-btn transition-colors duration-fast w-56"
                title="Recherche rapide (Ctrl+K)"
            >
                <SearchIcon className="w-3.5 h-3.5" />
                <span className="flex-1 text-left">Rechercher...</span>
                <kbd className="text-[10px] font-mono text-sand-400 bg-white border border-sand-200 rounded px-1 py-0.5">
                    Ctrl+K
                </kbd>
            </button>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh]"
            onClick={() => setOpen(false)}
        >
            <div className="fixed inset-0 bg-black/30" />
            <div
                ref={containerRef}
                className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-sand-200 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-sand-100">
                    <SearchIcon className="w-5 h-5 text-sand-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Rechercher un employé, bulletin, site..."
                        className="flex-1 text-sm outline-none text-ink placeholder-sand-400"
                    />
                    <kbd className="hidden sm:inline text-[10px] font-mono text-sand-400 bg-sand-50 border border-sand-200 rounded px-1.5 py-0.5">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-forest-500"></div>
                        </div>
                    )}

                    {!loading && results && flatResults.length === 0 && (
                        <div className="py-8 text-center text-sm text-sand-500">
                            Aucun résultat pour « {query} »
                        </div>
                    )}

                    {!loading &&
                        results &&
                        Object.entries(results).map(([category, items]) =>
                            items.length > 0 ? (
                                <div key={category}>
                                    <div className="px-4 py-1.5 text-[10px] font-semibold text-sand-400 uppercase bg-sand-50">
                                        {CATEGORY_LABELS[category] || category}
                                    </div>
                                    {items.map((item, i) => {
                                        const idx = flatResults.indexOf(item);
                                        return (
                                            <button
                                                key={`${category}-${item.id}`}
                                                onClick={() =>
                                                    handleSelect(item)
                                                }
                                                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                                                    idx === selectedIndex
                                                        ? "bg-forest-50 text-forest-700"
                                                        : "hover:bg-sand-50 text-ink"
                                                }`}
                                            >
                                                <span className="text-base flex-shrink-0">
                                                    {CATEGORY_ICONS[category] ||
                                                        "•"}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">
                                                        {item.nom_complet ||
                                                            item.employe_nom ||
                                                            item.nom ||
                                                            item.description}
                                                    </div>
                                                    {(item.code ||
                                                        item.employe_code) && (
                                                        <div className="text-xs text-sand-500 truncate">
                                                            {item.code ||
                                                                item.employe_code}
                                                            {item.poste
                                                                ? ` — ${item.poste}`
                                                                : ""}
                                                            {item.mois
                                                                ? ` — ${item.mois}`
                                                                : ""}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-sand-400 uppercase flex-shrink-0">
                                                    {CATEGORY_LABELS[category]}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null,
                        )}

                    {!loading && !results && query.length >= 2 && (
                        <div className="py-8 text-center text-sm text-sand-500">
                            Commencez à taper pour chercher...
                        </div>
                    )}

                    {!loading && !results && query.length < 2 && (
                        <div className="py-8 text-center text-sm text-sand-500">
                            Tapez au moins 2 caractères pour lancer la recherche
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

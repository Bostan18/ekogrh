import { MOIS_NOMS_0, currentMonth as curMonth, currentYear as curYear } from "../utils/constants";

export default function MonthYearPicker({
    month,
    year,
    onChange,
    label = "",
    showMonth = true,
    showYear = true,
    className = "",
}) {
    const effectiveMonth = month || curMonth();
    const effectiveYear = year || curYear();

    const handlePrevMonth = () => {
        if (effectiveMonth === 1) {
            onChange({ month: 12, year: effectiveYear - 1 });
        } else {
            onChange({ month: effectiveMonth - 1, year: effectiveYear });
        }
    };

    const handleNextMonth = () => {
        if (effectiveMonth === 12) {
            onChange({ month: 1, year: effectiveYear + 1 });
        } else {
            onChange({ month: effectiveMonth + 1, year: effectiveYear });
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-sand-500 uppercase">
                    {label}
                </label>
            )}
            <button
                onClick={handlePrevMonth}
                className="px-2 py-1.5 border border-border-light rounded-btn text-body-sm hover:bg-sand-50 transition-colors duration-fast"
                title="Mois précédent"
                type="button"
            >
                ←
            </button>
            {showMonth && (
                <select
                    value={effectiveMonth}
                    onChange={(e) =>
                        onChange({
                            month: parseInt(e.target.value),
                            year: effectiveYear,
                        })
                    }
                    className="select-field w-auto"
                >
                    {MOIS_NOMS_0.map((nom, i) => (
                        <option key={i + 1} value={i + 1}>
                            {nom}
                        </option>
                    ))}
                </select>
            )}
            {showYear && (
                <input
                    type="number"
                    value={effectiveYear}
                    onChange={(e) =>
                        onChange({
                            month: effectiveMonth,
                            year: parseInt(e.target.value) || effectiveYear,
                        })
                    }
                    className="input-field w-24"
                    min={2020}
                    max={2100}
                />
            )}
            <button
                onClick={handleNextMonth}
                className="px-2 py-1.5 border border-border-light rounded-btn text-body-sm hover:bg-sand-50 transition-colors duration-fast"
                title="Mois suivant"
                type="button"
            >
                →
            </button>
        </div>
    );
}

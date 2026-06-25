const MOIS_NOMS = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
];

export default function MonthYearPicker({
    month,
    year,
    onChange,
    label = "",
    showMonth = true,
    showYear = true,
    className = "",
}) {
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            onChange({ month: 12, year: currentYear - 1 });
        } else {
            onChange({ month: currentMonth - 1, year: currentYear });
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            onChange({ month: 1, year: currentYear + 1 });
        } else {
            onChange({ month: currentMonth + 1, year: currentYear });
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
                    value={currentMonth}
                    onChange={(e) =>
                        onChange({
                            month: parseInt(e.target.value),
                            year: currentYear,
                        })
                    }
                    className="select-field w-auto"
                >
                    {MOIS_NOMS.map((nom, i) => (
                        <option key={i + 1} value={i + 1}>
                            {nom}
                        </option>
                    ))}
                </select>
            )}
            {showYear && (
                <input
                    type="number"
                    value={currentYear}
                    onChange={(e) =>
                        onChange({
                            month: currentMonth,
                            year: parseInt(e.target.value) || currentYear,
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

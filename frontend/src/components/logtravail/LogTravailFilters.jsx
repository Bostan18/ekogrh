export default function LogTravailFilters({ employes, filterEmploye, onEmployeChange, filterDate, onDateChange }) {
    return (
        <div className="flex gap-3 mb-4">
            <select
                value={filterEmploye}
                onChange={(e) => onEmployeChange(e.target.value)}
                className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
                <option value="">Tous les employés</option>
                {employes.map((e) => (
                    <option key={e.id} value={e.id}>
                        {e.nom_complet}
                    </option>
                ))}
            </select>
            <input
                type="date"
                value={filterDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
        </div>
    );
}

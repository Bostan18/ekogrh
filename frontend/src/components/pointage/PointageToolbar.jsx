export default function PointageToolbar({
    date,
    onDateChange,
    nbPresents,
    nbAbsents,
    nbNonPointe,
    nbBrouillon,
    saving,
    onSave,
    onValider,
    onCloturer,
}) {
    return (
        <div className="bg-white rounded-xl shadow-card border border-sand-100 p-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-sand-700">
                        Date :
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                    />
                </div>
                <div className="flex gap-4 text-sm">
                    <span className="text-green-700 font-medium">
                        {nbPresents} présents
                    </span>
                    <span className="text-red-600 font-medium">
                        {nbAbsents} absents
                    </span>
                    <span className="text-sand-500">
                        {nbNonPointe} non pointés
                    </span>
                    {nbBrouillon > 0 && (
                        <span className="text-gold-700 font-medium">
                            {nbBrouillon} brouillon
                        </span>
                    )}
                </div>
                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={onCloturer}
                        disabled={saving}
                        className="px-4 py-2 bg-sand-200 hover:bg-sand-300 text-sand-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        Clôturer
                    </button>
                    <button
                        onClick={onValider}
                        disabled={saving}
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        Valider
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function LogTravailRow({ log, onPayer, onDelete }) {
    return (
        <tr key={log.id}>
            <td className="px-4 py-3">
                <div className="text-sm font-medium text-ink">{log.employe_nom}</div>
                <div className="text-xs text-sand-500">{log.employe_code}</div>
            </td>
            <td className="px-4 py-3 text-sm text-sand-600">{log.date}</td>
            <td className="px-4 py-3 text-sm text-sand-600">{log.site_nom}</td>
            <td className="px-4 py-3 text-sm text-sand-600">{log.tache_libelle}</td>
            <td className="px-4 py-3 text-sm text-right font-medium">
                {parseFloat(log.objectif_realise).toLocaleString()} {log.tache_unite}
            </td>
            <td className="px-4 py-3 text-sm text-right">{parseFloat(log.duree_heures)}h</td>
            <td className="px-4 py-3 text-sm text-right font-medium text-forest-600">
                {parseFloat(log.rendement).toFixed(2)} {log.tache_unite}/h
            </td>
            <td className="px-4 py-3 text-center">
                {log.paye_le ? (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Payé le {log.paye_le}
                    </span>
                ) : (
                    <button onClick={() => onPayer(log.id)}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-gold-100 text-gold-700 hover:bg-gold-200 transition-colors">
                        Payer
                    </button>
                )}
            </td>
            <td className="px-4 py-3">
                <button onClick={() => onDelete(log.id)}
                    className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">
                    Suppr.
                </button>
            </td>
        </tr>
    );
}

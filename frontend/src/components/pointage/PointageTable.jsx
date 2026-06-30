import PointageRow from "./PointageRow";

export default function PointageTable({ journaliers, sites, onToggle, onFieldChange }) {
    return (
        <div className="bg-white rounded-card shadow-card border border-sand-100 overflow-hidden">
            <table className="w-full table-ekogrh">
                <thead>
                    <tr className="border-b border-sand-100 bg-sand-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase w-10">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Employé</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Présence</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Heures</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Montant</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Statut</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Projet</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Site</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-sand-50">
                    {journaliers.map((j, idx) => (
                        <PointageRow
                            key={j.employe_id}
                            j={j}
                            idx={idx}
                            sites={sites}
                            onToggle={onToggle}
                            onFieldChange={onFieldChange}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

import EmptyState from "../EmptyState";
import LogTravailRow from "./LogTravailRow";

export default function LogTravailTable({ logs, filterEmploye, filterDate, onPayer, onDelete, onNew }) {
    const hasFilter = filterEmploye || filterDate;

    return (
        <div className="card overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-light bg-sand-50">
                        <th className="table-header">Employé</th>
                        <th className="table-header">Date</th>
                        <th className="table-header">Site</th>
                        <th className="table-header">Tâche</th>
                        <th className="table-header text-right">Qté</th>
                        <th className="table-header text-right">Heures</th>
                        <th className="table-header text-right">Rendement</th>
                        <th className="table-header text-center">Statut</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((l) => (
                        <LogTravailRow key={l.id} log={l} onPayer={onPayer} onDelete={onDelete} />
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan={8}>
                                <EmptyState
                                    icon="logs"
                                    title="Aucun log de travail"
                                    description={hasFilter ? "Essayez de modifier vos filtres." : "Ajoutez un premier log de travail."}
                                    actionLabel={!hasFilter ? "Nouveau log" : ""}
                                    onAction={!hasFilter ? onNew : null}
                                    className="border-0 shadow-none"
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

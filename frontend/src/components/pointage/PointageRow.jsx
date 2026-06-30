export default function PointageRow({ j, idx, sites, onToggle, onFieldChange }) {
    const rowBg = j.present === false ? "bg-red-50/30" : "";
    const btnCls =
        j.present === true
            ? "px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"
            : j.present === false
              ? "px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
              : "px-3 py-1 rounded text-xs font-medium bg-sand-100 text-sand-500 hover:bg-sand-200";
    const btnLabel =
        j.present === true
            ? "Présent"
            : j.present === false
              ? "Absent"
              : "Non pointé";
    const zeroHeures =
        j.present && parseFloat(j.heures_travaillees) === 0;

    return (
        <tr
            key={j.employe_id}
            className={"hover:bg-sand-50 transition-colors " + rowBg}
        >
            <td className="px-4 py-2.5 text-sm text-sand-400">{idx + 1}</td>
            <td className="px-4 py-2.5">
                <span className="text-sm font-medium text-ink">
                    {j.employe_nom}
                </span>
                <span className="text-xs text-sand-400 ml-2">
                    {j.employe_code}
                </span>
            </td>
            <td className="px-4 py-2.5">
                <button onClick={() => onToggle(idx)} className={btnCls}>
                    {btnLabel}
                </button>
            </td>
            <td className="px-4 py-2.5">
                <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={j.heures_travaillees}
                    onChange={(e) =>
                        onFieldChange(idx, "heures_travaillees", e.target.value)
                    }
                    disabled={!j.present}
                    className="w-16 px-2 py-1 border border-sand-200 rounded text-sm text-center disabled:opacity-50"
                />
                {zeroHeures && (
                    <span className="ml-1 text-red-500 text-xs" title="Présent à 0h">⚠</span>
                )}
            </td>
            <td className="px-4 py-2.5 text-sm font-medium text-ink">
                {j.montant_du ? Number(j.montant_du).toLocaleString() : "0"} F
            </td>
            <td className="px-4 py-2.5">
                <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        statutBadge(j.statut)
                    }`}
                >
                    {j.statut || "brouillon"}
                </span>
            </td>
            <td className="px-4 py-2.5">
                <input
                    type="text"
                    value={j.projet_ref || ""}
                    onChange={(e) => onFieldChange(idx, "projet_ref", e.target.value)}
                    className="w-28 px-2 py-1 border border-sand-200 rounded text-sm"
                    placeholder="Projet"
                />
            </td>
            <td className="px-4 py-2.5">
                <select
                    value={j.site_ref || ""}
                    onChange={(e) => onFieldChange(idx, "site_ref", e.target.value)}
                    className="w-32 px-2 py-1 border border-sand-200 rounded text-sm bg-white"
                >
                    <option value="">— Site —</option>
                    {sites.map((s) => (
                        <option key={s.id} value={s.nom}>
                            {s.nom}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-4 py-2.5">
                <input
                    type="text"
                    value={j.notes || ""}
                    onChange={(e) => onFieldChange(idx, "notes", e.target.value)}
                    className="w-32 px-2 py-1 border border-sand-200 rounded text-sm"
                    placeholder="Notes"
                />
            </td>
        </tr>
    );
}

function statutBadge(statut) {
    if (statut === "valide") return "bg-green-100 text-green-700";
    if (statut === "cloture") return "bg-sand-200 text-sand-600";
    return "bg-gold-100 text-gold-700";
}

import SearchableSelect from "../SearchableSelect";

export default function LogTravailForm({ form, onChange, employes, sites, taches, saving, onSubmit, onCancel }) {
    const set = (field) => (e) => onChange({ ...form, [field]: e.target.value });

    return (
        <form onSubmit={onSubmit} className="bg-white rounded-card shadow-card border border-sand-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Employé</label>
                    <SearchableSelect
                        value={form.employe}
                        onChange={set("employe")}
                        options={employes.map((e) => ({ value: e.id, label: e.nom_complet }))}
                        placeholder="Sélectionner un employé..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Date</label>
                    <input required type="date" value={form.date} onChange={set("date")}
                        className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Site</label>
                    <SearchableSelect
                        value={form.site}
                        onChange={set("site")}
                        options={sites.map((s) => ({ value: s.id, label: s.nom }))}
                        placeholder="Sélectionner un site..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Tâche</label>
                    <SearchableSelect
                        value={form.tache}
                        onChange={set("tache")}
                        options={taches.map((t) => ({ value: t.id, label: `${t.libelle} (${t.unite_label})` }))}
                        placeholder="Sélectionner une tâche..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Quantité réalisée</label>
                    <input required type="number" step="0.01" value={form.objectif_realise} onChange={set("objectif_realise")}
                        className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Heures</label>
                    <input required type="number" step="0.5" value={form.duree_heures} onChange={set("duree_heures")}
                        className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Prime (FCFA)</label>
                    <input type="number" value={form.prime} onChange={set("prime")} placeholder="Bonus, carburant..."
                        className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Mode de paiement</label>
                    <select value={form.mode_paiement} onChange={set("mode_paiement")}
                        className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500">
                        <option value="especes">Espèces</option>
                        <option value="orange">Orange Money</option>
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="moov">Moov Money</option>
                        <option value="virement">Virement bancaire</option>
                        <option value="cheque">Chèque</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Notes</label>
                    <input value={form.notes} onChange={set("notes")}
                        className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
                </div>
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={saving}
                    className="px-6 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                    {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 bg-sand-200 hover:bg-sand-300 text-sand-700 text-sm font-medium rounded-lg transition-colors">
                    Annuler
                </button>
            </div>
        </form>
    );
}

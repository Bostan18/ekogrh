import { useState, useEffect } from 'react'
import api from '../api/client'

export default function LogTravailList() {
  const [logs, setLogs] = useState([])
  const [employes, setEmployes] = useState([])
  const [sites, setSites] = useState([])
  const [taches, setTaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    employe: '', site: '', tache: '',
    date: new Date().toISOString().slice(0, 10),
    objectif_realise: '', duree_heures: '8.0', notes: '',
  })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [lRes, eRes, sRes, tRes] = await Promise.all([
        api.get('/operations/logs-travail/'),
        api.get('/rh/employes/?type_contrat=journalier&statut=actif'),
        api.get('/operations/sites/'),
        api.get('/operations/taches-catalogue/'),
      ])
      setLogs(lRes.data.results || lRes.data)
      setEmployes(eRes.data.results || eRes.data)
      setSites(sRes.data.results || sRes.data)
      setTaches(tRes.data.results || tRes.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      objectif_realise: parseFloat(form.objectif_realise),
      duree_heures: parseFloat(form.duree_heures),
    }
    try {
      await api.post('/operations/logs-travail/', payload)
      setShowForm(false)
      setForm({ employe: '', site: '', tache: '', date: new Date().toISOString().slice(0, 10), objectif_realise: '', duree_heures: '8.0', notes: '' })
      loadAll()
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-ink">Logs de travail</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors">
          {showForm ? 'Annuler' : '+ Nouveau log'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card border border-sand-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Employé</label><select required value={form.employe} onChange={e => setForm({...form, employe: e.target.value})} className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"><option value="">Sélectionner...</option>{employes.map(e => <option key={e.id} value={e.id}>{e.nom_complet}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Date</label><input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" /></div>
            <div><label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Site</label><select required value={form.site} onChange={e => setForm({...form, site: e.target.value})} className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"><option value="">Sélectionner...</option>{sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Tâche</label><select required value={form.tache} onChange={e => setForm({...form, tache: e.target.value})} className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"><option value="">Sélectionner...</option>{taches.map(t => <option key={t.id} value={t.id}>{t.libelle} ({t.unite_label})</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Quantité réalisée</label><input required type="number" step="0.01" value={form.objectif_realise} onChange={e => setForm({...form, objectif_realise: e.target.value})} className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" /></div>
            <div><label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Heures</label><input required type="number" step="0.5" value={form.duree_heures} onChange={e => setForm({...form, duree_heures: e.target.value})} className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Notes</label><input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" /></div>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-sand-100 bg-sand-50"><th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Employé</th><th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Date</th><th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Site</th><th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Tâche</th><th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Qté</th><th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Heures</th><th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Rendement</th></tr></thead>
          <tbody className="divide-y divide-sand-50">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-sand-50">
                <td className="px-4 py-3"><div className="text-sm font-medium text-ink">{l.employe_nom}</div><div className="text-xs text-sand-500">{l.employe_code}</div></td>
                <td className="px-4 py-3 text-sm text-sand-600">{l.date}</td>
                <td className="px-4 py-3 text-sm text-sand-600">{l.site_nom}</td>
                <td className="px-4 py-3 text-sm text-sand-600">{l.tache_libelle}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{parseFloat(l.objectif_realise).toLocaleString()} {l.tache_unite}</td>
                <td className="px-4 py-3 text-sm text-right">{parseFloat(l.duree_heures)}h</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-forest-600">{parseFloat(l.rendement).toFixed(2)} {l.tache_unite}/h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

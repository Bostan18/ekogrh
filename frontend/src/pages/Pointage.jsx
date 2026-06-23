import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'

export default function Pointage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [journaliers, setJournaliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [view, setView] = useState('journee')

  const loadFeuille = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/rh/presences/feuille_journee/', { params: { date } })
      setJournaliers(data.presences)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    if (view === 'journee') loadFeuille()
  }, [loadFeuille, view])

  const togglePresence = (idx) => {
    const updated = [...journaliers]
    const current = updated[idx]
    if (current.present) {
      updated[idx] = { ...current, present: false, heures_travaillees: '0' }
    } else {
      updated[idx] = { ...current, present: true, heures_travaillees: '8.0' }
    }
    setJournaliers(updated)
  }

  const updateField = (idx, field, value) => {
    const updated = [...journaliers]
    updated[idx] = { ...updated[idx], [field]: value }
    setJournaliers(updated)
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const presences = journaliers
        .filter(j => j.present !== null)
        .map(j => ({
          employe_id: j.employe_id,
          present: j.present,
          heures_travaillees: parseFloat(j.heures_travaillees) || 0,
          projet_ref: j.projet_ref || '',
          site_ref: j.site_ref || '',
          notes: j.notes || '',
        }))
      await api.post('/rh/presences/saisie_journee/', { date, presences })
      setMessage({ type: 'success', text: 'Pointages enregistres avec succes.' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l enregistrement.' })
    } finally {
      setSaving(false)
    }
  }

  const valider = async () => {
    setSaving(true)
    try {
      const ids = journaliers.filter(j => j.presence_id && j.statut === 'brouillon').map(j => j.presence_id)
      if (ids.length > 0) {
        await api.post('/rh/presences/valider/', { ids })
      }
      setMessage({ type: 'success', text: ids.length + ' pointage(s) valide(s).' })
      loadFeuille()
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la validation.' })
    } finally {
      setSaving(false)
    }
  }

  const nbPresents = journaliers.filter(j => j.present).length
  const nbAbsents = journaliers.filter(j => j.present === false).length
  const nbNonPointe = journaliers.filter(j => j.present === null).length

  const actifBtn = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors '
  const actifJournee = actifBtn + (view === 'journee' ? 'bg-forest-500 text-white' : 'bg-sand-100 text-sand-600 hover:bg-sand-200')
  const actifSemaine = actifBtn + (view === 'semaine' ? 'bg-forest-500 text-white' : 'bg-sand-100 text-sand-600 hover:bg-sand-200')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-ink">Pointage journalier</h2>
        <div className="flex gap-2">
          <button onClick={() => setView('journee')} className={actifJournee}>Journee</button>
          <button onClick={() => setView('semaine')} className={actifSemaine}>Semaine</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-sand-100 p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-sand-700">Date :</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500" />
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-green-700 font-medium">{nbPresents} presents</span>
            <span className="text-red-600 font-medium">{nbAbsents} absents</span>
            <span className="text-sand-500">{nbNonPointe} non pointes</span>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={valider} disabled={saving}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              Valider
            </button>
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
        {message && (
          <div className={message.type === 'success' ? 'mt-3 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200' : 'mt-3 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200'}>
            {message.text}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-100 bg-sand-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Employe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Presence</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Heures</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Projet</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Site</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-50">
              {journaliers.map((j, idx) => {
                const rowBg = j.present === false ? 'bg-red-50/30' : ''
                const btnCls = j.present === true
                  ? 'px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200'
                  : j.present === false
                  ? 'px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200'
                  : 'px-3 py-1 rounded text-xs font-medium bg-sand-100 text-sand-500 hover:bg-sand-200'
                const btnLabel = j.present === true ? 'Present' : j.present === false ? 'Absent' : 'Non pointe'
                return (
                  <tr key={j.employe_id} className={'hover:bg-sand-50 transition-colors ' + rowBg}>
                    <td className="px-4 py-2.5 text-sm text-sand-400">{idx + 1}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm font-medium text-ink">{j.employe_nom}</span>
                      <span className="text-xs text-sand-400 ml-2">{j.employe_code}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => togglePresence(idx)} className={btnCls}>{btnLabel}</button>
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="number" step="0.5" min="0" max="24"
                        value={j.heures_travaillees}
                        onChange={(e) => updateField(idx, 'heures_travaillees', e.target.value)}
                        disabled={!j.present}
                        className="w-16 px-2 py-1 border border-sand-200 rounded text-sm text-center disabled:opacity-50" />
                    </td>
                    <td className="px-4 py-2.5 text-sm font-medium text-ink">
                      {j.montant_du ? Number(j.montant_du).toLocaleString() : '0'} F
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="text" value={j.projet_ref || ''}
                        onChange={(e) => updateField(idx, 'projet_ref', e.target.value)}
                        className="w-28 px-2 py-1 border border-sand-200 rounded text-sm" placeholder="Projet" />
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="text" value={j.site_ref || ''}
                        onChange={(e) => updateField(idx, 'site_ref', e.target.value)}
                        className="w-24 px-2 py-1 border border-sand-200 rounded text-sm" placeholder="Site" />
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="text" value={j.notes || ''}
                        onChange={(e) => updateField(idx, 'notes', e.target.value)}
                        className="w-32 px-2 py-1 border border-sand-200 rounded text-sm" placeholder="Notes" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import api from '../api/client'

export default function CongesList() {
  const [conges, setConges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const statutColors = { demande: 'bg-gold-100 text-gold-700', approuve: 'bg-green-100 text-green-700', refuse: 'bg-red-100 text-red-700', annule: 'bg-gray-100 text-gray-600' }

  useEffect(() => { loadConges() }, [filter])

  async function loadConges() {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.statut = filter
      const { data } = await api.get('/rh/conges/', { params })
      setConges(data.results || data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function approuver(id) { await api.post('/rh/conges/' + id + '/approuver/'); loadConges() }
  async function refuser(id) { await api.post('/rh/conges/' + id + '/refuser/'); loadConges() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-ink">Conges & absences</h2>
        <button className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors">+ Nouvelle demande</button>
      </div>
      <div className="flex gap-3 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-sand-200 rounded-lg text-sm">
          <option value="">Tous les statuts</option>
          <option value="demande">Demande</option>
          <option value="approuve">Approuve</option>
          <option value="refuse">Refuse</option>
          <option value="annule">Annule</option>
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-100 bg-sand-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Employe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Du</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Au</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Jours</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-50">
              {conges.map((c) => (
                <tr key={c.id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-ink">{c.employe_nom}</td>
                  <td className="px-4 py-3 text-sm text-sand-600">{c.type_conge_display}</td>
                  <td className="px-4 py-3 text-sm text-sand-600">{c.date_debut}</td>
                  <td className="px-4 py-3 text-sm text-sand-600">{c.date_fin}</td>
                  <td className="px-4 py-3 text-sm text-center">{c.nb_jours}</td>
                  <td className="px-4 py-3">
                    <span className={'inline-block px-2 py-0.5 rounded text-xs font-medium ' + (statutColors[c.statut] || '')}>
                      {c.statut_display}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.statut === 'demande' && (
                      <div className="flex gap-2">
                        <button onClick={() => approuver(c.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">Approuver</button>
                        <button onClick={() => refuser(c.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Refuser</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {conges.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sand-500">Aucun conge trouve.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

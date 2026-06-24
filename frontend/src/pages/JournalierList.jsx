import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function JournalierList() {
  const [journaliers, setJournaliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [search])

  async function load() {
    setLoading(true)
    try {
      const params = { type_contrat: 'journalier', statut: 'actif' }
      if (search) params.search = search
      const { data } = await api.get('/rh/employes/', { params })
      setJournaliers(data.results || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-ink">Journaliers</h2>
        <Link
          to="/pointage"
          className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          📋 Pointer
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 w-64"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {journaliers.map((emp) => (
            <Link
              key={emp.id}
              to={`/employes/${emp.id}`}
              className="bg-white rounded-xl shadow-card border border-sand-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-ink">{emp.nom_complet}</h3>
                  <p className="text-xs text-sand-500 font-mono">{emp.code}</p>
                </div>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                  emp.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-sand-100 text-sand-700'
                }`}>
                  {emp.statut}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sand-500">Poste</span>
                  <span className="text-ink font-medium">{emp.poste || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand-500">Taux journalier</span>
                  <span className="text-ink font-medium">
                    {emp.taux_journalier ? `${parseFloat(emp.taux_journalier).toLocaleString()} FCFA` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand-500">Jours non payés</span>
                  <span className={`font-medium ${
                    (emp.jours_non_payes || 0) > 0 ? 'text-red-600' : 'text-ink'
                  }`}>
                    {emp.jours_non_payes || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand-500">Restant à payer</span>
                  <span className="text-ink font-medium">
                    {emp.restant ? `${parseFloat(emp.restant).toLocaleString()} FCFA` : '—'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && journaliers.length === 0 && (
        <div className="bg-white rounded-xl shadow-card border border-sand-100 p-8 text-center text-sand-500">
          Aucun journalier actif trouvé.
        </div>
      )}
    </div>
  )
}

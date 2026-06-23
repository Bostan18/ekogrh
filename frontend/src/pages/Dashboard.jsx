import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [employes, presences, anomalies] = await Promise.all([
          api.get('/rh/employes/?statut=actif'),
          api.get('/rh/presences/'),
          api.get('/rh/presences/anomalies/'),
        ])
        setStats({
          nbEmployes: employes.data.count,
          nbPresences: presences.data.count,
          nbAnomalies: anomalies.data.total,
        })
      } catch (err) {
        console.error('Erreur chargement dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const kpis = [
    { label: 'Employés actifs', value: stats?.nbEmployes ?? '—', icon: '👥', color: 'bg-forest-50 text-forest-700' },
    { label: 'Pointages du jour', value: stats?.nbPresences ?? '—', icon: '📋', color: 'bg-gold-50 text-gold-700' },
    { label: 'Anomalies', value: stats?.nbAnomalies ?? '—', icon: '⚠️', color: 'bg-red-50 text-red-700' },
    { label: 'Masse salariale', value: '— FCFA', icon: '💰', color: 'bg-blue-50 text-blue-700' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-ink mb-6">Tableau de bord</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-card p-5 border border-sand-100">
            <div className="flex items-center justify-between mb-3">
              <span className={}>
                {kpi.icon}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-ink">{kpi.value}</p>
            <p className="text-sm text-sand-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accès rapides */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-sand-100">
          <h3 className="text-lg font-display font-semibold text-ink mb-4">Accès rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pointage du jour', to: '/pointage', icon: '📋' },
              { label: 'Liste des employés', to: '/employes', icon: '👥' },
              { label: 'Bulletins de paie', to: '/bulletins', icon: '📄' },
              { label: 'Congés', to: '/conges', icon: '🏖' },
            ].map((item) => (
              <a
                key={item.to}
                href={item.to}
                className="flex items-center gap-2 p-3 rounded-lg bg-sand-50 hover:bg-forest-50 text-sm font-medium text-sand-700 hover:text-forest-700 transition-colors"
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Dernières présences */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-sand-100">
          <h3 className="text-lg font-display font-semibold text-ink mb-4">Derniers pointages</h3>
          <p className="text-sm text-sand-500">Connectez-vous pour voir les derniers pointages.</p>
        </div>
      </div>
    </div>
  )
}

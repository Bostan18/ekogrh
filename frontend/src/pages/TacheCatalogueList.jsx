import { useState, useEffect } from 'react'
import api from '../api/client'

export default function TacheCatalogueList() {
  const [taches, setTaches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/operations/taches-catalogue/')
      setTaches(data.results || data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div></div>

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-ink mb-6">Tâches catalogue</h2>
      <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-sand-100 bg-sand-50"><th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Code</th><th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Libellé</th><th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Type objectif</th><th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Unité</th><th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Tarif réf.</th></tr></thead>
          <tbody className="divide-y divide-sand-50">
            {taches.map(t => (
              <tr key={t.id} className="hover:bg-sand-50">
                <td className="px-4 py-3 font-mono text-sm text-forest-600">{t.code}</td>
                <td className="px-4 py-3 font-medium text-ink">{t.libelle}</td>
                <td className="px-4 py-3 text-sm text-sand-600">{t.type_objectif_display}</td>
                <td className="px-4 py-3 text-sm text-sand-600">{t.unite_label}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{t.tarif_reference ? parseFloat(t.tarif_reference).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function BulletinList() {
  const [bulletins, setBulletins] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [mois, setMois] = useState(new Date().getMonth() + 1)
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const moisNoms = ['', 'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

  useEffect(() => { loadBulletins() }, [mois, annee])

  async function loadBulletins() {
    setLoading(true)
    try {
      const premierJour = annee + '-' + String(mois).padStart(2, '0') + '-01'
      const { data } = await api.get('/rh/bulletins/', { params: { mois: premierJour } })
      setBulletins(data.results || data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function generer() {
    setGenerating(true)
    try { await api.post('/rh/bulletins/generer/', { mois, annee }); loadBulletins() }
    catch (err) { alert('Erreur lors de la generation') }
    finally { setGenerating(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-ink">Bulletins de paie</h2>
        <button onClick={generer} disabled={generating}
          className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
          {generating ? 'Generation...' : 'Generer les bulletins'}
        </button>
      </div>
      <div className="flex gap-3 mb-4">
        <select value={mois} onChange={(e) => setMois(Number(e.target.value))}
          className="px-3 py-2 border border-sand-200 rounded-lg text-sm">
          {moisNoms.map((nom, i) => i > 0 && <option key={i} value={i}>{nom}</option>)}
        </select>
        <input type="number" value={annee} onChange={(e) => setAnnee(Number(e.target.value))}
          className="px-3 py-2 border border-sand-200 rounded-lg text-sm w-24" />
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Employe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Poste</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Mois</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Brut</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Net</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-50">
              {bulletins.map((b) => (
                <tr key={b.id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={'/bulletins/' + b.id} className="text-ink font-medium hover:text-forest-600">{b.employe_nom}</Link>
                    <span className="text-xs text-sand-400 ml-2">{b.employe_code}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-600">{b.employe_poste || '-'}</td>
                  <td className="px-4 py-3 text-sm text-sand-600">{b.mois}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{Number(b.brut).toLocaleString()} F</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-forest-700">{Number(b.net).toLocaleString()} F</td>
                  <td className="px-4 py-3">
                    <span className={b.statut === 'paye' ? 'inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700' : 'inline-block px-2 py-0.5 rounded text-xs font-medium bg-gold-100 text-gold-700'}>
                      {b.statut === 'paye' ? 'Paye' : 'Genere'}
                    </span>
                  </td>
                </tr>
              ))}
              {bulletins.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sand-500">Aucun bulletin pour cette periode.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

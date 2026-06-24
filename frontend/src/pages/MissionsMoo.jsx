import { useState, useEffect } from 'react'
import api from '../api/client'

export default function MissionsMoo() {
  const [missions, setMissions] = useState([])
  const [employes, setEmployes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    employe: '',
    description: '',
    date_debut: new Date().toISOString().slice(0, 10),
    date_fin: '',
    montant_forfaitaire: '',
    projet_ref: '',
    notes: '',
  })

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [mRes, eRes] = await Promise.all([
        api.get('/rh/missions-moo/'),
        api.get('/rh/employes/?type_contrat=moo&statut=actif'),
      ])
      setMissions(mRes.data.results || mRes.data)
      setEmployes(eRes.data.results || eRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = { ...form }
    if (payload.montant_forfaitaire) payload.montant_forfaitaire = parseFloat(payload.montant_forfaitaire)
    else delete payload.montant_forfaitaire

    try {
      await api.post('/rh/missions-moo/', payload)
      setShowForm(false)
      setForm({ employe: '', description: '', date_debut: new Date().toISOString().slice(0, 10), date_fin: '', montant_forfaitaire: '', projet_ref: '', notes: '' })
      loadAll()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const handleMarquerPayee = async (id) => {
    try {
      await api.post(`/rh/missions-moo/${id}/marquer_payee/`)
      loadAll()
    } catch (err) {
      console.error(err)
    }
  }

  const Field = ({ label, name, type = 'text', required = false }) => (
    <div>
      <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name] || ''}
        onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
        required={required}
        className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
      />
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-ink">Missions MOO</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Annuler' : '+ Nouvelle mission'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-card border border-sand-100 p-6 mb-6">
          <h3 className="text-lg font-display font-semibold text-ink mb-4">Nouvelle mission</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Employé MOO</label>
                <select
                  name="employe"
                  value={form.employe}
                  onChange={(e) => setForm({ ...form, employe: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="">Sélectionner...</option>
                  {employes.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nom_complet} ({emp.code})</option>
                  ))}
                </select>
              </div>
              <Field label="Projet (réf)" name="projet_ref" />
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
              <Field label="Date début" name="date_debut" type="date" required />
              <Field label="Date fin" name="date_fin" type="date" />
              <Field label="Montant forfaitaire (FCFA)" name="montant_forfaitaire" type="number" required />
              <Field label="Notes" name="notes" />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}

      {/* Missions list */}
      {missions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card border border-sand-100 p-8 text-center text-sand-500">
          Aucune mission MOO enregistrée.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-sand-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-100 bg-sand-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Employé</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Période</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Montant</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Statut</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-sand-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-50">
              {missions.map((m) => (
                <tr key={m.id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-ink">{m.employe_nom}</div>
                    <div className="text-xs text-sand-500">{m.employe_code}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-700 max-w-[220px] truncate">
                    {m.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-600">
                    {m.date_debut}{m.date_fin ? ` → ${m.date_fin}` : ''}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    {parseFloat(m.montant_forfaitaire || 0).toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.paye_le ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Payée le {m.paye_le}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gold-100 text-gold-700">
                        Non payée
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!m.paye_le && (
                      <button
                        onClick={() => handleMarquerPayee(m.id)}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-forest-50 text-forest-700 hover:bg-forest-100 transition-colors"
                      >
                        Marquer payée
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import api from '../api/client'
import { toast } from '../store/toastStore'
import { today } from '../utils/constants'

const MODES = [
  { value: 'especes', label: 'Espèces' },
  { value: 'orange', label: 'Orange Money' },
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'moov', label: 'Moov Money' },
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cheque', label: 'Chèque' },
]

export default function PaymentModal({ items, onClose, onPaid }) {
  const [mode, setMode] = useState('especes')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [datePaiement, setDatePaiement] = useState(today())
  const [saving, setSaving] = useState(false)

  const total = items.reduce((sum, item) => sum + (item.restant || item.montant || 0), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) return

    setSaving(true)
    try {
      const ids = items.map((item) => item.employe_id)
      await api.post('/rh/paiements/regler_lot/', {
        employe_ids: ids,
        mode,
        reference: reference || '',
        notes: notes || '',
        date: datePaiement,
        montant: total,
      })
      toast().success(`${items.length} paiement(s) effectué(s) — ${total.toLocaleString()} FCFA`)
      onPaid?.()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur lors du paiement.'
      toast().error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-modal shadow-2xl border border-sand-200 w-full max-w-md max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-sand-100">
          <h3 className="text-lg font-display font-semibold text-ink">
            Paiement journaliers
          </h3>
          <button
            onClick={onClose}
            className="text-sand-400 hover:text-sand-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {/* Récapitulatif */}
          <div className="mb-4 p-3 bg-sand-50 rounded-lg">
            <p className="text-xs text-sand-500 mb-2">Récapitulatif</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {items.map((item) => (
                <div key={item.employe_id} className="flex justify-between text-sm">
                  <span className="text-ink">{item.employe_nom}</span>
                  <span className="font-medium text-forest-700">
                    {(item.restant || item.montant || 0).toLocaleString()} FCFA
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-sand-200">
              <span className="text-ink">Total</span>
              <span className="text-forest-700">{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                Mode de paiement
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                required
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                Date de paiement
              </label>
              <input
                type="date"
                value={datePaiement}
                onChange={(e) => setDatePaiement(e.target.value)}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                Référence (optionnel)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="N° transaction, chèque..."
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-sand-200 hover:bg-sand-50 text-sand-700 text-sm font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Paiement...' : `Payer ${total.toLocaleString()} FCFA`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'

export default function SearchableSelect({ value, onChange, options, placeholder = 'Rechercher...' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find(o => o.value === value)
  const filtered = options.filter(o =>
    !search || o.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch('') }}
        className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white"
      >
        {selected ? selected.label : <span className="text-sand-400">{placeholder}</span>}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-sand-200 rounded-lg shadow-lg max-h-56 overflow-hidden">
          <div className="p-2 border-b border-sand-100">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              autoFocus
              className="w-full px-2 py-1.5 border border-sand-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
            />
          </div>
          <div className="overflow-y-auto max-h-40">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-sand-400">Aucun résultat</div>
            ) : (
              filtered.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange({ target: { value: o.value } }); setOpen(false) }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-forest-50 transition-colors ${o.value === value ? 'bg-forest-50 text-forest-700 font-medium' : 'text-sand-700'}`}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

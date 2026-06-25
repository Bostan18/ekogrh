import { Link, useLocation } from 'react-router-dom'

const ROUTE_LABELS = {
  '': 'Accueil',
  'employes': 'Employés',
  'nouveau': 'Nouvel employé',
  'modifier': 'Modifier',
  'pointage': 'Pointage journalier',
  'pointage-semaine': 'Pointage semaine',
  'conges': 'Congés',
  'bulletins': 'Bulletins de paie',
  'paiements': 'Paiements',
  'missions': 'Missions MOO',
  'journaliers': 'Journaliers',
  'task-payroll': 'Paie à la tâche',
  'retenues': 'Retenues',
  'sites': 'Sites',
  'taches': 'Tâches catalogue',
  'logs': 'Logs de travail',
  'historique': 'Historique contrats',
}

function resolveLabel(segment) {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment]
  if (/^emp-\d+/i.test(segment) || /^\d+$/.test(segment)) return 'Détail'
  return segment.replace(/-/g, ' ')
}

function ChevronIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-sand-400 mx-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

export default function Breadcrumb() {
  const { pathname } = useLocation()

  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  const items = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/')
    return { label: resolveLabel(seg), path }
  })

  if (items.length === 0) return null

  return (
    <nav className="flex items-center text-xs mb-4 overflow-x-auto whitespace-nowrap" aria-label="Fil d'Ariane">
      <Link
        to="/"
        className="text-sand-400 hover:text-forest-600 transition-colors flex items-center gap-1"
      >
        <HomeIcon />
      </Link>
      <ChevronIcon />
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={item.path} className="flex items-center">
            {isLast ? (
              <span className="text-forest-700 font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-sand-400 hover:text-forest-600 transition-colors truncate max-w-[160px]"
              >
                {item.label}
              </Link>
            )}
            {!isLast && <ChevronIcon />}
          </span>
        )
      })}
    </nav>
  )
}

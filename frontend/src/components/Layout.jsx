import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', icon: '📊' },
  { to: '/employes', label: 'Employés', icon: '👥' },
  { to: '/pointage', label: 'Pointage', icon: '📋' },
  { to: '/bulletins', label: 'Bulletins', icon: '📄' },
  { to: '/conges', label: 'Congés', icon: '🏖' },
  { to: '/paiements', label: 'Paiements', icon: '💰' },
]

export default function Layout() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    

  return (
    <div className="flex h-screen bg-sand-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sand-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-sand-100">
          <h1 className="text-xl font-display font-bold text-forest-700">
            <span className="text-forest-500">EKO</span>GRH
          </h1>
          <p className="text-xs text-sand-500 mt-0.5">Gestion RH & Paie</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sand-100">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium text-ink">{user?.username || 'Utilisateur'}</p>
              <p className="text-xs text-sand-500">Administrateur</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sand-400 hover:text-red-500 transition-colors text-lg"
              title="Déconnexion"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

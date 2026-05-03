import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, FolderKanban, CheckSquare, 
  LogOut, Zap, Bell, Menu, Users, Calendar
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import Avatar from '../ui/Avatar'
import { cn } from '../../utils/helpers'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
]

const adminNavItems = [
  { to: '/team', icon: Users, label: 'Team Members' },
  { to: '/schedule', icon: Calendar, label: 'Auto Schedule' },
]

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [read, setRead] = useState(false)

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard').then(r => r.data),
  })

  const overdueTasks = data?.overdueTasks || []
  const myTasks = data?.myTasks || []

  const notifications = [
    ...overdueTasks.slice(0, 3).map(t => ({
      id: t.id,
      type: 'overdue',
      message: `"${t.title}" is overdue!`,
      time: 'Past deadline',
      icon: '⚠️'
    })),
    ...myTasks.filter(t => t.status !== 'DONE').slice(0, 2).map(t => ({
      id: t.id + 'p',
      type: 'pending',
      message: `"${t.title}" is pending`,
      time: 'In progress',
      icon: '📌'
    })),
  ]

  const unread = read ? 0 : notifications.length

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); setRead(true) }}
        className="btn-ghost p-2 relative"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-base-800 border border-base-600/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-base-600/50 flex items-center justify-between">
              <h3 className="font-display font-semibold text-white text-sm">Notifications</h3>
              <button
                onClick={() => setRead(true)}
                className="text-xs text-accent-light hover:text-accent"
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  🎉 All caught up!
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-base-700/50 hover:bg-base-700/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{n.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-200">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-base-600/50">
              <p className="text-xs text-center text-gray-500">ZenTask Notifications</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function Layout() {
  const { user, logout, xp, badges } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const level = Math.floor(xp / 50) + 1
  const xpProgress = Math.min((xp % 50) * 2, 100)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-base-800 border-r border-base-600/50 flex flex-col transition-transform duration-300',
        'lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-base-600/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-glow-sm">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white leading-none">ZenTask</h1>
              <p className="text-xs text-gray-500 font-body mt-0.5">Team workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="label px-4 mb-3">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <p className="label px-4 mb-3 mt-4">Admin</p>
              {adminNavItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-base-600/50 space-y-1">
          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
          >
            <Avatar name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                user?.role === 'ADMIN'
                  ? 'bg-accent/20 text-accent'
                  : 'bg-gray-600/30 text-gray-400'
              }`}>
                {user?.role === 'ADMIN' ? 'Admin' : 'Member'}
              </span>

              {/* XP Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>⚡ {xp} XP</span>
                  <span>Lv.{level}</span>
                </div>
                <div className="w-full bg-base-600 rounded-full h-1.5">
                  <div
                    className="bg-accent rounded-full h-1.5 transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                {badges.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {badges.map(b => (
                      <span key={b.id} title={b.name} className="text-sm">{b.emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </NavLink>

          <button onClick={handleLogout} className="sidebar-link w-full text-danger hover:text-danger hover:bg-danger/10">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-base-800/80 backdrop-blur border-b border-base-600/50 flex items-center gap-4 px-6 flex-shrink-0">
          <button
            className="lg:hidden btn-ghost p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <NotificationBell />
          <NavLink to="/profile">
            <Avatar name={user?.name} size="sm" className="cursor-pointer hover:ring-2 ring-accent/50 transition-all" />
          </NavLink>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
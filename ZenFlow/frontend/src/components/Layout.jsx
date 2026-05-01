import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Zap, Bell, Menu, AlertTriangle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../ui/Avatar'
import { cn } from '../../utils/helpers'
import api from '../../utils/api'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Dummy data for testing (Replace with API call)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Task "API Integration" is overdue!', time: '2h ago', urgent: true },
    { id: 2, type: 'alert', message: 'Deadline approaching for "UI Design"', time: '5h ago', urgent: false },
    { id: 3, type: 'info', message: 'Shruti assigned a new task to you', time: '1d ago', urgent: false }
  ])

  const unreadCount = notifications.length

  return (
    <div className="flex h-screen overflow-hidden bg-base-900 text-gray-100">
      {/* Sidebar - Same as your current one */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-base-800 border-r border-base-600/50 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
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
        
        {/* Navigation links... (Existing ones) */}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-base-800/80 backdrop-blur border-b border-base-600/50 flex items-center gap-4 px-6 flex-shrink-0 relative z-[60]">
          <button className="lg:hidden btn-ghost p-2" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          
          <div className="flex-1" />

          {/* NOTIFICATION SECTION */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "btn-ghost p-2 relative transition-all",
                showNotifications ? "bg-base-600 text-white" : "text-gray-400"
              )}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-[10px] text-white rounded-full flex items-center justify-center font-bold ring-2 ring-base-800">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-3 w-80 bg-base-800 border border-base-600 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-base-600/50 flex justify-between items-center">
                    <span className="text-sm font-bold">Activity Center</span>
                    <button className="text-[10px] text-accent hover:underline">Mark all read</button>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-3 rounded-xl mb-1 flex gap-3 transition-colors cursor-pointer",
                          n.urgent ? "bg-danger/10 hover:bg-danger/20" : "hover:bg-base-700"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          n.urgent ? "bg-danger/20 text-danger" : "bg-accent/20 text-accent"
                        )}>
                          {n.urgent ? <AlertTriangle size={16} /> : <Clock size={16} />}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-xs leading-relaxed", n.urgent ? "text-white font-medium" : "text-gray-300")}>
                            {n.message}
                          </p>
                          <span className="text-[10px] text-gray-500 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <Avatar name={user?.name} size="sm" className="cursor-pointer border border-base-600" />
        </header>

        <div className="flex-1 overflow-auto bg-base-900">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

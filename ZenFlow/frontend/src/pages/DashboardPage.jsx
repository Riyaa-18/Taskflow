import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  FolderKanban, CheckSquare, AlertTriangle, TrendingUp,
  Clock, ArrowRight, Activity, BellRing, ShieldAlert
} from 'lucide-react'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { PageLoader } from '../components/ui/Spinner'
import { formatRelativeTime, formatDate, isOverdue } from '../utils/helpers'
import PieChart from '../components/PieChart'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard').then(r => r.data),
  })

  if (isLoading) return <PageLoader />

  // Destructuring with Role-Based filtering
  let { stats, myTasks = [], overdueTasks = [], recentActivities = [] } = data || {}

  // MEMBER RESTRICTION: Agar member hai, toh stats ko filter karo (Optional: Backend usually handles this, but frontend safety is good)
  const statCards = [
    { label: isAdmin ? 'Total Projects' : 'My Projects', value: stats?.totalProjects ?? 0, icon: FolderKanban, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
    { label: 'My Tasks', value: stats?.myTasksCount ?? 0, icon: CheckSquare, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
    { label: 'Overdue', value: stats?.overdueTasks ?? 0, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
    { label: 'Completed', value: stats?.completedTasks ?? 0, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in">
      {/* Header with Role Badge */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-gray-500 text-sm font-body mb-1">{greeting} 👋</p>
          <h1 className="font-display font-bold text-3xl text-white">
            {user?.name?.split(' ')[0]}'s Dashboard
          </h1>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isAdmin ? 'bg-accent/10 border-accent text-accent' : 'bg-success/10 border-success text-success'}`}>
          {user?.role || 'Member'}
        </div>
      </div>

      {/* MEMBER WARNING BOX: Only shows for members if they have overdue tasks */}
      {!isAdmin && overdueTasks.length > 0 && (
        <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-danger/20 rounded-xl flex items-center justify-center text-danger">
            <ShieldAlert size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">Action Required!</h3>
            <p className="text-gray-400 text-xs">Bhai, you have {overdueTasks.length} tasks past the deadline. Complete them to maintain your ZenFlow.</p>
          </div>
          <Link to="/tasks" className="btn-secondary py-2 px-4 text-xs">Fix Now</Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`stat-card border ${border} hover:scale-[1.02] transition-transform`}>
            <div className={`w-10 h-10 ${bg} ${border} border rounded-xl flex items-center justify-center`}>
              <Icon size={20} className={color} />
            </div>
            <p className="font-display font-bold text-3xl text-white">{value}</p>
            <p className="text-gray-500 text-sm">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Tasks (Filtered for Member) */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-6 border-b border-base-600/50">
            <h2 className="font-display font-semibold text-white flex items-center gap-2">
              <CheckSquare size={18} className="text-accent" />
              {isAdmin ? "All Team Tasks" : "My Assigned Tasks"}
            </h2>
            <Link to="/tasks" className="text-accent-light hover:text-accent text-sm flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-base-700/50">
            {myTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No active tasks right now</div>
            ) : (
              myTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-4 hover:bg-base-700/30 transition-colors group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium mb-1.5 truncate ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {!isAdmin && isOverdue(task.dueDate) && (
                          <span className="text-[10px] bg-danger/20 text-danger px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                            <BellRing size={10} /> COMPLETE NOW
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-[10px] font-mono ${isOverdue(task.dueDate) ? 'text-danger' : 'text-gray-500'}`}>
                         {formatDate(task.dueDate)}
                       </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Overview (Charts) */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-white mb-6 flex items-center gap-2">
            <Activity size={18} className="text-info" />
            Productivity
          </h2>
          <div className="flex flex-col items-center">
            <PieChart 
              data={stats ? [
                { label: 'To Do', value: stats.todoTasks || 0, color: '#6b7280' },
                { label: 'Progress', value: stats.inProgressTasks || 0, color: '#3b82f6' },
                { label: 'Done', value: stats.completedTasks || 0, color: '#10b981' },
              ].filter(i => i.value > 0) : []} 
              size={140} 
            />
            <div className="mt-8 w-full space-y-4">
               {/* Simplified progress bars */}
               <div className="flex justify-between text-xs mb-1 text-gray-400">
                  <span>Task Completion</span>
                  <span>{Math.round((stats?.completedTasks / stats?.totalTasks) * 100) || 0}%</span>
               </div>
               <div className="w-full h-1.5 bg-base-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success transition-all duration-1000" 
                    style={{ width: `${(stats?.completedTasks / stats?.totalTasks) * 100}%` }}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Section: Extra warnings for Members */}
      {overdueTasks.length > 0 && (
        <div className="card border-danger/30 bg-danger/5">
          <div className="p-4 border-b border-danger/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={18} />
              <h2 className="font-display font-semibold">Critical Deadlines ({overdueTasks.length})</h2>
            </div>
            {!isAdmin && <span className="text-[10px] text-danger font-bold uppercase animate-bounce">Delayed</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
            {overdueTasks.map((task) => (
              <div key={task.id} className="p-3 bg-base-800 border border-base-700 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{task.project?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-danger font-bold italic">Due {formatDate(task.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


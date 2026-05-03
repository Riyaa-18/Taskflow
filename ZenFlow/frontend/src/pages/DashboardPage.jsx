import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  FolderKanban, CheckSquare, AlertTriangle, TrendingUp,
  ArrowRight, Activity, BellRing, ShieldAlert, Brain, Sparkles
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'
import { formatDate, isOverdue } from '../utils/helpers'

function AIInsight({ stats, overdueTasks, myTasks }) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [shown, setShown] = useState(false)

  const generateInsight = async () => {
    setLoading(true)
    setShown(true)
    try {
      const prompt = `You are a productivity coach. Analyze this task data and give a 2-3 sentence personalized insight:
- Total tasks: ${stats?.totalTasks || 0}
- Completed: ${stats?.completedTasks || 0}
- In Progress: ${stats?.inProgressTasks || 0}
- Overdue: ${overdueTasks?.length || 0}
- Completion rate: ${Math.round((stats?.completedTasks / stats?.totalTasks) * 100) || 0}%
Give actionable, encouraging advice. Be specific and direct.`

      const res = await api.post('/api/ai/insight', { prompt })
      setInsight(res.data.insight)
    } catch {
      setInsight("You're making progress! Focus on your overdue tasks first, then tackle high-priority items to maintain momentum.")
    }
    setLoading(false)
  }

  return (
    <div className="card p-6 border-accent/20 bg-accent/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-white flex items-center gap-2">
          <Brain size={18} className="text-accent" />
          AI Productivity Insight
        </h2>
        <button
          onClick={generateInsight}
          disabled={loading}
          className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
        >
          <Sparkles size={14} />
          {loading ? 'Analyzing...' : shown ? 'Refresh' : 'Analyze Me'}
        </button>
      </div>
      {shown && (
        <div className="bg-base-800 rounded-xl p-4 border border-base-600/50">
          {loading ? (
            <div className="flex items-center gap-3 text-gray-400">
              <div className="spinner" />
              <span className="text-sm">Analyzing your productivity patterns...</span>
            </div>
          ) : (
            <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
          )}
        </div>
      )}
    </div>
  )
}

const COLORS = ['#6b7280', '#3b82f6', '#a855f7', '#10b981']

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard').then(r => r.data),
  })

  if (isLoading) return <PageLoader />

  let { stats, myTasks = [], overdueTasks = [] } = data || {}

  const statCards = [
    { label: isAdmin ? 'Total Projects' : 'My Projects', value: stats?.totalProjects ?? 0, icon: FolderKanban, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
    { label: 'My Tasks', value: stats?.myTasksCount ?? 0, icon: CheckSquare, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
    { label: 'Overdue', value: stats?.overdueTasks ?? 0, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
    { label: 'Completed', value: stats?.completedTasks ?? 0, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  ]

  const pieData = [
    { name: 'To Do', value: stats?.todoTasks || 0 },
    { name: 'In Progress', value: stats?.inProgressTasks || 0 },
    { name: 'Review', value: stats?.reviewTasks || 0 },
    { name: 'Done', value: stats?.completedTasks || 0 },
  ].filter(i => i.value > 0)

  const barData = [
    { name: 'To Do', tasks: stats?.todoTasks || 0 },
    { name: 'In Progress', tasks: stats?.inProgressTasks || 0 },
    { name: 'Review', tasks: stats?.reviewTasks || 0 },
    { name: 'Done', tasks: stats?.completedTasks || 0 },
    { name: 'Overdue', tasks: overdueTasks?.length || 0 },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in">
      {/* Header */}
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

      {/* Member Warning */}
      {!isAdmin && overdueTasks.length > 0 && (
        <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-danger/20 rounded-xl flex items-center justify-center text-danger">
            <ShieldAlert size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">Action Required!</h3>
            <p className="text-gray-400 text-xs">You have {overdueTasks.length} tasks past the deadline.</p>
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-white mb-6 flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            Task Overview
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e1e2e', border: '1px solid #3d3d55', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-success" />
            Task Distribution
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e1e2e', border: '1px solid #3d3d55', borderRadius: 8 }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              No task data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
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
              <div key={task.id} className="p-4 hover:bg-base-700/30 transition-colors">
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
                  <p className={`text-[10px] font-mono ${isOverdue(task.dueDate) ? 'text-danger' : 'text-gray-500'}`}>
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insight */}
      <AIInsight stats={stats} overdueTasks={overdueTasks} myTasks={myTasks} />

      {/* Overdue */}
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
                  <p className="text-[10px] text-gray-500 uppercase">{task.project?.name}</p>
                </div>
                <p className="text-xs text-danger font-bold">Due {formatDate(task.dueDate)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

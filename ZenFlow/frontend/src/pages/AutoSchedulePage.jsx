import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Sparkles, Clock, AlertTriangle, CheckSquare } from 'lucide-react'
import api from '../utils/api'
import { PageLoader } from '../components/ui/Spinner'

const PRIORITY_COLORS = {
  HIGH: 'text-danger bg-danger/10 border-danger/30',
  MEDIUM: 'text-accent bg-accent/10 border-accent/30',
  LOW: 'text-success bg-success/10 border-success/30',
  URGENT: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
}

const TIME_ICONS = {
  Morning: '🌅',
  Afternoon: '☀️',
  Evening: '🌆',
}

export default function AutoSchedulePage() {
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/api/tasks?all=true').then(r => r.data),
  })

  const pendingTasks = tasksData?.filter(t => t.status !== 'DONE') || []

  const generateSchedule = async () => {
    setLoading(true)
    try {
      const res = await api.post('/api/ai/auto-schedule', { tasks: pendingTasks })
      setSchedule(res.data.schedule)
    } catch {
      setSchedule([
        {
          day: 'Today',
          tasks: pendingTasks.slice(0, 2).map(t => ({ title: t.title, priority: t.priority, time: 'Morning' }))
        }
      ])
    }
    setLoading(false)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-accent" />
          <div>
            <h1 className="font-display font-bold text-3xl text-white">Auto Schedule</h1>
            <p className="text-gray-500 text-sm">AI distributes your tasks across the week</p>
          </div>
        </div>
        <button
          onClick={generateSchedule}
          disabled={loading || pendingTasks.length === 0}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles size={16} />
          {loading ? 'Generating...' : 'Generate Schedule'}
        </button>
      </div>

      {/* Pending Tasks Summary */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare size={16} className="text-accent" />
          <h2 className="font-display font-semibold text-white text-sm">
            Pending Tasks ({pendingTasks.length})
          </h2>
        </div>
        {pendingTasks.length === 0 ? (
          <p className="text-gray-500 text-sm">🎉 No pending tasks! You're all caught up.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pendingTasks.map(t => (
              <span key={t.id} className={`text-xs px-2 py-1 rounded-lg border ${PRIORITY_COLORS[t.priority] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>
                {t.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Schedule */}
      {!schedule && !loading && (
        <div className="card p-12 text-center">
          <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-display font-semibold mb-2">No schedule yet</p>
          <p className="text-gray-600 text-sm">Click "Generate Schedule" to let AI plan your week!</p>
        </div>
      )}

      {loading && (
        <div className="card p-12 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-400 text-sm">AI is planning your week...</p>
        </div>
      )}

      {schedule && !loading && (
        <div className="grid gap-4">
          {schedule.map((day, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="p-4 bg-accent/5 border-b border-base-600/50 flex items-center gap-2">
                <Calendar size={16} className="text-accent" />
                <h3 className="font-display font-semibold text-white">{day.day}</h3>
                <span className="ml-auto text-xs text-gray-500">{day.tasks?.length || 0} tasks</span>
              </div>
              <div className="p-4 grid gap-3">
                {day.tasks?.length === 0 ? (
                  <p className="text-gray-500 text-sm">Rest day 🎉</p>
                ) : (
                  day.tasks?.map((task, j) => (
                    <div key={j} className="flex items-center gap-3 p-3 bg-base-700/30 rounded-xl border border-base-600/30">
                      <span className="text-xl">{TIME_ICONS[task.time] || '📋'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

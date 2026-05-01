import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, CheckSquare, Filter } from 'lucide-react'
import api from '../utils/api'
import TaskCard from '../components/tasks/TaskCard'
import TaskFormModal from '../components/tasks/TaskFormModal'
import EmptyState from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/helpers'

const STATUSES = ['', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
const PRIORITIES = ['', 'URGENT', 'HIGH', 'MEDIUM', 'LOW']

export default function TasksPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const params = new URLSearchParams()
  if (statusFilter) params.set('status', statusFilter)
  if (priorityFilter) params.set('priority', priorityFilter)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', statusFilter, priorityFilter],
    queryFn: () => api.get(`/api/tasks?${params.toString()}`).then(r => r.data),
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">My Tasks</h1>
          <p className="text-gray-500 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter size={15} />
          <span className="text-sm">Filter:</span>
        </div>

        <select
          className="input !w-auto !py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>
          ))}
        </select>

        <select
          className="input !w-auto !py-2 text-sm"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          {PRIORITIES.filter(Boolean).map(p => (
            <option key={p} value={p}>{PRIORITY_CONFIG[p]?.label}</option>
          ))}
        </select>

        {(statusFilter || priorityFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setPriorityFilter('') }}
            className="text-sm text-accent-light hover:text-accent transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tasks list grouped by project */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={statusFilter || priorityFilter ? "Try adjusting your filters." : "Create your first task to get started."}
          action={!statusFilter && !priorityFilter ? (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 mx-auto">
              <Plus size={18} /> New Task
            </button>
          ) : null}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} projectId={task.projectId} showProject />
          ))}
        </div>
      )}

      <TaskFormModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  )
}

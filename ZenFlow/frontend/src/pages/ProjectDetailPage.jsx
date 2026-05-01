import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, Users, Settings, ArrowLeft, UserPlus, 
  Trash2, Crown, Activity, Columns
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { STATUS_CONFIG, getErrorMessage } from '../utils/helpers'
import { StatusBadge, PriorityBadge, Badge } from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import TaskFormModal from '../components/tasks/TaskFormModal'
import TaskCard from '../components/tasks/TaskCard'
import EmptyState from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'
import { formatRelativeTime } from '../utils/helpers'

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

function KanbanColumn({ status, tasks, projectId, members }) {
  const [showCreate, setShowCreate] = useState(false)
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex-1 min-w-[260px] max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
          <h3 className="font-display font-semibold text-sm text-gray-300">{config.label}</h3>
          <span className="badge bg-base-700 text-gray-500 border-base-600/30 ml-1">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="btn-ghost p-1 opacity-60 hover:opacity-100"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} projectId={projectId} members={members} />
        ))}
        {tasks.length === 0 && (
          <div className="border border-dashed border-base-600/40 rounded-xl p-6 text-center text-gray-600 text-xs">
            Drop tasks here
          </div>
        )}
      </div>

      <TaskFormModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        members={members}
      />
    </div>
  )
}

function AddMemberModal({ isOpen, onClose, projectId }) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')

  const mutation = useMutation({
    mutationFn: () => api.post(`/api/projects/${projectId}/members`, { email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('Member added!')
      onClose()
      setEmail('')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member">
      <div className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <input
            className="input"
            type="email"
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending || !email}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showAddMember, setShowAddMember] = useState(false)
  const [activeTab, setActiveTab] = useState('board')

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/api/projects/${id}`).then(r => r.data),
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['project-activities', id],
    queryFn: () => api.get(`/api/projects/${id}/activities`).then(r => r.data),
    enabled: activeTab === 'activity',
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => api.delete(`/api/projects/${id}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      toast.success('Member removed')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isLoading) return <PageLoader />
  if (!project) return <div className="p-8 text-gray-500">Project not found</div>

  const myRole = project.members.find(m => m.userId === user?.id)?.role
  const isAdmin = myRole === 'ADMIN'

  const tasksByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = project.tasks.filter(t => t.status === status)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full animate-in">
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-base-600/50 flex-shrink-0">
        <Link to="/projects" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-4 transition-colors w-fit">
          <ArrowLeft size={15} /> Back to projects
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: project.color + '25', border: `1px solid ${project.color}40` }}
            >
              <span className="text-xl" style={{ color: project.color }}>⬡</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">{project.name}</h1>
              {project.description && (
                <p className="text-gray-500 text-sm mt-0.5">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Members avatars */}
            <div className="flex -space-x-2 mr-2">
              {project.members.slice(0, 4).map((m) => (
                <Avatar key={m.userId} name={m.user.name} size="sm" className="ring-2 ring-base-800" title={m.user.name} />
              ))}
            </div>
            {isAdmin && (
              <button onClick={() => setShowAddMember(true)} className="btn-secondary flex items-center gap-2 text-sm">
                <UserPlus size={15} /> Add Member
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 bg-base-900/50 rounded-xl p-1 w-fit">
          {[
            { id: 'board', icon: Columns, label: 'Board' },
            { id: 'members', icon: Users, label: `Members (${project.members.length})` },
            { id: 'activity', icon: Activity, label: 'Activity' },
          ].map(({ id: tabId, icon: Icon, label }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tabId 
                  ? 'bg-base-700 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Board */}
        {activeTab === 'board' && (
          <div className="p-6 lg:p-8">
            <div className="flex gap-5 overflow-x-auto pb-4">
              {STATUSES.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                  projectId={id}
                  members={project.members}
                />
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        {activeTab === 'members' && (
          <div className="p-6 lg:p-8 max-w-2xl">
            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member.userId} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.user.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-200 text-sm">{member.user.name}</p>
                        {member.role === 'ADMIN' && <Crown size={13} className="text-amber-400" />}
                      </div>
                      <p className="text-gray-500 text-xs">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'ADMIN' ? 'admin' : 'member'}>
                      {member.role}
                    </Badge>
                    {isAdmin && member.userId !== user?.id && (
                      <button
                        onClick={() => removeMemberMutation.mutate(member.userId)}
                        className="btn-ghost p-1.5 text-gray-600 hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        {activeTab === 'activity' && (
          <div className="p-6 lg:p-8 max-w-2xl">
            {activities.length === 0 ? (
              <EmptyState icon={Activity} title="No activity yet" description="Actions in this project will appear here." />
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <Avatar name={activity.user?.name} size="sm" className="flex-shrink-0" />
                    <div className="card p-3 flex-1">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-white">{activity.user?.name}</span>
                        {' '}{activity.action}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{formatRelativeTime(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddMemberModal isOpen={showAddMember} onClose={() => setShowAddMember(false)} projectId={id} />
    </div>
  )
}

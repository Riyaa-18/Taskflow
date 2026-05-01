import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FolderKanban, Users, CheckSquare, ArrowRight, Trash2, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import Modal from '../components/ui/Modal'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { PROJECT_COLORS, getErrorMessage } from '../utils/helpers'

function ProjectCard({ project, currentUserId }) {
  const queryClient = useQueryClient()
  const myRole = project.members.find(m => m.userId === currentUserId)?.role

  // ID check: Backend se 'id' ya '_id' jo bhi aa raha ho, dono handle honge
  const projectId = project.id || project._id;

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="card-hover p-6 flex flex-col gap-4 group relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: project.color + '25', border: `1px solid ${project.color}40` }}
          >
            <FolderKanban size={18} style={{ color: project.color }} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white group-hover:text-accent-light transition-colors">
              {project.name}
            </h3>
            <Badge variant={myRole === 'ADMIN' ? 'admin' : 'member'}>{myRole}</Badge>
          </div>
        </div>
        {myRole === 'ADMIN' && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Card click block na ho
              if (confirm('Delete this project? This cannot be undone.')) {
                deleteMutation.mutate()
              }
            }}
            className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 text-gray-500 hover:text-danger transition-all relative z-20"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {project.description && (
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <CheckSquare size={14} />
          {project._count?.tasks || 0} tasks
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={14} />
          {project.members?.length || 0} members
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {project.members?.slice(0, 5).map((member) => (
            <div key={member.userId} title={member.user.name}>
              <Avatar name={member.user.name} size="sm" className="ring-2 ring-base-800" />
            </div>
          ))}
        </div>

        {/* FIXED LINK: Added z-index and explicit pointer events */}
        <Link 
          to={`/projects/${projectId}`}
          onClick={() => console.log("Navigating to project:", projectId)}
          className="relative z-10 flex items-center gap-1 text-sm text-accent-light hover:text-accent transition-all font-medium bg-transparent py-1 px-2 rounded-md hover:bg-accent-light/10"
        >
          Open <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

function CreateProjectModal({ isOpen, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] })
  const [aiTasks, setAiTasks] = useState([])
  const [selectedTasks, setSelectedTasks] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [step, setStep] = useState(1)

  const mutation = useMutation({
    mutationFn: (data) => api.post('/api/projects', data),
    onSuccess: async (res) => {
      const projectId = res.data.id || res.data._id
      if (selectedTasks.length > 0) {
        await Promise.all(
          selectedTasks.map(task =>
            api.post('/api/tasks', {
              title: task.title,
              description: task.description,
              priority: task.priority,
              projectId,
            })
          )
        )
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created!')
      onClose()
      setForm({ name: '', description: '', color: PROJECT_COLORS[0] })
      setAiTasks([])
      setSelectedTasks([])
      setStep(1)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const suggestWithAI = async () => {
    if (!form.name) return toast.error('Please enter a project name first!')
    setAiLoading(true)
    try {
      const res = await api.post('/api/ai/suggest-tasks', {
        projectName: form.name,
        projectDescription: form.description,
      })
      setAiTasks(res.data.tasks)
      setSelectedTasks(res.data.tasks)
      setStep(2)
    } catch (err) {
      toast.error('AI suggestion failed!')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      {step === 1 ? (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-5">
          <div>
            <label className="label">Project name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Project color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button key={color} type="button" onClick={() => setForm({ ...form, color })} className="w-8 h-8 rounded-lg transition-all" style={{ background: color, outline: form.color === color ? `3px solid ${color}` : 'none' }} />
              ))}
            </div>
          </div>
          <button type="button" onClick={suggestWithAI} disabled={aiLoading || !form.name} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-300">
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Suggest Tasks with AI
          </button>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">{mutation.isPending ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      ) : (
        /* UI for AI Tasks Step (Keeping it simple for logic) */
        <div className="space-y-4">
           <p className="text-gray-400 text-sm">Select AI suggested tasks:</p>
           <div className="max-h-60 overflow-auto space-y-2">
             {aiTasks.map((t, i) => (
               <div key={i} className="p-2 border border-base-700 rounded-lg text-sm text-white">{t.title}</div>
             ))}
           </div>
           <button onClick={() => mutation.mutate(form)} className="btn-primary w-full">Finish Creation</button>
        </div>
      )}
    </Modal>
  )
}

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const [showCreate, setShowCreate] = useState(false)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects').then(r => r.data),
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Projects</h1>
          <p className="text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Start by creating a new project." action={<button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 mx-auto"><Plus size={18} /> Create Project</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id || project._id} project={project} currentUserId={user?.id} />
          ))}
        </div>
      )}
      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

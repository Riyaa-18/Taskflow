import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Edit2, Trash2, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { StatusBadge, PriorityBadge } from '../ui/Badge'
import Avatar from '../ui/Avatar'
import TaskFormModal from './TaskFormModal'
import { formatDate, isOverdue, getErrorMessage } from '../../utils/helpers'
import { useAuthStore } from '../../store/authStore'

export default function TaskCard({ task, projectId, members = [], showProject = false }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const { addXP } = useAuthStore()

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/tasks/${task.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Task deleted')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => api.put(`/api/tasks/${task.id}`, { status }),
    onSuccess: (_, status) => {
      if (status === 'DONE') {
        addXP(10)
        toast.success('✅ +10 XP earned!')
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const NEXT_STATUS = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'REVIEW',
    REVIEW: 'DONE',
    DONE: 'TODO',
  }

  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE'

  return (
    <>
      <div className="card p-4 group hover:border-accent/20 transition-all duration-200">
        <div className="flex items-start gap-3">
          <button
            title={`Move to ${NEXT_STATUS[task.status]}`}
            onClick={() => statusMutation.mutate(NEXT_STATUS[task.status])}
            className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all hover:scale-125"
            style={{ 
              borderColor: task.status === 'DONE' ? '#22c55e' : '#3d3d55',
              background: task.status === 'DONE' ? '#22c55e' : 'transparent',
            }}
          />

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium mb-2 ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
              {task.title}
            </p>

            {task.description && (
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {showProject && task.project && (
                <span className="badge border border-base-500/30 bg-base-700/50 text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: task.project.color }} />
                  {task.project.name}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={task.assignee.name} size="xs" />
                    <span className="text-xs text-gray-500">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <User size={12} /> Unassigned
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {task.dueDate && (
                  <span className={`text-xs flex items-center gap-1 mr-2 ${overdue ? 'text-danger' : 'text-gray-600'}`}>
                    <Clock size={11} />
                    {formatDate(task.dueDate)}
                  </span>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="opacity-0 group-hover:opacity-100 btn-ghost p-1 text-gray-500 hover:text-accent-light"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this task?')) deleteMutation.mutate()
                  }}
                  className="opacity-0 group-hover:opacity-100 btn-ghost p-1 text-gray-500 hover:text-danger"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskFormModal
        isOpen={editing}
        onClose={() => setEditing(false)}
        projectId={projectId || task.projectId}
        task={task}
        members={members}
      />
    </>
  )
}
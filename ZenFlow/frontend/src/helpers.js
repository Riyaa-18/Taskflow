import { clsx } from 'clsx'
import { formatDistanceToNow, isAfter, parseISO, format } from 'date-fns'

export const cn = (...args) => clsx(...args)

export const formatRelativeTime = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'MMM dd, yyyy')
}

export const isOverdue = (dueDate) => {
  if (!dueDate) return false
  return !isAfter(new Date(dueDate), new Date())
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'text-gray-400', bg: 'bg-gray-600/20', border: 'border-gray-600/30' },
  MEDIUM: { label: 'Medium', color: 'text-info', bg: 'bg-info/15', border: 'border-info/30' },
  HIGH: { label: 'High', color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/30' },
  URGENT: { label: 'Urgent', color: 'text-danger', bg: 'bg-danger/15', border: 'border-danger/30' },
}

export const STATUS_CONFIG = {
  TODO: { label: 'To Do', color: 'text-gray-400', bg: 'bg-gray-600/20', border: 'border-gray-600/30', dot: 'bg-gray-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-info', bg: 'bg-info/15', border: 'border-info/30', dot: 'bg-info' },
  REVIEW: { label: 'Review', color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/30', dot: 'bg-warning' },
  DONE: { label: 'Done', color: 'text-success', bg: 'bg-success/15', border: 'border-success/30', dot: 'bg-success' },
}

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#3b82f6', '#06b6d4',
  '#84cc16', '#f97316',
]

export const getErrorMessage = (err) => {
  return err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Something went wrong'
}

import { STATUS_CONFIG, PRIORITY_CONFIG, cn } from '../../utils/helpers'

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.TODO
  return (
    <span className={cn('badge border', config.bg, config.color, config.border)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM
  return (
    <span className={cn('badge border', config.bg, config.color, config.border)}>
      {config.label}
    </span>
  )
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-base-600/50 text-gray-300 border-base-500/30',
    primary: 'bg-accent/15 text-accent-light border-accent/30',
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    danger: 'bg-danger/15 text-danger border-danger/30',
    admin: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    member: 'bg-base-600/30 text-gray-400 border-base-500/30',
  }
  return (
    <span className={cn('badge border', variants[variant], className)}>
      {children}
    </span>
  )
}

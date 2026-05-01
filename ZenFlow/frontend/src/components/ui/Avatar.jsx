import { getInitials, cn } from '../../utils/helpers'

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

const colors = [
  'bg-violet-600', 'bg-indigo-600', 'bg-blue-600', 'bg-teal-600',
  'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-pink-600',
]

const getColor = (name = '') => {
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export default function Avatar({ name, src, size = 'md', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-white',
      sizes[size],
      getColor(name),
      className
    )}>
      {getInitials(name)}
    </div>
  )
}

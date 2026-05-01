import { cn } from '../../utils/helpers'

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-2',
  }
  return (
    <div className={cn(
      'rounded-full border-accent/20 border-t-accent animate-spin',
      sizes[size],
      className
    )} />
  )
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-900">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 font-body text-sm">Loading TaskFlow...</p>
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center p-20">
      <Spinner size="lg" />
    </div>
  )
}

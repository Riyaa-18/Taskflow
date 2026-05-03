import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import Avatar from '../components/ui/Avatar'
import { Users, CheckSquare, Clock, AlertTriangle } from 'lucide-react'

export default function TeamPage() {
  const { data: members, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => api.get('/api/users/team').then(r => r.data),
  })

  if (isLoading) return <div className="p-8 text-gray-400">Loading team...</div>

  return (
    <div className="p-6 lg:p-8 animate-in">
      <div className="flex items-center gap-3 mb-8">
        <Users size={24} className="text-accent" />
        <h1 className="font-display font-bold text-3xl text-white">Team Members</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members?.map(member => (
          <div key={member.id} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={member.name} size="md" />
              <div>
                <p className="font-medium text-white">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                  member.role === 'ADMIN' ? 'bg-accent/20 text-accent' : 'bg-gray-600/30 text-gray-400'
                }`}>
                  {member.role === 'ADMIN' ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-base-700/50 rounded-lg p-2 text-center">
                <CheckSquare size={14} className="text-success mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{member.stats?.done || 0}</p>
                <p className="text-xs text-gray-500">Done</p>
              </div>
              <div className="bg-base-700/50 rounded-lg p-2 text-center">
                <Clock size={14} className="text-accent mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{member.stats?.inProgress || 0}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="bg-base-700/50 rounded-lg p-2 text-center">
                <AlertTriangle size={14} className="text-danger mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{member.stats?.overdue || 0}</p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

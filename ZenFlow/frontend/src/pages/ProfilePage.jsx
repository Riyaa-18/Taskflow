import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, Lock, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import Avatar from '../components/ui/Avatar'
import { getErrorMessage } from '../utils/helpers'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })

  const profileMutation = useMutation({
    mutationFn: (data) => api.put('/api/users/profile', data),
    onSuccess: ({ data }) => {
      updateUser(data)
      toast.success('Profile updated!')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const passMutation = useMutation({
    mutationFn: (data) => api.put('/api/users/password', data),
    onSuccess: () => {
      toast.success('Password changed!')
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
const deleteMutation = useMutation({
  mutationFn: () => api.delete('/api/users/account'),
  onSuccess: () => {
    logout()
    toast.success('Account deleted!')
  },
  onError: (err) => toast.error(getErrorMessage(err)),
})
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (passForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    passMutation.mutate({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto animate-in">
      <h1 className="font-display font-bold text-3xl text-white mb-8">Profile Settings</h1>

      {/* Profile section */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} size="xl" />
          <div>
            <p className="font-display font-semibold text-lg text-white">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); profileMutation.mutate(profileForm) }} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-accent" />
            <h2 className="font-display font-semibold text-white">Personal Information</h2>
          </div>

          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={16} className="text-accent" />
          <h2 className="font-display font-semibold text-white">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              placeholder="Enter current password"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              placeholder="At least 6 characters"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              className="input"
              placeholder="Repeat new password"
              value={passForm.confirm}
              onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={passMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Lock size={16} />
            {passMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
      {/* Delete Account */}
      <div className="card p-6 mt-6 border border-red-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={16} className="text-red-500" />
          <h2 className="font-display font-semibold text-white">Delete Account</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">Once deleted, your account cannot be recovered.</p>
        <button
          onClick={() => {
            if (window.confirm('Are you sure? This cannot be undone!')) {
              deleteMutation.mutate()
            }
          }}
          disabled={deleteMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-colors"
        >
          <Trash2 size={16} />
          {deleteMutation.isPending ? 'Deleting...' : 'Delete My Account'}
        </button>
      </div>
    </div>
  )
}


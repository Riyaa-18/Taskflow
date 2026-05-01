import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../utils/helpers'

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const mutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/signup', data),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken)
      toast.success(`Welcome to TaskFlow, ${data.user.name}!`)
      navigate('/dashboard')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-in">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-glow-sm">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">TaskFlow</span>
        </div>

        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create your account</h1>
          <p className="text-gray-400">Start managing projects with your team today</p>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {['Role-based access', 'Task tracking', 'Team collaboration', 'Live dashboard'].map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 rounded-full bg-success/20 border border-success/40 flex items-center justify-center flex-shrink-0">
                <Check size={10} className="text-success" />
              </div>
              {perk}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-5">
          <div>
            <label className="label">Full name</label>
            <input
              type="text"
              className="input"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-12"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <><div className="spinner" /> Creating account...</>
            ) : (
              <>Create account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-light hover:text-accent font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Heart, Mail, Lock, User, Eye, EyeOff, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import useAuthStore from '../store/authStore'

const ROLES = [
    { value: 'doctor', label: '👨‍⚕️ Doctor' },
    { value: 'nurse', label: '👩‍⚕️ Nurse' },
    { value: 'patient', label: '🏥 Patient' },
]

export default function RegisterPage() {
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { role: 'patient' } })
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    const onSubmit = async (values) => {
        setLoading(true)
        try {
            const { data: user } = await authApi.register(values)
            // Auto-login after register
            const { data: tokenData } = await authApi.login(values.email, values.password)
            setAuth(tokenData.user, tokenData.access_token)
            toast.success(`Account created! Welcome, ${user.full_name} 🎉`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6"
            style={{ background: 'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#1a0a14 100%)' }}>
            {/* Orbs */}
            <div className="fixed top-10 right-10 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle,#f43f5e,transparent)' }} />
            <div className="fixed bottom-10 left-10 w-60 h-60 rounded-full blur-3xl opacity-8 pointer-events-none"
                style={{ background: 'radial-gradient(circle,#3b82f6,transparent)' }} />

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-red"
                        style={{ background: 'linear-gradient(135deg,#f43f5e,#be123c)' }}>
                        <Heart className="w-8 h-8 text-white animate-heartbeat" />
                    </div>
                    <h1 className="font-display font-bold text-3xl gradient-text">CardioAI</h1>
                    <p className="text-slate-400 text-sm mt-1">Hospital System</p>
                </div>

                <div className="glass-card p-8" style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>
                    <div className="mb-7">
                        <h2 className="font-display font-bold text-2xl text-white mb-1">Create Account</h2>
                        <p className="text-sm text-slate-400">Join the CardioAI Hospital platform</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="form-register">
                        {/* Full Name */}
                        <div>
                            <label className="form-label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input id="input-name" type="text" placeholder="Dr. Ramesh Kumar"
                                    className="form-input pl-10"
                                    {...register('full_name', { required: 'Full name required', minLength: { value: 2, message: 'Min 2 chars' } })} />
                            </div>
                            {errors.full_name && <p className="mt-1 text-xs text-cardiac-400">{errors.full_name.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="form-label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input id="input-email" type="email" placeholder="doctor@hospital.com"
                                    className="form-input pl-10"
                                    {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })} />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-cardiac-400">{errors.email.message}</p>}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="form-label">Role</label>
                            <select id="select-role" className="form-input"
                                {...register('role', { required: true })}>
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input id="input-password" type={showPwd ? 'text' : 'password'}
                                    placeholder="Min 6 characters" className="form-input pl-10 pr-10"
                                    {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-cardiac-400">{errors.password.message}</p>}
                        </div>

                        <button id="btn-register" type="submit" disabled={loading} className="btn-primary w-full">
                            {loading
                                ? <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>Creating…</span>
                                : <><UserCheck className="w-4 h-4" />Create Account</>}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-cardiac-400 hover:text-cardiac-300 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

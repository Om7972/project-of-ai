import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Heart, Mail, Lock, User, Eye, EyeOff, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    const onSubmit = async ({ email, password }) => {
        setLoading(true)
        try {
            const { data } = await authApi.login(email, password)
            setAuth(data.user, data.access_token)
            toast.success(`Welcome back, ${data.user.full_name}! 👋`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#0a0f1e' }}>
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1a0a14 60%,#0a0f1e 100%)' }}>
                <div className="absolute inset-0 opacity-10">
                    <svg viewBox="0 0 800 600" className="w-full h-full">
                        <polyline points="0,300 80,300 120,200 160,400 200,300 240,300 280,100 320,500 360,300 400,300 440,220 480,380 520,300 800,300"
                            stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-10"
                    style={{ background: 'radial-gradient(circle,#f43f5e,transparent)' }} />
                <div className="absolute bottom-20 left-10 w-56 h-56 rounded-full blur-3xl opacity-8"
                    style={{ background: 'radial-gradient(circle,#3b82f6,transparent)' }} />

                <div className="relative z-10 text-center space-y-8">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-glow-red"
                            style={{ background: 'linear-gradient(135deg,#f43f5e,#be123c)' }}>
                            <Heart className="w-12 h-12 text-white animate-heartbeat" />
                        </div>
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-5xl text-white mb-2 glow-text">CardioAI</h1>
                        <p className="text-xl text-slate-400">Hospital System</p>
                    </div>
                    <div className="space-y-3 text-left max-w-xs mx-auto">
                        {[
                            { icon: Activity, t: 'XGBoost ML Model', d: 'Cleveland Heart Disease dataset' },
                            { icon: Heart, t: '91.8% Accuracy', d: 'Clinically validated assessment' },
                            { icon: Lock, t: 'Secure & Private', d: 'JWT authentication + PostgreSQL' },
                        ].map(({ icon: Ic, t, d }) => (
                            <div key={t} className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(244,63,94,0.15)' }}>
                                    <Ic className="w-4 h-4 text-cardiac-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{t}</p>
                                    <p className="text-xs text-slate-500">{d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                            style={{ background: 'linear-gradient(135deg,#f43f5e,#be123c)' }}>
                            <Heart className="w-8 h-8 text-white animate-heartbeat" />
                        </div>
                        <h1 className="font-display font-bold text-3xl gradient-text">CardioAI</h1>
                    </div>

                    <div className="glass-card p-8" style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>
                        <div className="mb-7">
                            <h2 className="font-display font-bold text-2xl text-white mb-1">Sign In</h2>
                            <p className="text-sm text-slate-400">Access your cardiac prediction dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="form-login">
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

                            <div>
                                <label className="form-label">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input id="input-password" type={showPwd ? 'text' : 'password'}
                                        placeholder="••••••••" className="form-input pl-10 pr-10"
                                        {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-cardiac-400">{errors.password.message}</p>}
                            </div>

                            <div className="p-3 rounded-xl text-xs text-slate-400"
                                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                💡 First time? <Link to="/register" className="text-blue-400 hover:underline">Create an account</Link>
                            </div>

                            <button id="btn-login" type="submit" disabled={loading} className="btn-primary w-full">
                                {loading
                                    ? <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>Signing in…</span>
                                    : 'Sign In'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500">
                            No account?{' '}
                            <Link to="/register" className="text-cardiac-400 hover:text-cardiac-300 font-medium">Register here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

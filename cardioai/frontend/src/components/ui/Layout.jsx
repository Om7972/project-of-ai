import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Heart, LayoutDashboard, Activity, History, LogOut, User, Shield } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const navLinks = [
    { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/predict', label: 'Predict', Icon: Activity },
    { to: '/history', label: 'History', Icon: History },
]

const roleColors = {
    admin: 'text-purple-400',
    doctor: 'text-blue-400',
    nurse: 'text-teal-400',
    patient: 'text-cardiac-400',
}

export default function Layout() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#0a0f1e' }}>
            {/* ── Sidebar ──────────────────────────────────────────── */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/5"
                style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)' }}>

                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)' }}>
                            <Heart className="w-5 h-5 text-white animate-heartbeat" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-white text-sm leading-tight">CardioAI</h1>
                            <p className="text-xs text-slate-500">Hospital System</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map(({ to, label, Icon }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) =>
                                clsx('nav-item', { active: isActive })
                            }>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User profile */}
                <div className="p-4 border-t border-white/5">
                    <div className="glass-card p-3 flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#f43f5e,#be123c)' }}>
                            {user?.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
                            <p className={clsx('text-xs capitalize flex items-center gap-1', roleColors[user?.role] || 'text-slate-400')}>
                                <Shield className="w-3 h-3" />
                                {user?.role || 'patient'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleLogout} id="btn-logout"
                        className="btn-secondary w-full text-xs py-2">
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}

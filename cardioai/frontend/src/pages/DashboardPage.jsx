import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { predictApi } from '../services/api'
import useAuthStore from '../store/authStore'
import { Activity, ShieldAlert, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import toast from 'react-hot-toast'

export default function DashboardPage() {
    const { user } = useAuthStore()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await predictApi.stats()
                setStats(data)
            } catch (err) {
                toast.error('Failed to load dashboard statistics')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-cardiac-500 animate-spin" />
            </div>
        )
    }

    const pieData = [
        { name: 'Negative', value: stats?.negative_cases || 0, color: '#10b981' }, // Emerald
        { name: 'Positive', value: stats?.positive_cases || 0, color: '#f43f5e' }, // Rose
    ]

    return (
        <div>
            {/* Header */}
            <header className="page-header px-8 py-10 border-b border-white/5">
                <div className="absolute inset-0 bg-hero-pattern opacity-30" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        Welcome, {user?.full_name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-slate-400">
                        Overview of your cardiac prediction activity and system status.
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="p-8 max-w-7xl mx-auto space-y-8">

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4">
                    <Link to="/predict" className="btn-primary">
                        <Activity className="w-4 h-4" />
                        New Prediction
                    </Link>
                    <Link to="/history" className="btn-secondary">
                        View History
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in">
                    {/* Total */}
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-slate-400 text-sm font-medium">Total Predictions</h3>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-400" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.total_predictions || 0}</div>
                    </div>

                    {/* High Risk */}
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-slate-400 text-sm font-medium">High Risk Cases</h3>
                            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.high_risk_cases || 0}</div>
                    </div>

                    {/* Accuracy */}
                    <div className="stat-card border-cardiac-500/20 bg-cardiac-500/5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-cardiac-200 text-sm font-medium">Model Accuracy</h3>
                            <div className="w-8 h-8 rounded-lg bg-cardiac-500/20 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-cardiac-400" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-cardiac-400">{stats?.model_accuracy_pct}%</div>
                        <p className="text-xs text-cardiac-400/60 mt-1">{stats?.model_name}</p>
                    </div>

                    {/* Negative/Safe */}
                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-slate-400 text-sm font-medium">Negative Cases</h3>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.negative_cases || 0}</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in" style={{ animationDelay: '100ms' }}>

                    <div className="glass-card p-6 lg:col-span-1">
                        <h3 className="text-lg font-bold text-white mb-6 font-display">Prediction Distribution</h3>
                        {stats?.total_predictions > 0 ? (
                            <div className="h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                                No data available yet
                            </div>
                        )}
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-xs text-slate-400">Negative</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-cardiac-500" />
                                <span className="text-xs text-slate-400">Positive</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-blue-500/10 border border-blue-500/20">
                                <Activity className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white font-display">Ready for Analysis</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                The ML model is loaded and ready. Navigate to the Predict tab to input patient parameters and receive a cardiac event risk assessment.
                            </p>
                            <Link to="/predict" className="btn-primary mt-4 inline-flex">
                                Start Assessment
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

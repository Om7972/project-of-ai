import { useState, useEffect } from 'react'
import { predictApi } from '../services/api'
import toast from 'react-hot-toast'
import { History, Trash2, ChevronRight, AlertTriangle, CheckCircle, Search } from 'lucide-react'

const RISK_COLORS = {
    Low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    Moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    High: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)' },
}

const PAGE_SIZE = 10

export default function HistoryPage() {
    const [predictions, setPredictions] = useState([])
    const [loading, setLoading] = useState(true)
    const [skip, setSkip] = useState(0)
    const [search, setSearch] = useState('')
    const [deleting, setDeleting] = useState(null)

    const fetchHistory = async (offset = 0) => {
        setLoading(true)
        try {
            const { data } = await predictApi.list(offset, PAGE_SIZE)
            setPredictions(data)
        } catch {
            toast.error('Failed to load prediction history')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchHistory(0) }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this prediction record?')) return
        setDeleting(id)
        try {
            await predictApi.delete(id)
            setPredictions(prev => prev.filter(p => p.id !== id))
            toast.success('Prediction deleted')
        } catch {
            toast.error('Failed to delete prediction')
        } finally {
            setDeleting(null)
        }
    }

    const handlePrev = () => { const n = Math.max(0, skip - PAGE_SIZE); setSkip(n); fetchHistory(n) }
    const handleNext = () => { const n = skip + PAGE_SIZE; setSkip(n); fetchHistory(n) }

    const filtered = predictions.filter(p =>
        p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.risk_level?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            {/* Header */}
            <header className="page-header px-8 py-10 border-b border-white/5">
                <div className="absolute inset-0 bg-hero-pattern opacity-30" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
                        <History className="w-8 h-8 text-cardiac-400" />
                        Prediction History
                    </h1>
                    <p className="text-slate-400">
                        All saved cardiac risk assessments. Click a record to view details.
                    </p>
                </div>
            </header>

            <div className="p-8 max-w-6xl mx-auto space-y-6">

                {/* Search + Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            id="input-history-search"
                            type="text"
                            placeholder="Search by patient or risk…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-field pl-9 w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            id="btn-history-prev"
                            onClick={handlePrev}
                            disabled={skip === 0 || loading}
                            className="btn-secondary px-3 py-2 text-xs disabled:opacity-40"
                        >
                            ← Prev
                        </button>
                        <span className="flex items-center text-xs text-slate-400 px-2">
                            Page {Math.floor(skip / PAGE_SIZE) + 1}
                        </span>
                        <button
                            id="btn-history-next"
                            onClick={handleNext}
                            disabled={predictions.length < PAGE_SIZE || loading}
                            className="btn-secondary px-3 py-2 text-xs disabled:opacity-40"
                        >
                            Next →
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="glass-card p-16 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-t-2 border-cardiac-500 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Records Found</h3>
                        <p className="text-slate-400 text-sm">
                            {search ? 'No records match your search.' : 'Run your first prediction to see history here.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in">
                        {filtered.map(pred => {
                            const risk = RISK_COLORS[pred.risk_level] || RISK_COLORS.High
                            return (
                                <div
                                    key={pred.id}
                                    className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-white/10"
                                    style={{ borderColor: risk.border }}
                                >
                                    {/* Risk Badge */}
                                    <div
                                        className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                                        style={{ background: risk.bg, color: risk.color }}
                                    >
                                        {pred.risk_level === 'Low'
                                            ? <CheckCircle className="w-4 h-4" />
                                            : <AlertTriangle className="w-4 h-4" />}
                                        {pred.risk_level}
                                    </div>

                                    {/* Patient Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold truncate">{pred.patient_name}</p>
                                        <p className="text-slate-400 text-xs">
                                            Age {pred.patient_age} · {pred.patient_gender} ·
                                            {' '}Prob: <span style={{ color: risk.color }}>{pred.risk_probability?.toFixed(1) ?? (pred.probability * 100).toFixed(1)}%</span>
                                        </p>
                                    </div>

                                    {/* Clinical Highlights */}
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                        <span>BP: {pred.trestbps} mmHg</span>
                                        <span>Chol: {pred.chol} mg/dl</span>
                                        <span>HR: {pred.thalach} bpm</span>
                                    </div>

                                    {/* Date */}
                                    <div className="text-xs text-slate-500 flex-shrink-0">
                                        {new Date(pred.created_at).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                        })}
                                    </div>

                                    {/* Delete */}
                                    <button
                                        id={`btn-delete-${pred.id}`}
                                        onClick={() => handleDelete(pred.id)}
                                        disabled={deleting === pred.id}
                                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                                        title="Delete record"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

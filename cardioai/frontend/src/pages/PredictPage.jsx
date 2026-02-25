import { useState } from 'react'
import { predictApi } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import {
    Activity, Heart, User, AlertTriangle, CheckCircle,
    ChevronRight, Loader2, Info
} from 'lucide-react'

/* ──────────────────────────────────────────────────────
   Field definitions aligned to Cleveland Dataset
────────────────────────────────────────────────────── */
const FIELDS = [
    {
        id: 'patient_name', label: 'Patient Name', type: 'text',
        placeholder: 'Full name', group: 'Patient Info',
        min: undefined, max: undefined, step: undefined,
    },
    {
        id: 'patient_gender', label: 'Patient Gender', type: 'select',
        options: ['Male', 'Female', 'Other'], group: 'Patient Info',
    },
    {
        id: 'age', label: 'Age (years)', type: 'number',
        min: 1, max: 120, step: 1, placeholder: '29–77', group: 'Clinical Features',
    },
    {
        id: 'sex', label: 'Biological Sex', type: 'select',
        options: [{ value: 1, label: 'Male' }, { value: 0, label: 'Female' }],
        group: 'Clinical Features',
    },
    {
        id: 'cp', label: 'Chest Pain Type', type: 'select',
        options: [
            { value: 0, label: '0 — Typical Angina' },
            { value: 1, label: '1 — Atypical Angina' },
            { value: 2, label: '2 — Non-Anginal Pain' },
            { value: 3, label: '3 — Asymptomatic' },
        ],
        group: 'Clinical Features',
    },
    {
        id: 'trestbps', label: 'Resting BP (mmHg)', type: 'number',
        min: 60, max: 250, step: 1, placeholder: '60–250', group: 'Clinical Features',
    },
    {
        id: 'chol', label: 'Cholesterol (mg/dl)', type: 'number',
        min: 100, max: 700, step: 1, placeholder: '100–700', group: 'Clinical Features',
    },
    {
        id: 'fbs', label: 'Fasting Blood Sugar > 120', type: 'select',
        options: [{ value: 0, label: 'No (≤ 120 mg/dl)' }, { value: 1, label: 'Yes (> 120 mg/dl)' }],
        group: 'Clinical Features',
    },
    {
        id: 'restecg', label: 'Resting ECG', type: 'select',
        options: [
            { value: 0, label: '0 — Normal' },
            { value: 1, label: '1 — ST-T Wave Abnormality' },
            { value: 2, label: '2 — LV Hypertrophy' },
        ],
        group: 'Clinical Features',
    },
    {
        id: 'thalach', label: 'Max Heart Rate (bpm)', type: 'number',
        min: 60, max: 250, step: 1, placeholder: '60–250', group: 'Clinical Features',
    },
    {
        id: 'exang', label: 'Exercise Induced Angina', type: 'select',
        options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }],
        group: 'Clinical Features',
    },
    {
        id: 'oldpeak', label: 'ST Depression (Oldpeak)', type: 'number',
        min: 0.0, max: 10.0, step: 0.1, placeholder: '0.0–10.0', group: 'Clinical Features',
    },
    {
        id: 'slope', label: 'ST Slope', type: 'select',
        options: [
            { value: 0, label: '0 — Upsloping' },
            { value: 1, label: '1 — Flat' },
            { value: 2, label: '2 — Downsloping' },
        ],
        group: 'Clinical Features',
    },
    {
        id: 'ca', label: 'Major Vessels (Fluoroscopy)', type: 'select',
        options: [0, 1, 2, 3, 4].map(v => ({ value: v, label: `${v} vessel${v !== 1 ? 's' : ''}` })),
        group: 'Clinical Features',
    },
    {
        id: 'thal', label: 'Thalassemia', type: 'select',
        options: [
            { value: 0, label: '0 — Unknown' },
            { value: 1, label: '1 — Fixed Defect' },
            { value: 2, label: '2 — Normal' },
            { value: 3, label: '3 — Reversible Defect' },
        ],
        group: 'Clinical Features',
    },
    {
        id: 'notes', label: 'Clinical Notes (optional)', type: 'textarea',
        placeholder: 'Any relevant observations…', group: 'Notes',
    },
]

const INITIAL_FORM = {
    patient_name: '', patient_gender: 'Male',
    age: '', sex: 1, cp: 2,
    trestbps: '', chol: '', fbs: 0,
    restecg: 0, thalach: '', exang: 0,
    oldpeak: '', slope: 1, ca: 0, thal: 2,
    notes: '',
}

const RISK_CONFIG = {
    Low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Low Risk' },
    Moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle, label: 'Moderate Risk' },
    High: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', icon: AlertTriangle, label: 'High Risk' },
}

export default function PredictPage() {
    const { isAuthenticated } = useAuthStore()
    const [form, setForm] = useState(INITIAL_FORM)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validate = () => {
        const errs = {}
        if (!form.patient_name?.trim()) errs.patient_name = 'Patient name is required'
        if (!form.age || form.age < 1 || form.age > 120) errs.age = 'Age must be 1–120'
        if (!form.trestbps || form.trestbps < 60 || form.trestbps > 250) errs.trestbps = 'BP: 60–250 mmHg'
        if (!form.chol || form.chol < 100 || form.chol > 700) errs.chol = 'Chol: 100–700 mg/dl'
        if (!form.thalach || form.thalach < 60 || form.thalach > 250) errs.thalach = 'Heart rate: 60–250 bpm'
        if (form.oldpeak === '' || form.oldpeak < 0 || form.oldpeak > 10) errs.oldpeak = 'Oldpeak: 0.0–10.0'
        return errs
    }

    const handleChange = (id, value) => {
        setForm(prev => ({ ...prev, [id]: value }))
        if (errors[id]) setErrors(prev => { const e = { ...prev }; delete e[id]; return e })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); toast.error('Please fix validation errors'); return }

        setLoading(true)
        setResult(null)
        try {
            const payload = {
                ...form,
                age: Number(form.age),
                trestbps: Number(form.trestbps),
                chol: Number(form.chol),
                thalach: Number(form.thalach),
                oldpeak: parseFloat(form.oldpeak),
                sex: Number(form.sex), cp: Number(form.cp), fbs: Number(form.fbs),
                restecg: Number(form.restecg), exang: Number(form.exang),
                slope: Number(form.slope), ca: Number(form.ca), thal: Number(form.thal),
            }
            const { data } = isAuthenticated
                ? await predictApi.predict(payload)
                : await predictApi.predictGuest(payload)
            setResult(data)
            toast.success('Prediction complete!')
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err) {
            const detail = err.response?.data?.detail || 'Prediction failed. Please try again.'
            toast.error(detail)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => { setForm(INITIAL_FORM); setResult(null); setErrors({}) }

    // Group fields
    const groups = ['Patient Info', 'Clinical Features', 'Notes']

    const risk = result ? (RISK_CONFIG[result.risk_level] || RISK_CONFIG.High) : null
    const RiskIcon = risk?.icon

    return (
        <div>
            {/* Header */}
            <header className="page-header px-8 py-10 border-b border-white/5">
                <div className="absolute inset-0 bg-hero-pattern opacity-30" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-cardiac-400" />
                        Cardiac Risk Assessment
                    </h1>
                    <p className="text-slate-400">
                        Enter 13 clinical parameters to receive an XGBoost-powered cardiac disease prediction.
                        {!isAuthenticated && (
                            <span className="ml-2 text-amber-400 text-sm">
                                (Guest mode — results not saved)
                            </span>
                        )}
                    </p>
                </div>
            </header>

            <div className="p-8 max-w-5xl mx-auto space-y-8">
                {/* Result Card */}
                {result && risk && (
                    <div className="glass-card p-6 animate-in" style={{ borderColor: `${risk.color}40`, background: risk.bg }}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Gauge */}
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="relative w-28 h-28">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                        <circle
                                            cx="50" cy="50" r="40" fill="none"
                                            stroke={risk.color} strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2.51327 * result.risk_probability} ${251.327}`}
                                            style={{ transition: 'stroke-dasharray 1s ease' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold" style={{ color: risk.color }}>
                                            {result.risk_probability.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 mt-1">Risk Probability</span>
                            </div>

                            {/* Text Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <RiskIcon className="w-6 h-6" style={{ color: risk.color }} />
                                    <h2 className="text-2xl font-bold font-display" style={{ color: risk.color }}>
                                        {risk.label}
                                    </h2>
                                </div>
                                <p className="text-slate-300 text-sm mb-4">
                                    {result.risk_level === 'Low' && 'This patient shows a low probability of cardiac disease. Maintain healthy lifestyle habits and schedule routine follow-ups.'}
                                    {result.risk_level === 'Moderate' && 'This patient is at moderate risk. Follow-up testing and lifestyle modification counselling is recommended.'}
                                    {result.risk_level === 'High' && 'This patient shows a high risk of cardiac disease. Immediate cardiology referral and further diagnostic workup is strongly advised.'}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 text-xs">Prediction</p>
                                        <p className="text-white font-medium">{result.prediction === 1 ? '🔴 Disease Detected' : '🟢 No Disease'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Confidence</p>
                                        <p className="text-white font-medium">{(result.confidence * 100).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Model</p>
                                        <p className="text-white font-medium text-xs">{result.model_used.split('(')[0].trim()}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleReset}
                                className="btn-secondary text-xs flex-shrink-0"
                                id="btn-reset-prediction"
                            >
                                New Assessment
                            </button>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8" id="form-cardiac-predict">
                    {groups.map(group => {
                        const groupFields = FIELDS.filter(f => f.group === group)
                        return (
                            <div key={group} className="glass-card p-6">
                                <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                                    {group === 'Patient Info' && <User className="w-5 h-5 text-cardiac-400" />}
                                    {group === 'Clinical Features' && <Heart className="w-5 h-5 text-cardiac-400" />}
                                    {group === 'Notes' && <Info className="w-5 h-5 text-cardiac-400" />}
                                    {group}
                                </h2>

                                <div className={`grid gap-5 ${group === 'Clinical Features' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                    {groupFields.map(field => (
                                        <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                                            <label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-slate-300 mb-1.5">
                                                {field.label}
                                            </label>

                                            {field.type === 'select' ? (
                                                <select
                                                    id={`field-${field.id}`}
                                                    value={form[field.id]}
                                                    onChange={e => handleChange(field.id, e.target.value)}
                                                    className="input-field w-full"
                                                >
                                                    {field.options.map(opt => (
                                                        typeof opt === 'object'
                                                            ? <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            : <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    id={`field-${field.id}`}
                                                    value={form[field.id]}
                                                    onChange={e => handleChange(field.id, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    rows={3}
                                                    className="input-field w-full resize-none"
                                                />
                                            ) : (
                                                <input
                                                    id={`field-${field.id}`}
                                                    type={field.type}
                                                    value={form[field.id]}
                                                    onChange={e => handleChange(field.id, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    min={field.min}
                                                    max={field.max}
                                                    step={field.step}
                                                    className={`input-field w-full ${errors[field.id] ? 'border-red-500/60 focus:ring-red-500/30' : ''}`}
                                                />
                                            )}

                                            {errors[field.id] && (
                                                <p className="text-red-400 text-xs mt-1">{errors[field.id]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    {/* Submit */}
                    <div className="flex flex-wrap gap-4">
                        <button
                            type="submit"
                            id="btn-submit-prediction"
                            disabled={loading}
                            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analysing…
                                </>
                            ) : (
                                <>
                                    <Heart className="w-4 h-4" />
                                    Run Prediction
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            id="btn-clear-form"
                            onClick={handleReset}
                            className="btn-secondary"
                        >
                            Clear Form
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

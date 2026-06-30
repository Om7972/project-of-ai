import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldAlert, Download, Info, AlertTriangle, History, Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import RiskGauge from './RiskGauge';
import RiskTrendChart from './RiskTrendChart';
import ExplainabilityChart from './ExplainabilityChart';
import { predictApi } from '../../services/api';

const RiskResultCard = ({ result }) => {
    const [explain, setExplain] = useState(null);
    const [loadingExplain, setLoadingExplain] = useState(false);
    const [downloading, setDownloading] = useState(false);

    if (!result) return null;
    const { risk_probability, risk_level, prediction_id, patient_uid, triage_created } = result;

    useEffect(() => {
        if (!prediction_id) return;
        setLoadingExplain(true);
        predictApi.explain(prediction_id)
            .then((res) => setExplain(res.data))
            .catch(() => setExplain(null))
            .finally(() => setLoadingExplain(false));
    }, [prediction_id]);

    const handleDownload = async () => {
        if (!prediction_id) return;
        setDownloading(true);
        try {
            const res = await predictApi.report(prediction_id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `cardioai_report_${prediction_id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Clinical report downloaded');
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-[2.5rem] p-8 space-y-8 sticky top-12"
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-medical-100 flex items-center justify-center text-medical-600">
                            <ShieldAlert size={18} />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnosis Overview</h2>
                    </div>
                    <h1 className="text-3xl font-black font-display text-slate-900 tracking-tight">Cardiac Profile</h1>
                    {patient_uid && (
                        <p className="text-[10px] font-bold text-slate-400">UID: {patient_uid.slice(0, 8)}...</p>
                    )}
                </div>
                <button
                    onClick={handleDownload}
                    disabled={!prediction_id || downloading}
                    className="w-10 h-10 rounded-xl bg-white/50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-medical-50 hover:text-medical-600 transition-all disabled:opacity-50"
                >
                    {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                </button>
            </div>

            {triage_created && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    Added to triage queue for clinical review
                </div>
            )}

            <div className="flex flex-col xl:flex-row items-center gap-10">
                <RiskGauge probability={risk_probability} riskLevel={risk_level} />
                <div className="flex-1 w-full space-y-6">
                    <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500" />
                            AI Clinical Guidance
                        </h3>
                        <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                            {explain?.summary || (
                                risk_level === 'High'
                                    ? 'CRITICAL: High markers detected. Urgent cardiovascular referral required.'
                                    : risk_level === 'Moderate'
                                        ? 'MODERATE: Elevated risk signatures found. Recommend monitoring BP bi-weekly.'
                                        : 'STABLE: Low cardiovascular risk profile. Continue standard preventative care.'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100/50">
                {loadingExplain ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Computing explainability...
                    </div>
                ) : explain ? (
                    <ExplainabilityChart contributions={explain.contributions} />
                ) : null}
            </div>

            <div className="pt-6 border-t border-slate-100/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={14} />
                        Statistical Risk Trend
                    </h3>
                </div>
                <RiskTrendChart currentRisk={risk_probability} />
            </div>

            <div className="flex items-center gap-2 p-4 rounded-2xl bg-medical-50/50 border border-medical-100">
                <Info size={16} className="text-medical-600 flex-shrink-0" />
                <p className="text-[10px] font-bold text-medical-700 leading-tight">
                    * AI-generated diagnostic report. Validate with a board-certified specialist before clinical decisions.
                </p>
            </div>
        </motion.div>
    );
};

export default RiskResultCard;

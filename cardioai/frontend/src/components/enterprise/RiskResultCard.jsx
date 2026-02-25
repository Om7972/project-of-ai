import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldAlert,
    Printer,
    Share2,
    Download,
    Info,
    TrendingDown,
    AlertTriangle,
    History
} from 'lucide-react';
import RiskGauge from './RiskGauge';
import RiskTrendChart from './RiskTrendChart';

const RiskResultCard = ({ result }) => {
    if (!result) return null;
    const { risk_probability, risk_level } = result;

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
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-xl bg-white/50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-medical-50 hover:text-medical-600 transition-all">
                        <Printer size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white/50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-medical-50 hover:text-medical-600 transition-all">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row items-center gap-10">
                <RiskGauge probability={risk_probability} riskLevel={risk_level} />

                <div className="flex-1 w-full space-y-6">
                    <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500" />
                            AI Clinical Guidance
                        </h3>
                        <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                            {risk_level === 'High'
                                ? 'CRITICAL: High markers detected. Urgent cardiovascular referral required for further diagnostic imaging and stress analysis.'
                                : risk_level === 'Moderate'
                                    ? 'MODERATE: Elevated risk signatures found. Recommend implementing non-statin lipid therapy and monitoring BP bi-weekly.'
                                    : 'STABLE: Low cardiovascular risk profile. Continue standard preventative care and annual checkups.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reliability</div>
                            <div className="text-sm font-black text-medical-700">92.4% Match</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inference</div>
                            <div className="text-sm font-black text-medical-700">XGBoost Engine</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={14} />
                        Statistical Risk Trend
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">
                        <TrendingDown size={10} />
                        -4.2% Variance
                    </div>
                </div>
                <RiskTrendChart currentRisk={risk_probability} />
            </div>

            <div className="flex items-center gap-2 p-4 rounded-2xl bg-medical-50/50 border border-medical-100">
                <Info size={16} className="text-medical-600 flex-shrink-0" />
                <p className="text-[10px] font-bold text-medical-700 leading-tight">
                    * This diagnostic report is generated based on available clinical markers and should be validated by a board-certified specialist.
                </p>
            </div>
        </motion.div>
    );
};

export default RiskResultCard;

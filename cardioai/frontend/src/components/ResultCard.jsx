import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Heart, Share2, Printer } from 'lucide-react';

const ResultCard = ({ result }) => {
    if (!result) return null;

    const { risk_probability, risk_level } = result;

    const getRiskStyles = (level) => {
        switch (level?.toLowerCase()) {
            case 'low':
                return {
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    progress: 'bg-emerald-500',
                    icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
                };
            case 'moderate':
                return {
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    progress: 'bg-amber-500',
                    icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
                };
            case 'high':
                return {
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    progress: 'bg-red-500',
                    icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
                };
            default:
                return {
                    color: 'text-medical-600',
                    bg: 'bg-medical-50',
                    border: 'border-medical-200',
                    progress: 'bg-medical-500',
                    icon: <Heart className="w-8 h-8 text-medical-500" />,
                };
        }
    };

    const styles = getRiskStyles(risk_level);

    return (
        <div className={`medical-card p-8 border-2 ${styles.border} ${styles.bg} animate-slide-up sticky top-24`}>
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Clinical Assessment Result
                    </h2>
                    <h1 className="text-3xl font-black font-display text-slate-800">
                        Cardiac Disease Risk
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-medical-600 transition-colors">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-medical-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-medical flex items-center justify-center">
                    {styles.icon}
                </div>
                <div>
                    <div className={`text-4xl font-black font-display ${styles.color}`}>
                        {risk_probability}%
                    </div>
                    <div className={`risk-badge inline-block mt-1 ${styles.bg} ${styles.color}`}>
                        {risk_level} Risk Level
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                    <span>PROGRESSION</span>
                    <span>{risk_probability}%</span>
                </div>
                <div className="h-4 w-full bg-slate-200/50 rounded-full overflow-hidden p-1 shadow-inner">
                    <div
                        className={`h-full rounded-full ${styles.progress} transition-all duration-1000 ease-out`}
                        style={{ width: `${risk_probability}%` }}
                    />
                </div>
            </div>

            <div className="mt-8 p-6 bg-white/60 rounded-xl border border-white/80">
                <h3 className="text-sm font-extrabold text-slate-700 mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    Clinical Recommendations
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {risk_level?.toLowerCase() === 'high'
                        ? 'Immediate referral to a specialist is advised. Patient exhibits high clinical markers for cardiac event. Pre-operative cardiac clearance required.'
                        : risk_level?.toLowerCase() === 'moderate'
                            ? 'Suggest further stress testing and lipid profile review. Monitor blood pressure levels closely and implement lifestyle modifications.'
                            : 'Patient exhibits low clinical risk. Recommend continued healthy lifestyle and regular annual cardiac checkups.'}
                </p>
            </div>
        </div>
    );
};

export default ResultCard;

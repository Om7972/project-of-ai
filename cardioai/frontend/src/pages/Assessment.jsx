import React, { useState } from 'react';
import axios from 'axios';
import PatientWizardForm from '../components/enterprise/PatientWizardForm';
import RiskResultCard from '../components/enterprise/RiskResultCard';
import {
    Activity,
    ShieldCheck,
    Heart,
    Stethoscope,
    Clock,
    Zap,
    Globe,
    Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Assessment = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async (formData) => {
        setLoading(true);
        setResult(null);
        try {
            const response = await axios.post('http://localhost:8000/api/v1/predictions/predict', formData);
            setResult(response.data);
            toast.success('Clinical analysis synchronized');
        } catch (error) {
            console.error('Prediction error:', error);
            toast.error('Diagnostic error: Connection to model server refused.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Premium Hero Section */}
            <section className="flex flex-col xl:flex-row items-center justify-between gap-16 py-8">
                <div className="max-w-2xl space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-medical-50 border border-medical-100 text-medical-700 text-[11px] font-black uppercase tracking-[0.2em]"
                    >
                        <Zap size={14} className="animate-pulse" />
                        Neural-Powered Cardiovascular Hub
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl xl:text-8xl font-black font-display text-slate-900 leading-[0.9] tracking-tighter"
                    >
                        Predictive <br />
                        <span className="gradient-text">Diagnostics.</span>
                    </motion.h1>

                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                        High-fidelity XGBoost intelligence engine for rapid clinical observation
                        and cardiovascular risk assessment across hospital systems.
                    </p>

                    <div className="flex flex-wrap gap-8 items-center pt-4">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-slate-900">92.4%</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Rate</span>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-slate-900">12ms</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inference Latency</span>
                        </div>
                    </div>
                </div>

                {/* Feature Highlights Overlay */}
                <div className="grid grid-cols-2 gap-4 flex-1 w-full xl:max-w-md">
                    {[
                        { icon: <Database className="text-blue-500" />, label: 'Cloud Sync', desc: 'Secure SQL Storage' },
                        { icon: <Zap className="text-amber-500" />, label: 'Real-time', desc: 'Instant Feedback' },
                        { icon: <ShieldCheck className="text-emerald-500" />, label: 'Reliable', desc: 'Medical Precision' },
                        { icon: <Globe className="text-purple-500" />, label: 'Universal', desc: 'Cross-Device AI' }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="enterprise-card p-6 flex flex-col items-center text-center gap-3 hover:shadow-medical-lg hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                {feature.icon}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 tracking-tight">{feature.label}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Main Workflow Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-7">
                    <div className="mb-8 pl-4 border-l-4 border-medical-500">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Assessment</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Patient Diagnostic Intake</p>
                    </div>
                    <PatientWizardForm onSubmit={handlePredict} loading={loading} />
                </div>

                <div className="lg:col-span-5">
                    {result ? (
                        <RiskResultCard result={result} />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="enterprise-card bg-slate-50/50 border-dashed border-2 border-slate-200 p-12 min-h-[600px] flex flex-col items-center justify-center text-center sticky top-12"
                        >
                            <div className="w-24 h-24 rounded-[2rem] bg-white shadow-medical flex items-center justify-center mb-8 relative">
                                <Activity size={40} className="text-slate-200" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white"
                                >
                                    <Clock size={10} className="text-slate-300" />
                                </motion.div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-300 tracking-tight mb-2">Awaiting Diagnosis</h3>
                            <p className="text-slate-400 font-semibold max-w-xs leading-relaxed">
                                Complete the step-by-step clinical intake form to initialize neural risk processing.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Assessment;

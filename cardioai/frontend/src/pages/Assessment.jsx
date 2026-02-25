import React, { useState } from 'react';
import axios from 'axios';
import PatientForm from '../components/PatientForm';
import ResultCard from '../components/ResultCard';
import RiskChart from '../components/RiskChart';
import { Activity, ShieldCheck, Heart, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Assessment = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async (formData) => {
        setLoading(true);
        setResult(null);
        try {
            const response = await axios.post('http://localhost:8000/predict', formData);
            setResult(response.data);
            toast.success('Assessment generated successfully');
        } catch (error) {
            console.error('Prediction error:', error);
            toast.error('Failed to generate prediction. Please check clinical data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Header Section */}
            <section className="mb-16 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-medical-50 border border-medical-100 text-medical-700 text-xs font-black uppercase tracking-widest">
                        <Stethoscope className="w-4 h-4" />
                        AI Powered Diagnostic Intelligence
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black font-display text-slate-900 leading-[1.1] tracking-tight">
                        Predictive Cardiovascular <br />
                        <span className="medical-gradient-text">Informatics System.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        Utilize advanced XGBoost intelligence to analyze clinical features and
                        determine cardiac disease probability with hospital-grade precision.
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white shadow-medical border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reliability</div>
                                <div className="text-sm font-black text-slate-700">92% Accuracy</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white shadow-medical border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-medical-50 flex items-center justify-center text-medical-600">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response</div>
                                <div className="text-sm font-black text-slate-700">{'<'} 150ms Speed</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block relative">
                    <div className="absolute -inset-4 bg-medical-100/50 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="relative medical-card p-4 shadow-medical-lg">
                        <img
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                            alt="Hospital Tech"
                            className="rounded-xl w-full object-cover aspect-video shadow-inner"
                        />
                    </div>
                </div>
            </section>

            {/* Form and Result Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7">
                    <PatientForm onSubmit={handlePredict} loading={loading} />
                </div>

                <div className="lg:col-span-5 space-y-8">
                    {result ? (
                        <>
                            <ResultCard result={result} />
                            <RiskChart />
                        </>
                    ) : (
                        <div className="medical-card p-12 border-dashed border-2 border-slate-300 bg-slate-50/50 flex flex-col items-center text-center justify-center min-h-[500px] sticky top-24">
                            <div className="w-20 h-20 rounded-3xl bg-white shadow-medical flex items-center justify-center mb-6">
                                <Activity className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400 mb-2">Pending Assessment</h3>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">
                                Complete the clinical intake form on the left to generate the cardiovascular risk profile.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Assessment;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Heart,
    Activity,
    ChevronRight,
    ChevronLeft,
    Info,
    CheckCircle2,
    Stethoscope,
    ClipboardCheck
} from 'lucide-react';

const steps = [
    { id: 1, title: 'Patient Profile', icon: <User size={18} /> },
    { id: 2, title: 'Vital Signatures', icon: <Activity size={18} /> },
    { id: 3, title: 'Clinical Diagnostics', icon: <Heart size={18} /> },
];

const PatientWizardForm = ({ onSubmit, loading }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        patient_name: '', age: '', sex: '1', cp: '1', trestbps: '',
        chol: '', fbs: '0', restecg: '0', thalach: '', exang: '0',
        oldpeak: '', slope: '1', ca: '0', thal: '2',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => currentStep < 3 && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const Tooltip = ({ text }) => (
        <div className="group relative ml-1 inline-block">
            <Info size={14} className="text-slate-300 cursor-help hover:text-medical-500 transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-10 font-bold leading-tight">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
        </div>
    );

    return (
        <div className="enterprise-card p-4 sm:p-8 animate-fade-in max-w-2xl mx-auto w-full">
            {/* Wizard Progress */}
            <div className="flex items-center justify-between mb-12 px-4">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-2 relative">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentStep >= step.id ? 'bg-medical-600 text-white shadow-medical' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {currentStep > step.id ? <CheckCircle2 size={20} /> : step.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest absolute -bottom-6 w-max ${currentStep >= step.id ? 'text-medical-700' : 'text-slate-400'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 rounded-full transition-all duration-300 ${currentStep > step.id ? 'bg-medical-500' : 'bg-slate-100'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="mt-10 overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Stethoscope className="text-medical-600" size={20} />
                                Identity & Demographics
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="medical-input-group">
                                    <label className="medical-label">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="text" name="patient_name" value={formData.patient_name} onChange={handleChange} placeholder="e.g. Dr. Jane Smith" className="medical-input pl-12" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="medical-input-group">
                                        <label className="medical-label">Age (Years) <Tooltip text="Valid clinical range between 18-120." /></label>
                                        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="54" className="medical-input" required />
                                    </div>
                                    <div className="medical-input-group">
                                        <label className="medical-label">Sex</label>
                                        <select name="sex" value={formData.sex} onChange={handleChange} className="medical-input">
                                            <option value="1">Male</option>
                                            <option value="0">Female</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Activity className="text-medical-600" size={20} />
                                Physiological Baseline
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="medical-input-group">
                                    <label className="medical-label">Blood Pressure (mmHg) <Tooltip text="Resting systolic reading (e.g. 120)." /></label>
                                    <input type="number" name="trestbps" value={formData.trestbps} onChange={handleChange} className="medical-input" required />
                                </div>
                                <div className="medical-input-group">
                                    <label className="medical-label">Serum Cholestoral <Tooltip text="Total cholesterol (mg/dL)." /></label>
                                    <input type="number" name="chol" value={formData.chol} onChange={handleChange} className="medical-input" required />
                                </div>
                                <div className="medical-input-group">
                                    <label className="medical-label">Max Heart Rate <Tooltip text="Observed during stress testing." /></label>
                                    <input type="number" name="thalach" value={formData.thalach} onChange={handleChange} className="medical-input" required />
                                </div>
                                <div className="medical-input-group">
                                    <label className="medical-label">ST Depression <Tooltip text="Depression induced by exercise relative to rest." /></label>
                                    <input type="number" step="0.1" name="oldpeak" value={formData.oldpeak} onChange={handleChange} className="medical-input" required />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <ClipboardCheck className="text-medical-600" size={20} />
                                Final Clinical Observation
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="medical-input-group">
                                    <label className="medical-label">Chest Pain Type</label>
                                    <select name="cp" value={formData.cp} onChange={handleChange} className="medical-input">
                                        <option value="1">Typical Angina</option>
                                        <option value="2">Atypical Angina</option>
                                        <option value="3">Non-anginal Pain</option>
                                        <option value="4">Asymptomatic</option>
                                    </select>
                                </div>
                                <div className="medical-input-group">
                                    <label className="medical-label">Thal Testing</label>
                                    <select name="thal" value={formData.thal} onChange={handleChange} className="medical-input">
                                        <option value="3">Normal</option>
                                        <option value="6">Fixed Defect</option>
                                        <option value="7">Reversable Defect</option>
                                    </select>
                                </div>
                                <div className="medical-input-group">
                                    <label className="medical-label">ST Slope</label>
                                    <select name="slope" value={formData.slope} onChange={handleChange} className="medical-input">
                                        <option value="1">Upsloping</option>
                                        <option value="2">Flat</option>
                                        <option value="3">Downsloping</option>
                                    </select>
                                </div>
                                <div className="medical-input-group">
                                    <label className="medical-label">Colored Vessels</label>
                                    <select name="ca" value={formData.ca} onChange={handleChange} className="medical-input">
                                        {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1 || loading}
                        className={`btn-enterprise-outline ${currentStep === 1 ? 'invisible' : ''}`}
                    >
                        <ChevronLeft size={20} />
                        Back
                    </button>

                    {currentStep < 3 ? (
                        <button type="button" onClick={nextStep} className="btn-enterprise">
                            Continue
                            <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="btn-enterprise min-w-[160px]">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Run AI Diagnostics</>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default PatientWizardForm;

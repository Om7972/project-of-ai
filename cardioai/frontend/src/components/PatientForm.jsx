import React, { useState } from 'react';
import { User, ClipboardList, Info, Loader2 } from 'lucide-react';

const PatientForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        patient_name: '',
        age: '',
        sex: '1',
        cp: '2',
        trestbps: '',
        chol: '',
        fbs: '0',
        restecg: '0',
        thalach: '',
        exang: '0',
        oldpeak: '',
        slope: '1',
        ca: '0',
        thal: '2',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.patient_name) newErrors.patient_name = 'Required';
        if (!formData.age || formData.age < 0 || formData.age > 120) newErrors.age = 'Invalid age';
        if (!formData.trestbps) newErrors.trestbps = 'Required';
        if (!formData.chol) newErrors.chol = 'Required';
        if (!formData.thalach) newErrors.thalach = 'Required';
        if (!formData.oldpeak) newErrors.oldpeak = 'Required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="medical-card p-8 space-y-8 animate-fade-in">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <ClipboardList className="w-5 h-5 text-medical-600" />
                <h2 className="text-lg font-bold text-slate-800">Clinical Intake Form</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Name */}
                <div className="col-span-full">
                    <label className="medical-label">Patient Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            name="patient_name"
                            placeholder="e.g. John Doe"
                            className={`medical-input pl-10 ${errors.patient_name ? 'border-red-500' : ''}`}
                            value={formData.patient_name}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.patient_name && <p className="text-red-500 text-xs mt-1">{errors.patient_name}</p>}
                </div>

                {/* Age & Sex */}
                <div>
                    <label className="medical-label">Age (years)</label>
                    <input
                        type="number"
                        name="age"
                        placeholder="29-77"
                        className={`medical-input ${errors.age ? 'border-red-500' : ''}`}
                        value={formData.age}
                        onChange={handleChange}
                    />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>

                <div>
                    <label className="medical-label">Biological Sex</label>
                    <select
                        name="sex"
                        className="medical-input"
                        value={formData.sex}
                        onChange={handleChange}
                    >
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                    </select>
                </div>

                {/* CP & TRESTBPS */}
                <div>
                    <label className="medical-label flex items-center gap-1.5">
                        Chest Pain Type
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </label>
                    <select
                        name="cp"
                        className="medical-input"
                        value={formData.cp}
                        onChange={handleChange}
                    >
                        <option value="0">Typical Angina</option>
                        <option value="1">Atypical Angina</option>
                        <option value="2">Non-anginal Pain</option>
                        <option value="3">Asymptomatic</option>
                    </select>
                </div>

                <div>
                    <label className="medical-label">Resting Blood Pressure (mmHg)</label>
                    <input
                        type="number"
                        name="trestbps"
                        placeholder="94-200"
                        className={`medical-input ${errors.trestbps ? 'border-red-500' : ''}`}
                        value={formData.trestbps}
                        onChange={handleChange}
                    />
                    {errors.trestbps && <p className="text-red-500 text-xs mt-1">{errors.trestbps}</p>}
                </div>

                {/* CHOL & FBS */}
                <div>
                    <label className="medical-label">Cholesterol (mg/dl)</label>
                    <input
                        type="number"
                        name="chol"
                        placeholder="126-564"
                        className={`medical-input ${errors.chol ? 'border-red-500' : ''}`}
                        value={formData.chol}
                        onChange={handleChange}
                    />
                    {errors.chol && <p className="text-red-500 text-xs mt-1">{errors.chol}</p>}
                </div>

                <div>
                    <label className="medical-label">Fasting Blood Sugar {'>'} 120 mg/dl</label>
                    <select
                        name="fbs"
                        className="medical-input"
                        value={formData.fbs}
                        onChange={handleChange}
                    >
                        <option value="0">False</option>
                        <option value="1">True</option>
                    </select>
                </div>

                {/* RESTECG & THALACH */}
                <div>
                    <label className="medical-label">Resting ECG Results</label>
                    <select
                        name="restecg"
                        className="medical-input"
                        value={formData.restecg}
                        onChange={handleChange}
                    >
                        <option value="0">Normal</option>
                        <option value="1">ST-T Wave Abnormality</option>
                        <option value="2">Left Ventricular Hypertrophy</option>
                    </select>
                </div>

                <div>
                    <label className="medical-label">Max Heart Rate (bpm)</label>
                    <input
                        type="number"
                        name="thalach"
                        placeholder="71-202"
                        className={`medical-input ${errors.thalach ? 'border-red-500' : ''}`}
                        value={formData.thalach}
                        onChange={handleChange}
                    />
                    {errors.thalach && <p className="text-red-500 text-xs mt-1">{errors.thalach}</p>}
                </div>

                {/* EXANG & OLDPEAK */}
                <div>
                    <label className="medical-label">Exercise Induced Angina</label>
                    <select
                        name="exang"
                        className="medical-input"
                        value={formData.exang}
                        onChange={handleChange}
                    >
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                </div>

                <div>
                    <label className="medical-label">ST Depression (Oldpeak)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="oldpeak"
                        placeholder="0.0-6.2"
                        className={`medical-input ${errors.oldpeak ? 'border-red-500' : ''}`}
                        value={formData.oldpeak}
                        onChange={handleChange}
                    />
                    {errors.oldpeak && <p className="text-red-500 text-xs mt-1">{errors.oldpeak}</p>}
                </div>

                {/* SLOPE & CA */}
                <div>
                    <label className="medical-label">Slope of Peak ST</label>
                    <select
                        name="slope"
                        className="medical-input"
                        value={formData.slope}
                        onChange={handleChange}
                    >
                        <option value="0">Upsloping</option>
                        <option value="1">Flat</option>
                        <option value="2">Downsloping</option>
                    </select>
                </div>

                <div>
                    <label className="medical-label">Major Vessels (0-4)</label>
                    <select
                        name="ca"
                        className="medical-input"
                        value={formData.ca}
                        onChange={handleChange}
                    >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                </div>

                {/* THAL */}
                <div>
                    <label className="medical-label">Thalassemia (Thal)</label>
                    <select
                        name="thal"
                        className="medical-input"
                        value={formData.thal}
                        onChange={handleChange}
                    >
                        <option value="0">Normal</option>
                        <option value="1">Fixed Defect</option>
                        <option value="2">Reversable Defect</option>
                    </select>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-medical w-full flex items-center justify-center gap-3 py-4 text-base font-bold"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            Generate Risk Assessment
                            <Activity className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default PatientForm;

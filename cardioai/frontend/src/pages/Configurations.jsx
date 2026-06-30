import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { Settings, Grid, ToggleLeft, ToggleRight, Palette, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { batchApi } from '../services/api';

const Configurations = () => {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);

    const { data: preferences, isLoading } = useQuery({
        queryKey: ['preferences'],
        queryFn: () => authApi.getPreferences().then((r) => r.data),
    });

    const updateMutation = useMutation({
        mutationFn: (data) => authApi.updatePreferences(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] });
            toast.success('Preferences saved');
        },
        onError: () => toast.error('Failed to save preferences'),
    });

    const togglePref = (key) => {
        if (!preferences) return;
        updateMutation.mutate({ [key]: !preferences[key] });
    };

    const handleBatchUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await batchApi.upload(file);
            toast.success(`Batch complete: ${res.data.processed_rows}/${res.data.total_rows} processed`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Batch upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    if (isLoading) return <div className="p-12 text-center text-slate-400">Loading preferences...</div>;

    const prefs = preferences || {};

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-black font-display text-slate-900 flex items-center gap-3">
                    <Grid className="text-medical-600" /> User Configurations
                </h1>
                <p className="text-slate-500 font-medium">Personalize your CardioAI workspace — synced to cloud.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="enterprise-card p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Palette size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Visual Preferences</h2>
                    </div>
                    {[
                        { key: 'darkMode', label: 'Dark Mode', desc: 'High-contrast dark theme' },
                        { key: 'highContrast', label: 'High Contrast', desc: 'Enhanced accessibility' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{label}</h4>
                                <p className="text-xs text-slate-500">{desc}</p>
                            </div>
                            <button onClick={() => togglePref(key === 'darkMode' ? 'dark_mode' : 'high_contrast')} className="text-medical-600">
                                {prefs[key === 'darkMode' ? 'dark_mode' : 'high_contrast']
                                    ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="enterprise-card p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Clinical Workflow</h2>
                    </div>
                    {[
                        { key: 'notifications', label: 'Push Notifications' },
                        { key: 'auto_save', label: 'Auto-Save Assessments' },
                        { key: 'email_reports', label: 'Email Reports' },
                    ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 text-sm">{label}</h4>
                            <button onClick={() => togglePref(key)} className="text-medical-600">
                                {prefs[key] ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="enterprise-card p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-medical-600" /> Batch Screening (CSV)
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                    Upload CSV with columns: patient_name, age, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active
                </p>
                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-medical-600 text-white font-black text-sm cursor-pointer hover:bg-medical-700">
                    <Upload size={16} />
                    {uploading ? 'Processing...' : 'Upload CSV'}
                    <input type="file" accept=".csv" className="hidden" onChange={handleBatchUpload} disabled={uploading} />
                </label>
            </div>
        </div>
    );
};

export default Configurations;

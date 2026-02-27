import React, { useState } from 'react';
import { Settings, Globe, Bell, Grid, ToggleLeft, ToggleRight, LayoutTemplate, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const Configurations = () => {
    const [preferences, setPreferences] = useState({
        notifications: true,
        darkMode: false,
        autoSave: true,
        highContrast: false,
        emailReports: true
    });

    const togglePref = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success(`${key} configuration updated.`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black font-display text-slate-900 flex items-center gap-3">
                    <Grid className="text-medical-600" /> User Configurations
                </h1>
                <p className="text-slate-500 font-medium">Personalize your CardioAI workspace and visual preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Settings */}
                <div className="enterprise-card p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Palette size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Visual Preferences</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Dark Mode</h4>
                                <p className="text-xs text-slate-500">Enable high-contrast dark theme</p>
                            </div>
                            <button onClick={() => togglePref('darkMode')} className="text-medical-600 hover:scale-110 transition-transform">
                                {preferences.darkMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">High Contrast Charts</h4>
                                <p className="text-xs text-slate-500">Improve visibility for analytics</p>
                            </div>
                            <button onClick={() => togglePref('highContrast')} className="text-medical-600 hover:scale-110 transition-transform">
                                {preferences.highContrast ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Automation & Alerts */}
                <div className="enterprise-card p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                            <Bell size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Automations & Alerts</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Real-time Notifications</h4>
                                <p className="text-xs text-slate-500">Push alerts for high-risk patients</p>
                            </div>
                            <button onClick={() => togglePref('notifications')} className="text-medical-600 hover:scale-110 transition-transform">
                                {preferences.notifications ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Auto-Save Assessments</h4>
                                <p className="text-xs text-slate-500">Save clinical drafts automatically</p>
                            </div>
                            <button onClick={() => togglePref('autoSave')} className="text-medical-600 hover:scale-110 transition-transform">
                                {preferences.autoSave ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Weekly Summary Emails</h4>
                                <p className="text-xs text-slate-500">Receive statistics reports</p>
                            </div>
                            <button onClick={() => togglePref('emailReports')} className="text-medical-600 hover:scale-110 transition-transform">
                                {preferences.emailReports ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configurations;

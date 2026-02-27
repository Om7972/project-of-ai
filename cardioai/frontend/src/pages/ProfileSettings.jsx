import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Key, Camera, Save, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Clinical profile updated successfully.');
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-display text-slate-900">Profile Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your personal clinical information and preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <div className="enterprise-card p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-medical-50 flex items-center justify-center border-4 border-white shadow-medical-lg overflow-hidden transition-transform group-hover:scale-105">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Doctor'}`} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-slate-900 border-4 border-white rounded-xl flex flex-col items-center justify-center text-white shadow-xl hover:bg-medical-600 transition-colors">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{user?.name || 'Dr. Guest User'}</h3>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-medical-50 text-medical-600">
                            {user?.role === 'admin' ? <Shield size={12} /> : <Activity size={12} />}
                            {user?.role || 'Senior Physician'}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:col-span-2 enterprise-card p-8 space-y-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="medical-input-group">
                                <label className="medical-label">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" defaultValue={user?.name || 'Dr. Guest User'} className="medical-input pl-12" required />
                                </div>
                            </div>
                            <div className="medical-input-group">
                                <label className="medical-label">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="email" defaultValue={user?.email || 'doctor@hospital.com'} className="medical-input pl-12" disabled />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Email cannot be changed</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h4 className="font-bold text-slate-800 mb-4">Security</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="medical-input-group">
                                    <label className="medical-label">New Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="password" placeholder="••••••••" className="medical-input pl-12" />
                                    </div>
                                </div>
                                <div className="medical-input-group">
                                    <label className="medical-label">Confirm Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="password" placeholder="••••••••" className="medical-input pl-12" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button type="submit" disabled={isSaving} className="btn-enterprise">
                                {isSaving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                                    </div>
                                ) : (
                                    <>
                                        <Save size={18} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;

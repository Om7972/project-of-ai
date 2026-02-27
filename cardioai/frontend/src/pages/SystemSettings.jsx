import React from 'react';
import { Database, ShieldAlert, Cpu, Network, Server, HardDrive, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SystemSettings = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-fade-in">
                <div className="w-24 h-24 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center">
                    <ShieldAlert size={48} />
                </div>
                <div>
                    <h2 className="text-2xl font-black font-display text-slate-900">Access Restricted</h2>
                    <p className="text-slate-500 font-medium max-w-md mx-auto mt-2">
                        System configuration requires Cardiology Administrator privileges. Contact IT support for assistance.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black font-display text-slate-900 flex items-center gap-3">
                    <Database className="text-medical-600" /> Infrastructure Platform
                </h1>
                <p className="text-slate-500 font-medium tracking-tight">Enterprise IT management, API integrations, and cluster health.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cluster Status */}
                <div className="enterprise-card p-6 bg-slate-900 text-white lg:col-span-1 border-none shadow-xl">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                        <Server className="text-emerald-400" size={24} />
                        <div>
                            <h2 className="text-lg font-bold">Node Status</h2>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">us-east-cluster-01</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-bold font-mono">
                                <span className="text-slate-400">Memory (RAM)</span>
                                <span className="text-emerald-400">32%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 w-[32%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-bold font-mono">
                                <span className="text-slate-400">Inference Core (CPU)</span>
                                <span className="text-purple-400">14%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-400 w-[14%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-bold font-mono">
                                <span className="text-slate-400">Database Storage</span>
                                <span className="text-medical-400">78%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-medical-500 w-[78%]" />
                            </div>
                            <p className="text-xs text-medical-300 mt-2">Nearing capacity threshold.</p>
                        </div>
                    </div>
                </div>

                {/* Integration settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="enterprise-card p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Network size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Epic EHR Integration</h2>
                                <p className="text-xs text-slate-500">HL7 FHIR continuous sync parameters</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="medical-input-group">
                                <label className="medical-label">FHIR Base URL</label>
                                <input type="text" defaultValue="https://ehr.hospital.local/fhir/r4" className="medical-input" disabled />
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="btn-enterprise flex-1 opacity-50 cursor-not-allowed">
                                    <KeyRound size={16} /> Update Client Secret
                                </button>
                                <button className="btn-secondary flex-1">
                                    Test Connection
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="enterprise-card p-6 border-l-4 border-l-emerald-500">
                            <Cpu className="text-emerald-500 mb-4" size={28} />
                            <h3 className="font-bold text-slate-800">ML Pipeline v1.0.0</h3>
                            <p className="text-xs text-slate-500 mt-1">XGBoost clinical model loaded in memory.</p>
                            <button className="text-xs font-bold text-medical-600 mt-4 uppercase tracking-wider hover:underline">Force Reload</button>
                        </div>
                        <div className="enterprise-card p-6 border-l-4 border-l-amber-500">
                            <HardDrive className="text-amber-500 mb-4" size={28} />
                            <h3 className="font-bold text-slate-800">PostgreSQL Store</h3>
                            <p className="text-xs text-slate-500 mt-1">Data snapshot last taken 4 hours ago.</p>
                            <button className="text-xs font-bold text-medical-600 mt-4 uppercase tracking-wider hover:underline">Trigger Backup</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;

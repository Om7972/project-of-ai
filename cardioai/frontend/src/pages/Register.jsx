import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password);
            toast.success('Account requisition submitted successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Registration failed: Email may already be in system');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-medical-600 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

                <div className="enterprise-card p-10 bg-white">
                    <div className="mb-8 items-center text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-medical-600 mb-4">
                            <Shield size={24} />
                        </div>
                        <h1 className="text-2xl font-black font-display text-slate-900">Clinical Registration</h1>
                        <p className="text-sm font-semibold text-slate-400 mt-1">Request new credentials for the CardioAI Suite</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="medical-input-group">
                                <label className="medical-label">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Dr. Robert Miller"
                                        className="medical-input pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="medical-input-group">
                                <label className="medical-label">Institutional Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="office@hospital.com"
                                        className="medical-input pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="medical-input-group">
                                <label className="medical-label">System Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Min. 8 characters"
                                        className="medical-input pl-12"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-enterprise w-full h-14"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    Submit Request
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-xs font-bold text-slate-400 text-center leading-relaxed">
                        By submitting, you agree to our <span className="text-medical-600">Clinical Data Protection Policy</span> and institutional security guidelines.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

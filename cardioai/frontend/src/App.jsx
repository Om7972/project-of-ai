import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Sidebar from './components/enterprise/Sidebar';
import Assessment from './pages/Assessment';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import TriagePage from './pages/TriagePage';
import PatientProfilePage from './pages/PatientProfilePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSettings from './pages/ProfileSettings';
import Configurations from './pages/Configurations';
import HelpSupport from './pages/HelpSupport';
import SystemSettings from './pages/SystemSettings';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Menu, Search, LogOut, Settings, User as UserIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { predictApi } from './services/api';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await predictApi.search(q);
            setSearchResults(res.data);
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-500 hover:text-medical-600"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative hidden sm:block">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                {searching ? <Loader2 size={16} className="text-slate-400 animate-spin" /> : <Search size={16} className="text-slate-400" />}
                                <input
                                    type="text"
                                    placeholder="Search patient name or UID..."
                                    className="bg-transparent border-none outline-none text-sm font-semibold text-slate-600 placeholder:text-slate-400 w-48 lg:w-64"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 max-h-64 overflow-y-auto">
                                    {searchResults.map((p) => (
                                        <button
                                            key={p.patient_uid}
                                            onClick={() => { navigate(`/patients/${p.patient_uid}`); setSearchResults([]); setSearchQuery(''); }}
                                            className="w-full text-left px-4 py-2 rounded-xl hover:bg-slate-50 text-sm"
                                        >
                                            <span className="font-bold text-slate-800">{p.patient_name}</span>
                                            <span className="text-slate-400 ml-2">{p.latest_risk_level || 'N/A'}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-black text-slate-900 leading-none">{user?.name || 'Dr. Guest User'}</span>
                            <span className="text-[10px] font-black text-medical-600 uppercase tracking-widest mt-1">{user?.role || 'doctor'}</span>
                        </div>
                        <div className="relative group">
                            <button className="w-10 h-10 rounded-xl bg-medical-100 flex items-center justify-center text-medical-600 shadow-sm overflow-hidden border-2 border-white cursor-pointer transition-transform hover:scale-105">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Doctor'}`} alt="avatar" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <Link to="/profile" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                                    <UserIcon size={16} /> Profile Settings
                                </Link>
                                <Link to="/configurations" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                                    <Settings size={16} /> Configurations
                                </Link>
                                <div className="h-px bg-slate-50 my-2" />
                                <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-black text-red-600 hover:bg-red-50">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 lg:p-10">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1600px] mx-auto">
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

const App = () => (
    <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Layout><Assessment /></Layout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><Layout><HistoryPage /></Layout></ProtectedRoute>} />
            <Route path="/triage" element={<ProtectedRoute><Layout><TriagePage /></Layout></ProtectedRoute>} />
            <Route path="/patients/:patientUid" element={<ProtectedRoute><Layout><PatientProfilePage /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><ProfileSettings /></Layout></ProtectedRoute>} />
            <Route path="/configurations" element={<ProtectedRoute><Layout><Configurations /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute adminOnly><Layout><SystemSettings /></Layout></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Layout><HelpSupport /></Layout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AuthProvider>
);

export default App;

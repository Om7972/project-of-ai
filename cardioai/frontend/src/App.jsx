import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/enterprise/Sidebar';
import Assessment from './pages/Assessment';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { Menu, Search, Bell, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-500 hover:text-medical-600"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search patient UID..."
                                className="bg-transparent border-none outline-none text-sm font-semibold text-slate-600 placeholder:text-slate-400 w-48 lg:w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-black text-slate-900 leading-none">
                                {user?.name || 'Dr. Guest User'}
                            </span>
                            <span className="text-[10px] font-black text-medical-600 uppercase tracking-widest mt-1">
                                {user?.role || 'Senior Physician'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* User Dropdown / Profile */}
                            <div className="relative group">
                                <button className="w-10 h-10 rounded-xl bg-medical-100 flex items-center justify-center text-medical-600 shadow-sm overflow-hidden border-2 border-white cursor-pointer transition-transform hover:scale-105">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Doctor'}`} alt="avatar" />
                                </button>

                                {/* Popover Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                                        <UserIcon size={16} /> Profile Settings
                                    </button>
                                    <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                                        <Settings size={16} /> Configurations
                                    </button>
                                    <div className="h-px bg-slate-50 my-2" />
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-black text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 lg:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-[1600px] mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Clinical Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Assessment />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AdminDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
};

export default App;

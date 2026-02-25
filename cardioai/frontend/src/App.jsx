import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/enterprise/Sidebar';
import Assessment from './pages/Assessment';
import AdminDashboard from './pages/AdminDashboard';
import { Menu, Search, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

const App = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
                                placeholder="Search medical records..."
                                className="bg-transparent border-none outline-none text-sm font-semibold text-slate-600 placeholder:text-slate-400 w-48 lg:w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-black text-slate-900 leading-none">Dr. Alexander Miller</span>
                            <span className="text-[10px] font-black text-medical-600 uppercase tracking-widest mt-1">Chief of Cardiology</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="relative w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-medical-600 transition-all">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-medical-100 flex items-center justify-center text-medical-600 shadow-sm overflow-hidden border-2 border-white">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
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
                        <Routes>
                            <Route path="/" element={<Assessment />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Routes>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Assessment from './pages/Assessment';
import AdminDashboard from './pages/AdminDashboard';
import { Activity } from 'lucide-react';

const App = () => {
    return (
        <div className="min-h-screen bg-hospital-soft">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <Routes>
                    <Route path="/" element={<Assessment />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12 px-6 mt-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-medical-600" />
                        <span className="font-black text-slate-800 tracking-tight">CardioAI</span>
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        Cardiology Intelligence Division © 2026
                    </div>
                    <div className="flex gap-6 text-sm font-bold text-slate-600">
                        <a href="#" className="hover:text-medical-600">Privacy</a>
                        <a href="#" className="hover:text-medical-600">Terms</a>
                        <a href="#" className="hover:text-medical-600">Security</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;

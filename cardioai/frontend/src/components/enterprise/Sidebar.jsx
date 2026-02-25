import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Activity,
    LayoutDashboard,
    Stethoscope,
    Users,
    Settings,
    HelpCircle,
    Menu,
    X,
    ShieldCheck,
    Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { icon: <Stethoscope size={20} />, label: 'Risk Assessment', path: '/' },
        { icon: <LayoutDashboard size={20} />, label: 'Admin Analytics', path: '/admin' },
        { icon: <Users size={20} />, label: 'Patients List', path: '/patients' },
    ];

    const bottomItems = [
        { icon: <HelpCircle size={20} />, label: 'Help & Support', path: '/support' },
        { icon: <Settings size={20} />, label: 'System Settings', path: '/settings' },
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-100 z-50 flex flex-col p-6 shadow-xl lg:sticky"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-medical-600 flex items-center justify-center text-white shadow-medical">
                                    <Activity size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold font-display tracking-tight text-slate-900">CardioAI</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Enterprise Hub</span>
                                </div>
                            </div>
                            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <nav className="flex-1 space-y-2">
                            <div className="px-3 mb-4">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Main Diagnostic</span>
                            </div>
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${isActive ? 'nav-link-active' : 'nav-link-inactive'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="space-y-2 pt-6 border-t border-slate-50">
                            {bottomItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                                >
                                    {item.icon}
                                    {item.label}
                                </NavLink>
                            ))}

                            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">System Status</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-slate-500 tracking-tight">Cloud Secure Active</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;

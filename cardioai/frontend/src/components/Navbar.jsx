import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Shield, Phone, User, LayoutDashboard, Stethoscope } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-medical-600 flex items-center justify-center text-white shadow-medical">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold font-display text-medical-800 leading-tight tracking-tight">
                        CardioAI
                    </h1>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        Hospital System
                    </p>
                </div>
            </NavLink>

            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center gap-2 transition-colors ${isActive ? 'text-medical-600' : 'hover:text-medical-600'}`
                    }
                >
                    <Stethoscope className="w-4 h-4" />
                    Assessment
                </NavLink>
                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        `flex items-center gap-2 transition-colors ${isActive ? 'text-medical-600' : 'hover:text-medical-600'}`
                    }
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </NavLink>
            </div>

            <div className="flex items-center gap-3">
                <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 transition-colors">
                    <Phone className="w-4 h-4" />
                    Emergency
                </button>
                <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                    <User className="w-4 h-4" />
                    Dr. Miller
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

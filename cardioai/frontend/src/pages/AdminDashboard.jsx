import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Users,
    AlertCircle,
    CheckCircle2,
    Activity,
    Search,
    ArrowUpDown,
    Filter,
    Download,
    Calendar,
    Clock
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get('http://localhost:8000/patients');
                setPatients(response.data);
            } catch (error) {
                console.error('Error fetching patients:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    // Summary Stats
    const stats = useMemo(() => {
        const total = patients.length;
        const high = patients.filter(p => p.risk_level === 'High').length;
        const moderate = patients.filter(p => p.risk_level === 'Moderate').length;
        const low = patients.filter(p => p.risk_level === 'Low').length;
        return [
            { label: 'Total Patients', value: total, icon: <Users className="w-5 h-5" />, color: 'text-medical-600', bg: 'bg-medical-50' },
            { label: 'High Risk', value: high, icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Moderate Risk', value: moderate, icon: <Activity className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Low Risk', value: low, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ];
    }, [patients]);

    // Chart Data
    const chartData = useMemo(() => [
        { name: 'High Risk', value: patients.filter(p => p.risk_level === 'High').length, color: '#ef4444' },
        { name: 'Moderate Risk', value: patients.filter(p => p.risk_level === 'Moderate').length, color: '#f59e0b' },
        { name: 'Low Risk', value: patients.filter(p => p.risk_level === 'Low').length, color: '#10b981' },
    ].filter(d => d.value > 0), [patients]);

    // Filter & Sort
    const filteredPatients = useMemo(() => {
        return patients
            .filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.risk_level.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
    }, [patients, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="w-12 h-12 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-display text-slate-900">Patient Analytics</h1>
                    <p className="text-slate-500 font-medium">Monitoring cardiovascular risks across the hospital system.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-medical flex items-center gap-2 px-4">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="medical-card p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</div>
                            <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table Section */}
                <div className="lg:col-span-2 medical-card overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search patients or risk level..."
                                className="medical-input pl-10 h-10 py-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-500">Filters</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => requestSort('name')}>
                                        <div className="flex items-center gap-2">Patient <ArrowUpDown className="w-3 h-3" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => requestSort('risk_level')}>
                                        <div className="flex items-center gap-2">Risk <ArrowUpDown className="w-3 h-3" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => requestSort('created_at')}>
                                        <div className="flex items-center gap-2">Timestamp <ArrowUpDown className="w-3 h-3" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPatients.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{p.name}</div>
                                            <div className="text-xs text-slate-400 font-medium">Case #{p.id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            Age: {p.age} · {p.sex === 1 ? 'Male' : 'Female'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`risk-badge ${p.risk_level === 'High' ? 'bg-red-50 text-red-600' :
                                                    p.risk_level === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {p.risk_level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(p.created_at), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(p.created_at), 'HH:mm')}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredPatients.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-200" />
                            </div>
                            <h3 className="text-slate-400 font-bold">No records found</h3>
                        </div>
                    )}
                </div>

                {/* Chart Section */}
                <div className="space-y-8">
                    <div className="medical-card p-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 font-display">Risk Distribution</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="medical-card p-6 bg-medical-600 text-white shadow-medical-lg">
                        <h3 className="font-display font-bold text-lg mb-2">System Health</h3>
                        <p className="text-sm text-medical-50 font-medium mb-4">All diagnostics services are operational. Model accuracy verified at 92.4%.</p>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-medical-100">Synchronized</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

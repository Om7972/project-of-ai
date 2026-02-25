import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { BarChart3 } from 'lucide-react';

const mockFeatureImportance = [
    { name: 'Thal', value: 85, color: '#0077b6' },
    { name: 'Major Vessels', value: 78, color: '#00b4d8' },
    { name: 'ST Depression', value: 65, color: '#48cae4' },
    { name: 'Chest Pain', value: 58, color: '#90e0ef' },
    { name: 'Slope', value: 42, color: '#ade8f4' },
    { name: 'Max HR', value: 38, color: '#caf0f8' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-black text-medical-700">Weight: {payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

const RiskChart = () => {
    return (
        <div className="medical-card p-8 animate-fade-in delay-200 mt-8">
            <div className="flex items-center gap-2 mb-8">
                <BarChart3 className="w-5 h-5 text-medical-600" />
                <h2 className="text-lg font-bold text-slate-800">Feature Weights Breakdown</h2>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={mockFeatureImportance}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        barSize={24}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                            width={100}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fbff' }} />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                            {mockFeatureImportance.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-xs text-slate-500 font-medium">
                * Feature weights represent the influence of specific clinical markers on the model's prediction result for this assessment.
            </div>
        </div>
    );
};

export default RiskChart;

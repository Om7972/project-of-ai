import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const mockTrendData = [
    { date: 'Oct 2025', risk: 12 },
    { date: 'Nov 2025', risk: 15 },
    { date: 'Dec 2025', risk: 10 },
    { date: 'Jan 2026', risk: 22 },
    { date: 'Feb 2026', risk: 18 },
    { date: 'Initial', risk: 25 }, // Current point
];

const RiskTrendChart = ({ currentRisk }) => {
    // Add actual current risk to the trend if it's the latest
    const data = [...mockTrendData.slice(0, 5), { date: 'Current', risk: currentRisk }];

    return (
        <div className="h-48 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#0ea5e9' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="risk"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRisk)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RiskTrendChart;

import React from 'react';
import { motion } from 'framer-motion';

const RiskGauge = ({ probability, riskLevel }) => {
    const normalizedValue = Math.min(Math.max(probability, 0), 100);
    const strokeWidth = 14;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (normalizedValue / 100) * circumference;

    const getColor = () => {
        if (riskLevel === 'High') return '#ef4444';
        if (riskLevel === 'Moderate') return '#f59e0b';
        return '#10b981';
    };

    const getBgColor = () => {
        if (riskLevel === 'High') return 'rgba(239, 68, 68, 0.1)';
        if (riskLevel === 'Moderate') return 'rgba(245, 158, 11, 0.1)';
        return 'rgba(16, 185, 129, 0.1)';
    };

    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="transform -rotate-90 w-full h-full">
                {/* Background Track */}
                <circle
                    cx="96"
                    cy="96"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-100"
                />
                {/* Active Progress */}
                <motion.circle
                    cx="96"
                    cy="96"
                    r={radius}
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                />
            </svg>

            {/* Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black font-display text-slate-900"
                >
                    {probability.toFixed(0)}
                    <span className="text-xl text-slate-400 font-bold">%</span>
                </motion.span>
                <div
                    className="mt-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                    style={{ backgroundColor: getBgColor(), color: getColor() }}
                >
                    {riskLevel}
                </div>
            </div>
        </div>
    );
};

export default RiskGauge;

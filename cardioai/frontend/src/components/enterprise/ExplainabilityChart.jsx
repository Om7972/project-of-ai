import React from 'react';
import { motion } from 'framer-motion';

const ExplainabilityChart = ({ contributions = [] }) => {
    if (!contributions.length) return null;

    const top = contributions.slice(0, 8);

    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                SHAP Feature Contributions
            </h3>
            {top.map((item, i) => (
                <motion.div
                    key={item.feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="space-y-1"
                >
                    <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-700">{item.label}</span>
                        <span className={`font-black ${item.direction === 'increases_risk' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {item.contribution}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${item.direction === 'increases_risk' ? 'bg-red-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(item.contribution, 100)}%` }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ExplainabilityChart;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { predictApi } from '../services/api';
import RiskTrendChart from '../components/enterprise/RiskTrendChart';
import { ArrowLeft, User, Activity, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const PatientProfilePage = () => {
    const { patientUid } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['patient-timeline', patientUid],
        queryFn: () => predictApi.timeline(patientUid).then((r) => r.data),
        enabled: !!patientUid,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-medical-600" size={32} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="enterprise-card p-12 text-center">
                <p className="text-slate-500 font-bold">Patient not found</p>
                <Link to="/history" className="text-medical-600 font-bold text-sm mt-4 inline-block">Back to History</Link>
            </div>
        );
    }

    const latestRisk = data.assessments.length ? data.assessments[data.assessments.length - 1].risk_probability : 0;

    return (
        <div className="space-y-8">
            <Link to="/history" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-medical-600">
                <ArrowLeft size={16} /> Back to History
            </Link>

            <div className="enterprise-card p-8">
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-medical-100 flex items-center justify-center text-medical-600">
                        <User size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">{data.patient_name}</h1>
                        <p className="text-slate-500 font-bold mt-1">
                            Age {data.age} · {data.gender === 1 ? 'Female' : 'Male'} · UID {data.patient_uid}
                        </p>
                        {data.risk_trend !== null && (
                            <p className={`text-sm font-black mt-2 ${data.risk_trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                Risk trend: {data.risk_trend > 0 ? '+' : ''}{data.risk_trend}% since last visit
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="enterprise-card p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-medical-600" /> Risk Timeline
                    </h2>
                    <RiskTrendChart currentRisk={latestRisk} />
                </div>

                <div className="enterprise-card p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-4">Assessment History</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {[...data.assessments].reverse().map((a) => (
                            <div key={a.prediction_id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div>
                                    <p className="text-sm font-black text-slate-800">{a.risk_level} Risk</p>
                                    <p className="text-xs text-slate-400">{format(new Date(a.created_at), 'MMM d, yyyy HH:mm')}</p>
                                </div>
                                <span className="text-lg font-black text-medical-700">{a.risk_probability.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfilePage;

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { triageApi, getWsUrl } from '../services/api';
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const TriagePage = () => {
    const [filter, setFilter] = useState('pending');
    const queryClient = useQueryClient();

    const { data: cases = [], isLoading, refetch } = useQuery({
        queryKey: ['triage', filter],
        queryFn: () => triageApi.list(filter).then((r) => r.data),
        refetchInterval: 30000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status }) => triageApi.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['triage'] });
            toast.success('Triage case updated');
        },
    });

    useEffect(() => {
        let ws;
        try {
            ws = new WebSocket(getWsUrl());
            ws.onmessage = () => refetch();
        } catch {
            /* WebSocket optional */
        }
        return () => ws?.close();
    }, [refetch]);

    const riskColor = (level) => {
        if (level === 'High') return 'text-red-600 bg-red-50 border-red-100';
        if (level === 'Moderate') return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Stethoscope className="text-medical-600" /> Triage Queue
                    </h1>
                    <p className="text-slate-500 font-medium">Real-time high-risk case management</p>
                </div>
                <button onClick={() => refetch()} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="flex gap-2">
                {['pending', 'reviewed', 'escalated'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                            filter === s ? 'bg-medical-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="enterprise-card p-12 text-center text-slate-400">Loading triage cases...</div>
            ) : cases.length === 0 ? (
                <div className="enterprise-card p-12 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
                    <p className="font-bold text-slate-500">No {filter} cases</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cases.map((c) => (
                        <div key={c.id} className="enterprise-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${riskColor(c.risk_level)}`}>
                                    <AlertCircle size={22} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900">{c.patient_name}</h3>
                                    <p className="text-xs text-slate-400 font-bold">
                                        {c.risk_probability.toFixed(1)}% · {format(new Date(c.created_at), 'MMM d HH:mm')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${riskColor(c.risk_level)}`}>
                                    {c.risk_level}
                                </span>
                                {filter === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => updateMutation.mutate({ id: c.id, status: 'reviewed' })}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black"
                                        >
                                            Mark Reviewed
                                        </button>
                                        <button
                                            onClick={() => updateMutation.mutate({ id: c.id, status: 'escalated' })}
                                            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black"
                                        >
                                            Escalate
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TriagePage;

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, FileText, ExternalLink, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const HelpSupport = () => {
    const [message, setMessage] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        setMessage('');
        toast.success('Support request sent to IT department.');
    };

    const faqs = [
        {
            q: "How accurate is the cardiovascular prediction?",
            a: "The XGBoost model running on our servers was trained on the Cleveland Heart Disease dataset and maintains a clinically validated accuracy of ~92% across a diverse patient pool. It should be used as secondary decision support."
        },
        {
            q: "Can I review a past patient's assessment?",
            a: "Yes. Navigate to the Admin Dashboard (if authorized) or the History tab to review past diagnostics. All predictions are securely logged to our PostgreSQL DB with timestamps."
        },
        {
            q: "I forgot my clinical login credentials. What now?",
            a: "Due to HIPAA compliance rules, passwords cannot be recovered via email. You must submit an identity verification ticket to Hospital IT to reset your account access."
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black font-display text-slate-900 flex items-center gap-3">
                    <HelpCircle className="text-medical-600" /> Help & Support
                </h1>
                <p className="text-slate-500 font-medium">Documentation, technical assistance, and clinical FAQs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left col - FAQs */}
                <div className="space-y-6">
                    <div className="enterprise-card p-6 border-l-4 border-l-medical-500">
                        <h2 className="text-xl font-bold font-display text-slate-800 mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-medical-500" /> Clinical System FAQs
                        </h2>
                        <div className="space-y-6">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                    <h3 className="font-bold text-slate-800 text-sm mb-2">{faq.q}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="enterprise-card p-6 bg-slate-800 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">System Documentation</h3>
                                <p className="text-sm text-slate-400 mt-1">Full API reference & user manual</p>
                            </div>
                            <button className="bg-medical-600 hover:bg-medical-700 p-3 flex items-center justify-center rounded-xl transition-colors">
                                <ExternalLink size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right col - Contact IT */}
                <div className="enterprise-card p-6 lg:row-span-2 flex flex-col">
                    <h2 className="text-xl font-bold font-display text-slate-800 mb-2 flex items-center gap-2">
                        <MessageSquare size={20} className="text-blue-500" /> Contact IT Support
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Create a secure ticket for issues related to model inference, patient data matching, or access control.</p>

                    <form onSubmit={handleSend} className="flex-1 flex flex-col space-y-4">
                        <div className="medical-input-group">
                            <label className="medical-label">Issue Category</label>
                            <select className="medical-input cursor-pointer bg-white">
                                <option>Clinical Model Bug</option>
                                <option>Data Privacy / Patient Log</option>
                                <option>Account & Permissions</option>
                                <option>Other Inquiry</option>
                            </select>
                        </div>

                        <div className="medical-input-group flex-1 flex flex-col">
                            <label className="medical-label">Detailed Description</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="medical-input flex-1 min-h-[200px] resize-none p-4 w-full"
                                placeholder="Please describe the issue in detail. Do not include PHI in this plain text box."
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full h-12 flex items-center justify-center gap-2 mt-auto">
                            <Send size={18} /> Submit IT Ticket
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;

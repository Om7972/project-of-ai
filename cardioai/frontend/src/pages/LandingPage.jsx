import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, Shield, HeartPulse, Brain, BarChart, 
  Lock, Users, ArrowRight, CheckCircle2, Cloud,
  FileText, ArrowUpRight, Github, Twitter, Linkedin
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const Header = () => (
  <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <HeartPulse className="text-medical-600 dark:text-medical-400" size={32} />
        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Cardio<span className="text-medical-600 dark:text-medical-400">AI</span>
        </span>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        {['Features', 'How It Works', 'Security', 'Testimonials'].map((item) => (
          <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-medical-600 dark:hover:text-medical-400 transition-colors">
            {item}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-medical-600 transition-colors">
          Log In
        </Link>
        <Link to="/register" className="btn-enterprise">
          Get Started
        </Link>
      </div>
    </div>
  </header>
);

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Animated ECG Background Line */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full stroke-medical-600">
          <motion.path
            d="M 0 100 C 100 100 150 100 200 100 L 220 100 L 230 50 L 250 180 L 270 20 L 290 120 L 300 100 L 400 100"
            fill="none"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-medical-50 dark:bg-medical-900/30 text-medical-700 dark:text-medical-300 font-semibold text-sm mb-6 border border-medical-100 dark:border-medical-800">
              <Activity size={16} />
              <span className="animate-pulse">Live Prediction Engine Active</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-8">
              AI-Powered <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-medical-400">Cardiac Risk Intelligence</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl">
              Equip your hospital with real-time, explainable machine learning predictions. Identify cardiovascular disease risks early with state-of-the-art XGBoost modeling and SHAP-based feature importance.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/register" className="btn-enterprise w-full sm:w-auto text-lg px-8 py-4">
                Start Risk Assessment <ArrowRight size={20} />
              </Link>
              <Link to="/dashboard" className="btn-enterprise-outline dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 w-full sm:w-auto text-lg px-8 py-4 bg-white dark:bg-transparent">
                View Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => (
  <section id="features" className="py-24 bg-white dark:bg-slate-950 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4">Precision Meets Transparency</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Our platform merges high-accuracy predictive capabilities with absolute medical transparency, ensuring clinicians trust the AI's deductions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Brain, title: "XGBoost AI Model", desc: "Trained on millions of patient records, our gradient boosting algorithm delivers near-perfect accuracy for cardiac risk." },
          { icon: Activity, title: "Real-time Prediction", desc: "Process patient vitals instantly. Get actionable risk scores within milliseconds during critical care scenarios." },
          { icon: Shield, title: "Explainable AI (SHAP)", desc: "Never rely on a black box. Our system visualizes exactly which clinical features contributed to the patient's risk score." }
        ].map((feat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2 }}
            className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center hover:shadow-medical-lg transition-shadow duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-medical-100 dark:bg-medical-900/30 flex items-center justify-center mx-auto mb-6">
              <feat.icon className="text-medical-600 dark:text-medical-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const UniqueFeatures = () => {
  const features = [
    "Real-time Risk Prediction", "Explainable AI Insights", 
    "Doctor Dashboard Analytics", "Patient Risk History Tracking",
    "Risk Trend Forecasting", "Secure JWT Authentication",
    "Role-based Access", "Cloud Deployment Ready",
    "HIPAA-Ready Architecture", "AI-Generated Guidelines"
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-12 text-center">Premium Differentiators</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((title, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-effect dark:bg-slate-800/50 p-6 rounded-2xl flex items-center gap-4 dark:border-slate-700"
            >
              <CheckCircle2 className="text-medical-500" size={24} />
              <span className="font-bold text-slate-700 dark:text-slate-200">{title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950 px-6">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-16 text-center">Seamless Clinical Workflow</h2>
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-medical-100 dark:bg-slate-800 -translate-x-1/2 hidden md:block" />
        <div className="space-y-12">
          {[
            { step: 1, title: 'Enter Patient Data', desc: 'Input vitals, demographics, and lab results into the secure system.' },
            { step: 2, title: 'AI Model Processing', desc: 'Our XGBoost engine analyzes the data against historical hospital records.' },
            { step: 3, title: 'Risk Scoring & SHAP', desc: 'Receive instantaneous percentage risk with visualized contributing factors.' },
            { step: 4, title: 'Clinical Recommendation', desc: 'Get automated, protocol-driven treatment suggestions based on the risk tier.' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className="flex-1 text-center md:text-right w-full">
                {idx % 2 === 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 inline-block w-full text-left shadow-sm">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                     <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 rounded-full bg-medical-600 text-white flex items-center justify-center font-black text-2xl z-10 shadow-medical">
                {item.step}
              </div>
              <div className="flex-1 w-full text-left">
                {idx % 2 !== 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 inline-block w-full text-left shadow-sm">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                     <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const AnalyticsPreview = () => (
  <section className="py-24 bg-slate-900 text-white overflow-hidden px-6">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1">
        <h2 className="text-3xl lg:text-4xl font-black mb-6">Real-Time Data Dashboard UI</h2>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          Monitor your hospital's patient demographics, live risk distributions, and monthly prediction statistics with our elegantly animated enterprise dashboards.
        </p>
        <ul className="space-y-4 mb-8">
          {['Animated interactive charts', 'Demographic Risk Distributions', 'Hospital-wide monthly statistics'].map((i, idx) => (
             <li key={idx} className="flex items-center gap-3 text-slate-300 font-medium">
               <div className="w-2 h-2 rounded-full bg-medical-400" /> {i}
             </li>
          ))}
        </ul>
        <Link to="/register" className="btn-enterprise text-white bg-medical-600 hover:bg-medical-500 border-none">
          Explore Analytics <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="flex-1 relative w-full">
        {/* Abstract mock chart graphic */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500">
           <div className="flex justify-between items-center mb-6">
             <div className="h-4 w-32 bg-slate-700 rounded" />
             <div className="h-4 w-12 bg-medical-500/50 rounded" />
           </div>
           <div className="flex items-end gap-3 h-48 mt-4 border-b border-slate-700 pb-4">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <motion.div key={i} className="flex-1 bg-gradient-to-t from-medical-600 to-medical-400 rounded-t-sm"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              ))}
           </div>
           <div className="mt-8 flex gap-6">
              <div className="w-24 h-24 rounded-full border-8 border-slate-700 border-t-medical-400 border-r-medical-500 shadow-lg relative flex items-center justify-center">
                 <span className="font-bold text-slate-300">75%</span>
              </div>
              <div className="flex-1 space-y-3">
                 <div className="h-2 w-full bg-slate-700 rounded overflow-hidden">
                    <div className="h-full bg-red-400 w-[30%]" />
                 </div>
                 <div className="h-2 w-full bg-slate-700 rounded overflow-hidden">
                    <div className="h-full bg-orange-400 w-[45%]" />
                 </div>
                 <div className="h-2 w-full bg-slate-700 rounded overflow-hidden">
                    <div className="h-full bg-green-400 w-[80%]" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

const SecurityCompliance = () => (
  <section id="security" className="py-24 bg-white dark:bg-slate-950 px-6 border-b border-slate-100 dark:border-slate-800">
    <div className="max-w-7xl mx-auto text-center">
      <Lock className="text-medical-600 dark:text-medical-400 mx-auto mb-6" size={48} />
      <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4">Enterprise Grade Security</h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-16">
        Designed for strict hospital compliance. Your patient data is secured using modern cryptographic standards and distributed cloud architecture.
      </p>

      <div className="grid sm:grid-cols-3 gap-8 text-left">
        {[
          { icon: Lock, t: "AES-256 Encryption", d: "End-to-end data encryption for patient queries." },
          { icon: Users, t: "Strict Role Auth", d: "Role-based access control for Doctors and Admins." },
          { icon: Cloud, t: "Cloud Scalable", d: "Deploy on your own AWS/Azure cloud instantly." }
        ].map((item, i) => (
           <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
             <div className="text-medical-600 dark:text-medical-400 mb-4"><item.icon size={28} /></div>
             <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{item.t}</h4>
             <p className="text-sm text-slate-600 dark:text-slate-400">{item.d}</p>
           </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-900 px-6">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl lg:text-4xl font-black text-center text-slate-900 dark:text-white mb-16">Trusted by Cardiology Professionals</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { name: "Dr. Sarah Jenkins", role: "Chief of Cardiology, Metro Hospital", txt: "The SHAP feature importance has completely changed how we trust AI. It doesn't just give a score; it explains exactly why the risk is high." },
          { name: "Dr. Michael Chen", role: "Attending Physician, Central Med", txt: "Implementing CardioAI into our triage workflow reduced our preliminary assessment time by 40%. Exceptionally accurate." },
          { name: "Dr. Elena Rodriguez", role: "Cardiovascular Surgeon", txt: "A beautifully designed platform. The dashboard gives me exactly the demographic insights I need at a glance." }
        ].map((t, i) => (
           <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="flex gap-1 text-yellow-400 mb-4">
               {[...Array(5)].map((_, idx) => <span key={idx}>★</span>)}
             </div>
             <p className="text-slate-700 dark:text-slate-300 italic mb-6">"{t.txt}"</p>
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-medical-100 dark:bg-medical-900 rounded-full flex items-center justify-center text-medical-700 dark:text-medical-300 font-bold text-xl">
                 {t.name.charAt(4)}
               </div>
               <div>
                 <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
               </div>
             </div>
           </div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="py-24 relative overflow-hidden bg-medical-900 px-6">
    <div className="absolute inset-0 bg-gradient-to-br from-medical-600 to-medical-900" />
    <motion.div 
       className="absolute right-0 bottom-0 opacity-10 text-white w-96 h-96 translate-x-1/3 translate-y-1/3"
       animate={{ rotate: 360 }}
       transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
    >
      <HeartPulse className="w-full h-full" />
    </motion.div>
    
    <div className="relative max-w-4xl mx-auto text-center text-white z-10">
      <h2 className="text-4xl lg:text-5xl font-black mb-6">Transform Cardiac Risk Assessment with AI</h2>
      <p className="text-xl text-medical-100 mb-10">
        Join leading hospitals in upgrading your cardiovascular predictive capabilities.
      </p>
      <Link to="/register" className="btn-enterprise bg-white text-medical-700 hover:bg-slate-50 border-none shadow-2xl px-10 py-5 text-lg">
        Get Started Now
      </Link>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-950 py-12 px-6 border-t border-slate-800 text-slate-400 text-sm">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse className="text-medical-500" size={24} />
          <span className="text-xl font-black text-white tracking-tight">Cardio<span className="text-medical-500">AI</span></span>
        </div>
        <p className="max-w-xs leading-relaxed mb-6">
          Advanced artificial intelligence for predicting cardiovascular disease with clinical-grade accuracy and explainability.
        </p>
        <div className="flex gap-4">
          <Github className="hover:text-white cursor-pointer transition-colors" size={20} />
          <Twitter className="hover:text-white cursor-pointer transition-colors" size={20} />
          <Linkedin className="hover:text-white cursor-pointer transition-colors" size={20} />
        </div>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
        <ul className="space-y-3">
          <li><a href="#" className="hover:text-medical-400 transition-colors">Risk Prediction</a></li>
          <li><a href="#" className="hover:text-medical-400 transition-colors">SHAP Analytics</a></li>
          <li><a href="#" className="hover:text-medical-400 transition-colors">Data Security</a></li>
          <li><a href="#" className="hover:text-medical-400 transition-colors">API Access</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Company</h4>
        <ul className="space-y-3">
          <li><a href="#" className="hover:text-medical-400 transition-colors">About Us</a></li>
          <li><a href="#" className="hover:text-medical-400 transition-colors">Contact</a></li>
          <li><a href="#" className="hover:text-medical-400 transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-medical-400 transition-colors">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row justify-between items-center gap-4">
      <p>© {new Date().getFullYear()} CardioAI Hospital Systems. All rights reserved.</p>
      <p>Designed for Healthcare Professionals.</p>
    </div>
  </footer>
);

export default function LandingPage() {
  // Update document title for SEO
  useEffect(() => {
    document.title = "CardioAI - AI-Powered Cardiac Risk Intelligence";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'CardioAI provides real-time, explainable AI-driven cardiac risk assessments. Equip your hospital with state-of-the-art predictive analytics using XGBoost and SHAP.');
    }
  }, []);

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-900 selection:bg-medical-500/30">
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <UniqueFeatures />
        <HowItWorks />
        <AnalyticsPreview />
        <Testimonials />
        <SecurityCompliance />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

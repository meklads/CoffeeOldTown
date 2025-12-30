
import React, { useState, useRef } from 'react';
import { ShieldPlus, Zap, Activity, FlaskConical, ArrowUpRight, Sun, CloudSun, Moon, Waves, Beaker, AlertCircle, Link2 } from 'lucide-react';
import { SectionId, DayPlan } from '../types.ts';
import { generateMealPlan } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';

const MetabolicControlCenter: React.FC = () => {
  const { selectedGoal, setSelectedGoal, language, setIsApiKeyLinked } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'AUTH' | 'GENERIC' | null>(null);
  const [result, setResult] = useState<DayPlan | null>(null);
  
  const isGeneratingRef = useRef(false);
  const isAr = language === 'ar';

  const protocols = [
    { 
      id: 'immunity', 
      label: isAr ? 'تعزيز المناعة' : 'Immunity Boost', 
      icon: <ShieldPlus size={18} />, 
      img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80', 
      tag: 'RESILIENCE',
      desc: isAr ? 'تحسين الدفاع الخلوي.' : 'Cellular defense optimization.'
    },
    { 
      id: 'recovery', 
      label: isAr ? 'الاستشفاء الحيوي' : 'Bio-Recovery', 
      icon: <Activity size={18} />, 
      img: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=800&q=80', 
      tag: 'REPAIR',
      desc: isAr ? 'تنظيف المخلفات الأيضية.' : 'Metabolic waste clearance.'
    },
    { 
      id: 'focus', 
      label: isAr ? 'التركيز الذهني' : 'Neural Focus', 
      icon: <Zap size={18} />, 
      img: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80', 
      tag: 'COGNITION',
      desc: isAr ? 'تعزيز القدرة المشبكية.' : 'Synaptic throughput enhancement.'
    }
  ];

  const handleLinkKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setIsApiKeyLinked(true);
        if (selectedGoal) handleGoalSelect(selectedGoal);
      } catch (e) { console.error(e); }
    }
  };

  const handleGoalSelect = async (goalLabel: string) => {
    if (loading || isGeneratingRef.current) return;
    
    isGeneratingRef.current = true;
    setSelectedGoal(goalLabel);
    setLoading(true);
    setResult(null);
    setErrorType(null);
    
    try {
      const plan = await generateMealPlan({ goal: goalLabel, diet: 'balanced' }, language);
      if (plan) setResult(plan);
    } catch (error: any) {
      console.error("[ControlCenter] Plan error:", error);
      if (error.message === "KEY_AUTH_FAILED") {
        setErrorType('AUTH');
      } else {
        setErrorType('GENERIC');
      }
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }
  };

  return (
    <section id={SectionId.PHASE_02_PROTOCOLS} className="bg-brand-dark py-24 border-y border-white/5 relative overflow-hidden transition-colors duration-1000">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #C2A36B 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full border border-brand-primary/20 backdrop-blur-md">
             <FlaskConical size={12} className="animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-[0.5em]">{isAr ? 'المرحلة 02: التخليق الأيضي' : 'PHASE 02: METABOLIC SYNTHESIS'}</span>
           </div>
           <h2 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tighter">
             Control <span className="text-brand-primary italic">Center.</span>
           </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            {protocols.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleGoalSelect(item.label)}
                className={`group relative p-8 rounded-[32px] border transition-all duration-700 cursor-pointer overflow-hidden
                  ${selectedGoal === item.label 
                    ? 'bg-brand-primary/20 border-brand-primary/40 shadow-[0_20px_60px_-15px_rgba(194,163,107,0.2)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
              >
                <div className="relative z-10 flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700
                    ${selectedGoal === item.label ? 'bg-brand-primary text-brand-dark' : 'bg-white/5 text-brand-primary/50'}`}>
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[6px] font-black text-brand-primary uppercase tracking-[0.4em] block">{item.tag}</span>
                    <h3 className={`text-xl font-serif font-bold transition-colors ${selectedGoal === item.label ? 'text-white' : 'text-white/40'}`}>
                      {item.label}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-8">
             <div className="bg-white/[0.02] border border-white/5 rounded-[48px] p-8 md:p-12 relative min-h-[520px] flex flex-col shadow-inner overflow-hidden">
                {loading ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8">
                     <div className="relative">
                        <div className="w-20 h-20 rounded-full border border-brand-primary/10 border-t-brand-primary animate-spin" />
                        <Beaker size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary animate-pulse" />
                     </div>
                     <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.8em] animate-pulse">
                        {isAr ? 'جاري التخليق...' : 'SYNTHESIZING...'}
                     </p>
                  </div>
                ) : errorType === 'AUTH' ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-brand-dark/95 z-40 animate-fade-in">
                      <AlertCircle size={48} className="text-brand-primary animate-pulse" />
                      <h3 className="text-xl font-serif font-bold text-white">{isAr ? 'مطلوب ربط المفتاح' : 'Key Link Required'}</h3>
                      <p className="text-xs text-white/40 italic max-w-xs">{isAr ? 'يرجى ربط مفتاح API يدوياً لتجاوز قيود بيئة فيرسل.' : 'Please link API Key manually to bypass Vercel environment restrictions.'}</p>
                      <button onClick={handleLinkKey} className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-[9px] tracking-widest hover:scale-105 transition-all">
                         <Link2 size={16} /> {isAr ? 'ربط المفتاح الآن' : 'LINK KEY NOW'}
                      </button>
                   </div>
                ) : errorType === 'GENERIC' ? (
                   <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
                      <AlertCircle size={48} className="text-red-500/50" />
                      <p className="text-xs text-white/40">{isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.'}</p>
                      <button onClick={() => selectedGoal && handleGoalSelect(selectedGoal)} className="px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black text-white hover:border-brand-primary">RETRY</button>
                   </div>
                ) : result ? (
                  <div className="animate-fade-in space-y-12">
                     <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                        <div className="space-y-2">
                           <h3 className="text-3xl font-serif font-bold text-white tracking-tight">{selectedGoal} Target</h3>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center">
                           <span className="text-[6px] font-black text-brand-primary uppercase tracking-widest block mb-1">ENERGY LOAD</span>
                           <span className="text-xl font-serif font-bold text-white">{result.totalCalories} KCAL</span>
                        </div>
                     </div>
                     <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { l: 'Morning', i: <Sun size={14} />, d: result.breakfast },
                          { l: 'Midday', i: <CloudSun size={14} />, d: result.lunch },
                          { l: 'Evening', i: <Moon size={14} />, d: result.dinner }
                        ].map((m, idx) => (
                          <div key={idx} className="bg-white/[0.03] border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.05] transition-all">
                             <div className="flex items-center gap-2 text-brand-primary mb-4">
                                {m.i}
                                <span className="text-[7px] font-black uppercase tracking-widest opacity-60">{m.l}</span>
                             </div>
                             <h4 className="text-sm font-serif font-bold text-white mb-2 leading-tight">{m.d?.name}</h4>
                             <p className="text-[10px] text-white/30 italic font-medium leading-relaxed line-clamp-3">
                                {m.d?.description}
                             </p>
                          </div>
                        ))}
                     </div>
                     <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-[32px] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary" />
                        <p className="text-[11px] text-white/60 italic font-medium leading-relaxed">
                          "{result.advice}"
                        </p>
                     </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 opacity-20 grayscale">
                     <Waves size={64} strokeWidth={1} className="text-brand-primary" />
                     <p className="text-[9px] font-black text-white uppercase tracking-[0.6em]">
                        {isAr ? 'بانتظار اختيار البروتوكول...' : 'AWAITING NODE ACTIVATION...'}
                     </p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetabolicControlCenter;

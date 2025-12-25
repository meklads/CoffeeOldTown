
import React, { useState, useEffect, useRef } from 'react';
import { ShieldPlus, Zap, Activity, Sun, CloudSun, Moon, ArrowUpRight, Sparkles, Microscope, Box, Cpu, ChevronRight } from 'lucide-react';
import { SectionId, DayPlan } from '../types.ts';
import { generateMealPlan } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';

const SmartNutritionTool: React.FC = () => {
  const { selectedGoal, setSelectedGoal, feedbackHistory, language } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DayPlan | null>(null);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const protocols = [
    { 
      id: 'immunity', 
      label: language === 'ar' ? 'تعزيز المناعة' : 'Immunity Boost', 
      icon: <ShieldPlus size={24} />, 
      tag: 'RESILIENCE',
      img: 'https://images.unsplash.com/photo-1616671285410-9c4451731633?w=800&q=80',
      code: 'PROT-IMN-01'
    },
    { 
      id: 'recovery', 
      label: language === 'ar' ? 'الاستشفاء الحيوي' : 'Bio-Recovery', 
      icon: <Activity size={24} />, 
      tag: 'REPAIR',
      img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80',
      code: 'PROT-REC-04'
    },
    { 
      id: 'focus', 
      label: language === 'ar' ? 'التركيز الذهني' : 'Neural Focus', 
      icon: <Zap size={24} />, 
      tag: 'COGNITION',
      img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      code: 'PROT-NRL-09'
    }
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => (p >= 98 ? p : p + Math.random() * 25));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (goalLabel: string) => {
    if (loading) return;
    setSelectedGoal(goalLabel);
    setLoading(true);
    setResult(null);
    try {
      const plan = await generateMealPlan({ goal: goalLabel, diet: 'balanced' }, language, feedbackHistory);
      if (plan) {
        setTimeout(() => {
          setResult(plan);
          setLoading(false);
        }, 1200);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <section id={SectionId.PHASE_03_SYNTHESIS} className="relative py-40 bg-[#F8F9FA] overflow-hidden border-y border-brand-dark/5">
      
      {/* High-Tech Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0A0A0A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Cinematic Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-4 px-6 py-2 bg-white text-brand-primary rounded-full border border-brand-primary/20 shadow-xl">
                 <Cpu size={14} className="animate-spin-slow" />
                 <span className="text-[10px] font-black uppercase tracking-[0.5em]">{language === 'ar' ? 'غرفة التخليق الأيضي' : 'METABOLIC SYNTHESIS HUB'}</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark leading-[0.8] tracking-tighter">
                Neural <br /> <span className="text-brand-primary italic font-normal">Synthesis.</span>
              </h2>
           </div>
           <div className="hidden lg:block text-right">
              <div className="text-[10px] font-black text-brand-dark/20 uppercase tracking-[0.6em] mb-2">SYSTEM_LATENCY: 12ms</div>
              <div className="h-1.5 w-48 bg-brand-sand/30 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-primary w-2/3 animate-pulse" />
              </div>
           </div>
        </div>

        {/* Control Interface Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Interactive Module Pods (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {protocols.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleGenerate(item.label)}
                className={`group relative w-full p-1 rounded-[44px] transition-all duration-700 overflow-hidden
                  ${selectedGoal === item.label 
                    ? 'bg-gradient-to-br from-brand-primary to-brand-primary/40 shadow-3xl translate-x-4 scale-[1.02]' 
                    : 'bg-white border border-brand-dark/5 hover:border-brand-primary/30'}`}
              >
                <div className="bg-white rounded-[42px] p-8 flex items-center justify-between w-full h-full relative overflow-hidden">
                   {/* Background Image Preview (Subtle) */}
                   <div className="absolute top-0 right-0 w-1/3 h-full opacity-0 group-hover:opacity-10 transition-opacity">
                      <img src={item.img} className="w-full h-full object-cover grayscale" alt="texture" />
                   </div>

                   <div className="flex items-center gap-8 relative z-10">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-700 shadow-2xl
                        ${selectedGoal === item.label ? 'bg-brand-dark text-brand-primary scale-110' : 'bg-brand-light text-brand-dark/20'}`}>
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[8px] font-black tracking-widest ${selectedGoal === item.label ? 'text-brand-primary' : 'text-brand-dark/30'}`}>{item.code}</span>
                           <div className={`w-1 h-1 rounded-full ${selectedGoal === item.label ? 'bg-brand-primary animate-ping' : 'bg-brand-dark/10'}`} />
                        </div>
                        <h3 className={`text-2xl font-serif font-bold transition-colors ${selectedGoal === item.label ? 'text-brand-dark' : 'text-brand-dark/60'}`}>
                          {item.label}
                        </h3>
                      </div>
                   </div>
                   
                   <div className={`transition-all duration-700 ${selectedGoal === item.label ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                      <ChevronRight size={24} className="text-brand-primary" />
                   </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: The Holographic Synthesis Chamber (7 Columns) */}
          <div className="lg:col-span-7">
             <div className="h-full min-h-[580px] bg-brand-dark rounded-[64px] border border-white/10 shadow-4xl relative overflow-hidden group/chamber">
                
                {/* Visual Glass Overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(194,163,107,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(194,163,107,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-12 animate-fade-in bg-brand-dark/95 z-30">
                    <div className="relative">
                       <div className="w-32 h-32 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Microscope size={40} className="text-brand-primary animate-pulse" />
                       </div>
                       {/* Floating Radar Scan */}
                       <div className="absolute -inset-8 border border-brand-primary/5 rounded-full animate-ping" />
                    </div>
                    <div className="space-y-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-[12px] font-black text-brand-primary uppercase tracking-[0.8em] animate-pulse">Initializing Synthesis</span>
                      </div>
                      <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-brand-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in text-white">
                    
                    {/* Header: Status & Info */}
                    <div className="p-12 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative overflow-hidden">
                       <div className="relative z-10 space-y-2">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                             <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em]">SYSTEM_OUTPUT: STABLE</span>
                          </div>
                          <h3 className="text-4xl font-serif font-bold tracking-tighter">Bio-Metric <span className="text-brand-primary italic">Blueprint.</span></h3>
                       </div>
                       <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 px-10 py-6 rounded-[32px] text-center group-hover/chamber:border-brand-primary/30 transition-all">
                          <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest block mb-2">METABOLIC LOAD</span>
                          <span className="text-4xl font-serif font-bold text-white tracking-tighter">{result.totalCalories}</span>
                       </div>
                    </div>

                    {/* Content: Meal Modules */}
                    <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                       {[
                         { l: 'RISE', i: <Sun size={20} />, d: result.breakfast, tag: 'FUEL' },
                         { l: 'PEAK', i: <CloudSun size={20} />, d: result.lunch, tag: 'SUSTAIN' },
                         { l: 'REST', i: <Moon size={20} />, d: result.dinner, tag: 'REGEN' }
                       ].map((m, idx) => (
                         <div key={idx} className="group/meal relative flex flex-col p-8 rounded-[40px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-brand-primary/20 transition-all duration-700">
                            <div className="flex items-center justify-between mb-8">
                               <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                                  {m.i}
                               </div>
                               <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{m.tag}</span>
                            </div>
                            <div className="space-y-4">
                               <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{m.l}</span>
                               <h4 className="text-xl font-serif font-bold text-white leading-tight line-clamp-2">{m.d?.name}</h4>
                               <p className="text-[10px] text-white/40 font-medium italic leading-relaxed line-clamp-3">
                                 {m.d?.description}
                               </p>
                            </div>
                            <div className="mt-auto pt-6 flex justify-end opacity-0 group-hover/meal:opacity-100 transition-opacity">
                               <ArrowUpRight size={16} className="text-brand-primary" />
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Footer: Diagnostic Advice */}
                    <div className="m-12 mt-0 p-8 bg-brand-primary rounded-[36px] flex items-center gap-8 shadow-2xl relative overflow-hidden group/advice">
                       <div className="absolute inset-0 bg-brand-dark opacity-0 group-hover/advice:opacity-10 transition-opacity" />
                       <div className="shrink-0 w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30">
                          <Sparkles size={24} />
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">EXPERT_ADVISORY</span>
                          <p className="text-white text-[13px] italic font-semibold leading-relaxed">
                            "{result.advice}"
                          </p>
                       </div>
                    </div>

                    {/* Animated Scanning Line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-primary/40 shadow-[0_0_15px_#C2A36B] animate-scan opacity-40" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-10 animate-fade-in bg-brand-dark">
                     <div className="relative">
                        <Box size={80} strokeWidth={0.5} className="text-brand-primary/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Microscope size={32} className="text-brand-primary/20 animate-pulse" />
                        </div>
                        <div className="absolute -inset-10 border border-brand-primary/5 rounded-full animate-pulse-slow" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-3xl font-serif font-bold text-white/30">Interface Idle.</h4>
                        <div className="flex flex-col items-center gap-4">
                           <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/10 max-w-[240px] leading-loose">
                             Select a metabolic module to initialize the synthesis cycle.
                           </p>
                           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/30" />
                              <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">READY_TO_PROCESS</span>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>

    </section>
  );
};

export default SmartNutritionTool;

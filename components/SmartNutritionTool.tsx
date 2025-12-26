
import React, { useState, useEffect, useRef } from 'react';
import { ShieldPlus, Zap, Activity, Sun, CloudSun, Moon, ArrowUpRight, Sparkles, Microscope, Box, Cpu, ChevronRight, Beaker, Atom } from 'lucide-react';
import { SectionId, DayPlan } from '../types.ts';
import { generateMealPlan } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';

const SmartNutritionTool: React.FC = () => {
  const { selectedGoal, setSelectedGoal, feedbackHistory, language } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DayPlan | null>(null);
  const [progress, setProgress] = useState(0);
  const chamberRef = useRef<HTMLDivElement>(null);

  const protocols = [
    { 
      id: 'immunity', 
      label: language === 'ar' ? 'تعزيز المناعة' : 'Immunity Boost', 
      icon: <ShieldPlus size={22} />, 
      tag: 'RESILIENCE',
      img: 'https://images.unsplash.com/photo-1616671285410-9c4451731633?w=800&q=80',
      code: 'PROT-IMN-01'
    },
    { 
      id: 'recovery', 
      label: language === 'ar' ? 'الاستشفاء الحيوي' : 'Bio-Recovery', 
      icon: <Activity size={22} />, 
      tag: 'REPAIR',
      img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80',
      code: 'PROT-REC-04'
    },
    { 
      id: 'focus', 
      label: language === 'ar' ? 'التركيز الذهني' : 'Neural Focus', 
      icon: <Zap size={22} />, 
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
        setProgress(p => (p >= 98 ? p : p + Math.floor(Math.random() * 15) + 5));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (goalLabel: string) => {
    if (loading) return;
    
    // UI Improvement: Auto-scroll to chamber on mobile
    if (window.innerWidth < 1024 && chamberRef.current) {
      chamberRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

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
    <section id={SectionId.PHASE_03_SYNTHESIS} className="relative py-32 lg:py-48 bg-brand-light overflow-hidden transition-all duration-1000 border-t border-brand-dark/[0.03]">
      
      {/* Background Micro-Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(#0A0A0A 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header: Single Line Unified Aesthetic */}
        <div className="mb-24 space-y-4">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-brand-dark/[0.05] text-brand-primary rounded-full shadow-sm">
              <Atom size={12} className="animate-spin-slow" />
              <span className="text-[8px] font-black uppercase tracking-[0.5em]">{language === 'ar' ? 'وحدة التخليق العصبي' : 'NEURAL SYNTHESIS UNIT'}</span>
           </div>
           <h2 className="text-5xl md:text-8xl lg:text-[105px] font-serif font-bold text-brand-dark tracking-tighter leading-none">
             Neural <span className="text-brand-primary italic font-normal">Synthesis.</span>
           </h2>
        </div>

        {/* Interface Grid: Balanced Height Symmetry */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch h-full">
          
          {/* Left: Specimen Tiles with Full Backgrounds */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {protocols.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleGenerate(item.label)}
                className={`group relative w-full flex-grow h-[185px] lg:h-auto overflow-hidden rounded-[45px] transition-all duration-700 border
                  ${selectedGoal === item.label 
                    ? 'border-brand-primary shadow-4xl scale-[1.02] z-20' 
                    : 'border-brand-dark/[0.04] bg-white hover:border-brand-primary/30 z-10'}`}
              >
                {/* Background Image Layer */}
                <div className={`absolute inset-0 transition-all duration-[2s] ${selectedGoal === item.label ? 'opacity-100 scale-110' : 'opacity-10 grayscale group-hover:opacity-60 group-hover:grayscale-0 group-hover:scale-105'}`}>
                   <img src={item.img} className="w-full h-full object-cover" alt={item.label} />
                </div>
                
                {/* Visual Depth Overlay */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${selectedGoal === item.label ? 'bg-gradient-to-r from-brand-dark/90 via-brand-dark/40 to-transparent' : 'bg-white/95 group-hover:bg-white/50'}`} />

                <div className="relative p-12 flex items-center justify-between z-10 h-full">
                   <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-xl
                        ${selectedGoal === item.label ? 'bg-brand-primary text-brand-dark scale-110' : 'bg-brand-light text-brand-dark/20 group-hover:text-brand-primary'}`}>
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[8px] font-black tracking-widest ${selectedGoal === item.label ? 'text-brand-primary' : 'text-brand-dark/20'}`}>{item.code}</span>
                           {selectedGoal === item.label && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />}
                        </div>
                        <h3 className={`text-3xl font-serif font-bold transition-colors duration-500 ${selectedGoal === item.label ? 'text-white' : 'text-brand-dark/40 group-hover:text-brand-dark'}`}>
                          {item.label}
                        </h3>
                      </div>
                   </div>
                   <div className={`transition-all duration-700 ${selectedGoal === item.label ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                      <ChevronRight size={28} className="text-brand-primary" />
                   </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Synthesis Chamber (Perfect Height Balance & Light Theme) */}
          <div ref={chamberRef} className="lg:col-span-7 scroll-mt-32">
             <div className="h-full bg-white rounded-[55px] border border-brand-dark/[0.03] shadow-4xl relative overflow-hidden flex flex-col group/chamber min-h-[580px]">
                
                {/* Luxury Accents */}
                <div className="absolute top-0 right-0 w-1/4 h-full bg-brand-primary/[0.015] -skew-x-12 pointer-events-none" />
                
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-12 z-40 bg-white/95 backdrop-blur-xl animate-fade-in">
                    <div className="relative">
                       <div className="w-32 h-32 rounded-full border border-brand-primary/10 border-t-brand-primary animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Microscope size={40} className="text-brand-primary animate-pulse" />
                       </div>
                    </div>
                    <div className="space-y-5 text-center px-12">
                      <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.8em] animate-pulse">Initializing_Synthesis_Node</span>
                      <div className="w-64 h-1 bg-brand-dark/5 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-brand-primary shadow-glow transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in text-brand-dark relative z-10">
                    
                    {/* Chamber Header: High-End UI */}
                    <div className="p-12 border-b border-brand-dark/[0.03] flex justify-between items-center bg-brand-cream/10">
                       <div className="space-y-1">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                             <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em]">OUTPUT_STREAMS_VERIFIED</span>
                          </div>
                          <h3 className="text-5xl font-serif font-bold tracking-tighter">Metabolic <span className="text-brand-primary italic">Blueprint.</span></h3>
                       </div>
                       <div className="text-right flex flex-col items-end">
                          <span className="text-[8px] font-black text-brand-dark/20 uppercase tracking-widest block mb-2">ENERGY_TOTAL</span>
                          <span className="text-5xl font-serif font-bold text-brand-primary leading-none">{result.totalCalories} <span className="text-xs ml-1">KCAL</span></span>
                       </div>
                    </div>

                    {/* Results Body: Gallery Style */}
                    <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                       {[
                         { l: 'SUNRISE', i: <Sun size={22} />, d: result.breakfast },
                         { l: 'PEAK', i: <CloudSun size={22} />, d: result.lunch },
                         { l: 'ZENITH', i: <Moon size={22} />, d: result.dinner }
                       ].map((m, idx) => (
                         <div key={idx} className="group/item relative flex flex-col p-10 rounded-[45px] bg-brand-cream/20 border border-brand-dark/[0.02] hover:bg-white hover:border-brand-primary/30 hover:shadow-4xl transition-all duration-700 overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                               <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-brand-primary shadow-xl border border-brand-dark/[0.02]">
                                  {m.i}
                               </div>
                               <span className="text-[7px] font-black text-brand-dark/10 uppercase tracking-[0.4em]">ITEM_0{idx+1}</span>
                            </div>
                            <div className="space-y-4">
                               <h4 className="text-2xl font-serif font-bold text-brand-dark leading-tight line-clamp-2">{m.d?.name}</h4>
                               <p className="text-[11px] text-brand-dark/40 font-medium italic leading-relaxed line-clamp-4">
                                 {m.d?.description}
                               </p>
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Advisory Panel: High Contrast */}
                    <div className="m-12 mt-0 p-10 bg-brand-primary rounded-[50px] flex items-center gap-10 shadow-3xl border border-white/20 hover:scale-[1.01] transition-transform duration-500">
                       <div className="shrink-0 w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30">
                          <Sparkles size={32} strokeWidth={1.2} />
                       </div>
                       <p className="text-white text-lg md:text-xl italic font-semibold leading-relaxed tracking-tight">
                        "{result.advice}"
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-12 animate-fade-in">
                     <div className="relative">
                        <div className="absolute -inset-20 bg-brand-primary/5 rounded-full blur-[90px] animate-pulse-slow" />
                        <div className="w-32 h-32 rounded-[45px] bg-brand-cream/30 flex items-center justify-center border border-brand-dark/[0.03] shadow-inner">
                           <Beaker size={50} strokeWidth={0.8} className="text-brand-primary/20" />
                        </div>
                     </div>
                     <div className="space-y-6 max-w-sm">
                        <h4 className="text-4xl font-serif font-bold text-brand-dark/20 italic">Awaiting Selection.</h4>
                        <div className="space-y-4">
                           <p className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-dark/10 leading-loose">
                             PLEASE ACTIVATE A PROTOCOL NODE FROM THE CONSOLE OR TRENDING SYSTEMS.
                           </p>
                           <div className="inline-flex items-center gap-3 px-6 py-2 bg-brand-primary/5 rounded-full border border-brand-primary/10">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/30" />
                              <span className="text-[8px] font-black text-brand-primary/40 uppercase tracking-widest">System Ready</span>
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

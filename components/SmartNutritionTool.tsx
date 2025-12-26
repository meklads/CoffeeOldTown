
import React, { useState, useEffect, useRef } from 'react';
import { ShieldPlus, Zap, Activity, Sun, CloudSun, Moon, ArrowUpRight, Sparkles, Microscope, ChevronRight, Beaker, Atom } from 'lucide-react';
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
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
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
      img: 'https://images.unsplash.com/photo-1532634896-26909d0d4b89?w=800&q=80',
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
    <section id={SectionId.PHASE_03_SYNTHESIS} className="relative py-32 bg-brand-light dark:bg-brand-dark transition-all duration-1000">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="mb-20 space-y-4">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white dark:bg-white/5 border border-brand-dark/[0.05] dark:border-white/5 text-brand-primary rounded-full shadow-sm">
              <Atom size={12} className="animate-spin-slow" />
              <span className="text-[8px] font-black uppercase tracking-[0.5em]">{language === 'ar' ? 'وحدة التخليق العصبي' : 'NEURAL SYNTHESIS UNIT'}</span>
           </div>
           <h2 className="text-5xl md:text-8xl lg:text-[105px] font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
             Neural <span className="text-brand-primary italic font-normal">Synthesis.</span>
           </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch h-full">
          <div className="lg:col-span-5 flex flex-col gap-4">
            {protocols.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleGenerate(item.label)}
                className={`group relative w-full flex-grow h-[140px] lg:h-auto overflow-hidden rounded-[45px] transition-all duration-700 border
                  ${selectedGoal === item.label 
                    ? 'border-brand-primary shadow-4xl scale-[1.02] z-20' 
                    : 'border-brand-dark/[0.04] dark:border-white/5 bg-white dark:bg-brand-surface hover:border-brand-primary/30 z-10'}`}
              >
                {/* 50% opacity by default, 100% on hover or when selected */}
                <div className={`absolute inset-0 transition-all duration-[1s] ${selectedGoal === item.label ? 'opacity-100 scale-110' : 'opacity-50 grayscale-[0.2] group-hover:opacity-100 group-hover:grayscale-0'}`}>
                   <img src={item.img} className="w-full h-full object-cover" alt={item.label} />
                </div>
                
                {/* Adjusted Overlay for better 50% visibility */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${selectedGoal === item.label ? 'bg-gradient-to-r from-brand-dark/90 via-brand-dark/40 to-transparent' : 'bg-white/40 dark:bg-brand-dark/40 group-hover:bg-transparent'}`} />

                <div className="relative p-10 flex items-center justify-between z-10 h-full">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-xl
                        ${selectedGoal === item.label ? 'bg-brand-primary text-brand-dark scale-110' : 'bg-brand-light dark:bg-brand-dark text-brand-dark/20 group-hover:text-brand-primary'}`}>
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <span className={`text-[8px] font-black tracking-widest block mb-1 ${selectedGoal === item.label ? 'text-brand-primary' : 'text-white shadow-sm'}`}>{item.code}</span>
                        <h3 className={`text-2xl font-serif font-bold transition-colors duration-500 ${selectedGoal === item.label ? 'text-white' : 'text-white drop-shadow-md group-hover:text-brand-primary'}`}>
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

          <div ref={chamberRef} className="lg:col-span-7">
             <div className="h-full bg-white dark:bg-brand-surface rounded-[55px] border border-brand-dark/[0.03] dark:border-white/5 shadow-4xl relative overflow-hidden flex flex-col min-h-[520px]">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-12 z-40 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-xl">
                    <div className="relative">
                       <div className="w-24 h-24 rounded-full border border-brand-primary/10 border-t-brand-primary animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Microscope size={32} className="text-brand-primary animate-pulse" />
                       </div>
                    </div>
                    <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.8em] animate-pulse">Initializing_Synthesis</span>
                  </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in text-brand-dark dark:text-white">
                    <div className="p-10 border-b border-brand-dark/[0.03] dark:border
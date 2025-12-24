
import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, Sun, CloudSun, Moon, ShieldPlus, Zap, FlaskConical, Beaker, Waves, ChevronRight, Binary, Cpu, Fingerprint } from 'lucide-react';
import { SectionId, DayPlan } from '../types.ts';
import { generateMealPlan } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';

const SmartNutritionTool: React.FC = () => {
  const { selectedGoal, setSelectedGoal, feedbackHistory, language } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DayPlan | null>(null);

  const protocols = [
    { 
      id: 'immunity', 
      label: language === 'ar' ? 'تعزيز المناعة' : 'Immunity Boost', 
      icon: <ShieldPlus size={20} />, 
      tag: 'RESILIENCE',
      impact: 'HIGH',
      color: 'from-orange-500/10 to-transparent'
    },
    { 
      id: 'recovery', 
      label: language === 'ar' ? 'الاستشفاء الحيوي' : 'Bio-Recovery', 
      icon: <Activity size={20} />, 
      tag: 'REPAIR',
      impact: 'CRITICAL',
      color: 'from-blue-500/10 to-transparent'
    },
    { 
      id: 'focus', 
      label: language === 'ar' ? 'التركيز الذهني' : 'Neural Focus', 
      icon: <Zap size={20} />, 
      tag: 'COGNITION',
      impact: 'MAX',
      color: 'from-purple-500/10 to-transparent'
    }
  ];

  const handleGenerate = async (goalLabel: string) => {
    if (loading) return;
    setSelectedGoal(goalLabel);
    setLoading(true);
    setResult(null);
    try {
      const plan = await generateMealPlan({ goal: goalLabel, diet: 'balanced' }, language, feedbackHistory);
      if (plan) setResult(plan);
    } catch (error) {
      console.error("Synthesis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={SectionId.PHASE_03_SYNTHESIS} className="py-32 md:py-48 bg-zinc-50 dark:bg-brand-dark relative overflow-hidden transition-colors duration-1000">
      {/* Bio-Digital Background Layers */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #C2A36B 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Cinematic Header */}
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
           <div className="inline-flex items-center gap-3 px-6 py-2 bg-white dark:bg-white/[0.03] text-brand-primary rounded-full text-[9px] font-black uppercase tracking-[0.5em] shadow-sm border border-brand-primary/10 backdrop-blur-md">
              <FlaskConical size={14} className="animate-pulse" />
              <span>{language === 'ar' ? 'المرحلة 03: التخليق الذكي' : 'PHASE 03: INTELLIGENT SYNTHESIS'}</span>
           </div>
           <h2 className="text-5xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-tight">
             Protocol <span className="text-brand-primary italic font-normal">Synthesis.</span>
           </h2>
           <p className="text-brand-dark/40 dark:text-white/30 text-lg font-medium italic max-w-2xl mx-auto leading-relaxed">
             {language === 'ar' ? 'حوّل نواياك إلى بروتوكول غذائي دقيق مدعوم بالذكاء الاصطناعي.' : 'Transform your biological intent into a precision nutrition protocol engineered by the cloud.'}
           </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Panel: Protocol Selectors */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {protocols.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleGenerate(item.label)}
                disabled={loading}
                className={`group relative p-8 rounded-[40px] border transition-all duration-700 text-left overflow-hidden flex flex-col justify-between min-h-[160px]
                  ${selectedGoal === item.label 
                    ? 'bg-white dark:bg-zinc-900 border-brand-primary/40 shadow-2xl scale-[1.02] z-10' 
                    : 'bg-white/40 dark:bg-white/[0.01] border-brand-dark/5 dark:border-white/5 hover:border-brand-primary/20'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                <div className="relative z-10 flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700
                    ${selectedGoal === item.label ? 'bg-brand-primary text-white shadow-glow' : 'bg-brand-dark/5 dark:bg-white/5 text-brand-primary/40'}`}>
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[7px] font-black text-brand-primary/60 uppercase tracking-widest block">{item.impact} IMPACT</span>
                  </div>
                </div>

                <div className="relative z-10 mt-auto flex items-end justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em] block">{item.tag}</span>
                    <h3 className={`text-2xl font-serif font-bold transition-colors ${selectedGoal === item.label ? 'text-brand-dark dark:text-white' : 'text-brand-dark/30 dark:text-white/20'}`}>
                      {item.label}
                    </h3>
                  </div>
                  <ChevronRight size={18} className={`transition-all duration-500 ${selectedGoal === item.label ? 'text-brand-primary opacity-100' : 'opacity-0 translate-x-4'}`} />
                </div>
              </button>
            ))}

            {/* System Monitor Decoration */}
            <div className="hidden lg:block mt-auto p-8 rounded-[40px] border border-dashed border-brand-dark/10 dark:border-white/5">
               <div className="flex items-center gap-4 text-brand-dark/20 dark:text-white/10">
                  <Cpu size={24} strokeWidth={1} />
                  <div className="space-y-1">
                     <p className="text-[7px] font-black uppercase tracking-[0.3em]">Hardware Sync</p>
                     <p className="text-[9px] italic">Biometric link established and secured.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Panel: The Results Engine */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#0c0c0c] rounded-[64px] border border-brand-dark/[0.05] dark:border-white/[0.04] p-8 lg:p-16 shadow-3xl relative flex flex-col h-full min-h-[640px] backdrop-blur-3xl overflow-hidden group/screen">
              {/* Screen Glare Effect */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none" />
              
              {loading ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-12 animate-fade-in">
                   <div className="relative">
                      <div className="w-32 h-32 rounded-full border-2 border-brand-primary/5 border-t-brand-primary animate-spin" />
                      <div className="absolute inset-4 rounded-full border border-brand-primary/20 animate-pulse" />
                      <Binary className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary" size={32} />
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3 text-brand-primary">
                         <Activity size={16} className="animate-bounce" />
                         <h4 className="text-3xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter uppercase">{language === 'ar' ? 'جاري التخليق...' : 'SYNTHESIZING...'}</h4>
                      </div>
                      <p className="text-brand-dark/30 dark:text-white/20 text-sm font-medium italic tracking-widest uppercase">Calculating molecular alignment</p>
                   </div>
                </div>
              ) : result ? (
                <div className="w-full animate-fade-in-up space-y-12 flex flex-col h-full">
                  
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-end gap-10 border-b border-brand-dark/5 dark:border-white/5 pb-10">
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 text-brand-primary">
                           <Fingerprint size={14} />
                           <span className="text-[9px] font-black uppercase tracking-[0.4em]">Protocol Node ID: {Math.floor(Math.random()*10000)}</span>
                        </div>
                        <h4 className="text-4xl font-serif font-bold text-brand-dark dark:text-white leading-none">{selectedGoal} <span className="text-brand-primary">Plan.</span></h4>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <span className="text-[8px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-widest block mb-1">ENERGY LOAD</span>
                           <span className="text-3xl font-serif font-bold text-brand-dark dark:text-brand-primary">{result.totalCalories} KCAL</span>
                        </div>
                     </div>
                  </div>

                  {/* Staggered Cards */}
                  <div className="grid md:grid-cols-3 gap-6 flex-grow">
                     {[
                       { l: 'Sunrise', icon: <Sun size={18} />, d: result.breakfast, delay: '0' },
                       { l: 'Zenith', icon: <CloudSun size={18} />, d: result.lunch, delay: '100' },
                       { l: 'Twilight', icon: <Moon size={18} />, d: result.dinner, delay: '200' }
                     ].map((meal, idx) => (
                       <div 
                        key={idx} 
                        style={{ animationDelay: `${meal.delay}ms` }}
                        className="animate-fade-in-up bg-zinc-50 dark:bg-white/[0.02] p-8 rounded-[48px] border border-brand-dark/[0.03] dark:border-white/[0.03] flex flex-col h-full hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-500 hover:shadow-xl group/card"
                       >
                          <div className="flex items-center justify-between mb-8">
                             <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-brand-primary shadow-sm">
                                {meal.icon}
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">{meal.l}</span>
                          </div>
                          <h4 className="text-lg font-serif font-bold text-brand-dark dark:text-white mb-4 leading-tight group-hover/card:text-brand-primary transition-colors">{meal.d?.name}</h4>
                          <p className="text-[11px] text-brand-dark/40 dark:text-white/30 font-medium italic leading-relaxed line-clamp-4 flex-grow">
                             {meal.d?.description}
                          </p>
                       </div>
                     ))}
                  </div>
                  
                  {/* System Advice Bar */}
                  <div className="bg-brand-dark dark:bg-brand-primary/10 rounded-[40px] p-8 text-white flex flex-col md:flex-row items-center gap-10 border border-white/5 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rotate-45 translate-x-12 -translate-y-12 opacity-50" />
                     <div className="shrink-0 w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                        <Beaker className="text-brand-primary" size={24} />
                     </div>
                     <div className="space-y-2 relative z-10">
                        <h4 className="text-xl font-serif font-bold text-brand-primary tracking-tight">{language === 'ar' ? 'تحليل المحلل' : 'Analyst Insight'}</h4>
                        <p className="text-white/50 italic font-medium leading-relaxed text-xs">"{result.advice}"</p>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-10 opacity-40 hover:opacity-100 transition-opacity duration-1000">
                  <div className="relative">
                    <Waves className="text-brand-primary/20 animate-pulse" size={120} strokeWidth={1} />
                    <Beaker className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary/10" size={40} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-2xl font-serif font-bold text-brand-dark/20 dark:text-white/10 tracking-widest uppercase">{language === 'ar' ? 'النظام في انتظار التعليمات' : 'SYSTEM IDLE: AWAITING INPUT'}</h4>
                    <p className="text-brand-dark/30 dark:text-white/20 text-sm font-medium italic max-w-xs mx-auto">Select a protocol from the dashboard to initiate the metabolic synthesis engine.</p>
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

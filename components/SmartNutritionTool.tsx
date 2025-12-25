
import React, { useState, useEffect } from 'react';
import { ShieldPlus, Zap, Activity, Sun, CloudSun, Moon, ArrowUpRight, Sparkles, Microscope } from 'lucide-react';
import { SectionId, DayPlan } from '../types.ts';
import { generateMealPlan } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';

const SmartNutritionTool: React.FC = () => {
  const { selectedGoal, setSelectedGoal, feedbackHistory, language } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DayPlan | null>(null);
  const [progress, setProgress] = useState(0);

  const protocols = [
    { 
      id: 'immunity', 
      label: language === 'ar' ? 'تعزيز المناعة' : 'Immunity Boost', 
      icon: <ShieldPlus size={20} />, 
      tag: 'RESILIENCE',
      img: 'https://images.unsplash.com/photo-1616671285410-9c4451731633?w=800&q=80', // Expressive citrus macro
    },
    { 
      id: 'recovery', 
      label: language === 'ar' ? 'الاستشفاء الحيوي' : 'Bio-Recovery', 
      icon: <Activity size={20} />, 
      tag: 'REPAIR',
      img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80', // Water/cellular repair macro
    },
    { 
      id: 'focus', 
      label: language === 'ar' ? 'التركيز الذهني' : 'Neural Focus', 
      icon: <Zap size={20} />, 
      tag: 'COGNITION',
      img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', // Coffee bean focus macro
    }
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => (p >= 98 ? p : p + Math.random() * 35));
      }, 150);
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
        }, 800);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <section id={SectionId.PHASE_03_SYNTHESIS} className="py-32 bg-brand-light relative overflow-hidden border-y border-brand-dark/5">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Luxury Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-brand-sand/40 text-brand-primary rounded-full text-[9px] font-black uppercase tracking-[0.4em] border border-brand-primary/10">
                 <Microscope size={14} />
                 <span>{language === 'ar' ? 'تخليق الأنظمة الحيوية' : 'BIOLOGICAL SYNCHRONIZATION'}</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-dark leading-none tracking-tighter">
                Precision <span className="text-brand-primary italic font-normal">Synthesis.</span>
              </h2>
           </div>
           <div className="hidden md:block">
              <span className="text-brand-dark/20 text-[9px] font-black uppercase tracking-[0.4em]">Integrated Control Unit v4.0</span>
           </div>
        </div>

        {/* Clean Split Layout */}
        <div className="grid lg:grid-cols-12 gap-10 items-stretch h-full">
          
          {/* Left: 3 Expressive Protocol Buttons (30% -> 100%) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {protocols.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleGenerate(item.label)}
                className={`group relative w-full flex-1 min-h-[140px] rounded-[36px] overflow-hidden transition-all duration-700 border flex items-center bg-white
                  ${selectedGoal === item.label 
                    ? 'border-brand-primary ring-4 ring-brand-primary/10 shadow-2xl translate-x-4' 
                    : 'border-brand-dark/5 hover:border-brand-primary/30'}`}
              >
                {/* 30% Visibility to 100% on Hover */}
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-brand-sand/5">
                   <img 
                    src={item.img} 
                    className="w-full h-full object-cover opacity-30 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out" 
                    alt={item.label} 
                   />
                </div>
                
                {/* Clean Content Layer */}
                <div className="relative z-10 px-10 flex items-center justify-between w-full">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-xl
                      ${selectedGoal === item.label ? 'bg-brand-primary text-white scale-110' : 'bg-white text-brand-primary border border-brand-dark/5'}`}>
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <span className={`text-[7px] font-black uppercase tracking-[0.5em] block mb-1
                        ${selectedGoal === item.label ? 'text-brand-primary' : 'text-brand-dark/30'}`}>
                        {item.tag}
                      </span>
                      <h3 className={`text-2xl font-serif font-bold transition-colors
                        ${selectedGoal === item.label ? 'text-brand-dark' : 'text-brand-dark/70 group-hover:text-brand-dark'}`}>
                        {item.label}
                      </h3>
                    </div>
                  </div>
                  
                  <div className={`transition-all duration-700 ${selectedGoal === item.label ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <ArrowUpRight size={24} className="text-brand-primary" />
                  </div>
                </div>

                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Right: Luxury White Results Engine */}
          <div className="lg:col-span-7">
             <div className="h-full min-h-[500px] bg-white rounded-[56px] border border-brand-dark/5 shadow-[0_40px_100px_-40px_rgba(194,163,107,0.12)] overflow-hidden relative flex flex-col">
                
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 animate-fade-in bg-white/95 backdrop-blur-sm z-20">
                    <div className="relative">
                       <div className="w-20 h-20 rounded-full border-2 border-brand-primary/10 border-t-brand-primary animate-spin" />
                       <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center">
                      <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.8em] animate-pulse">Extracting Bio-Data</span>
                      <div className="w-48 h-0.5 bg-brand-sand rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in">
                    
                    {/* Compact Results Header */}
                    <div className="p-10 border-b border-brand-dark/5 bg-brand-sand/[0.1] flex justify-between items-center">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                             <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em]">SYNTHESIZED BLUEPRINT</span>
                          </div>
                          <h3 className="text-3xl font-serif font-bold text-brand-dark tracking-tighter">Biological <span className="text-brand-primary italic">Output.</span></h3>
                       </div>
                       <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-brand-dark/5 text-center">
                          <span className="text-[6px] font-black text-brand-primary uppercase tracking-widest block mb-1">TOTAL CALORIES</span>
                          <span className="text-3xl font-serif font-bold text-brand-dark">{result.totalCalories}</span>
                       </div>
                    </div>

                    {/* Meal Grid */}
                    <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                       {[
                         { l: 'SUNRISE', i: <Sun size={20} />, d: result.breakfast },
                         { l: 'ZENITH', i: <CloudSun size={20} />, d: result.lunch },
                         { l: 'TWILIGHT', i: <Moon size={20} />, d: result.dinner }
                       ].map((m, idx) => (
                         <div key={idx} className="group/meal flex flex-col p-8 rounded-[40px] bg-brand-sand/[0.05] border border-brand-dark/[0.02] hover:bg-white hover:shadow-2xl transition-all duration-700">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-primary shadow-sm mb-6 border border-brand-dark/5">
                               {m.i}
                            </div>
                            <div className="space-y-2">
                               <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest">{m.l}</span>
                               <h4 className="text-xl font-serif font-bold text-brand-dark leading-tight line-clamp-2">{m.d?.name}</h4>
                               <p className="text-[10px] text-brand-dark/40 font-medium italic leading-relaxed line-clamp-3">
                                 {m.d?.description}
                               </p>
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Laboratory Advice Footer */}
                    <div className="m-10 p-8 bg-brand-dark rounded-[40px] flex items-center gap-8 border border-brand-primary/10">
                       <div className="shrink-0 w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                          <Sparkles size={20} />
                       </div>
                       <p className="text-white/60 text-[12px] italic font-medium leading-relaxed">
                         "{result.advice}"
                       </p>
                    </div>

                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-fade-in">
                     <div className="relative">
                        <Microscope size={64} strokeWidth={1} className="text-brand-dark/10" />
                        <div className="absolute -inset-8 border border-brand-primary/10 rounded-full animate-pulse-slow" />
                     </div>
                     <div className="space-y-3">
                        <h4 className="text-2xl font-serif font-bold text-brand-dark opacity-30">System Idle.</h4>
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-brand-dark/20 max-w-[200px] mx-auto leading-loose">Select a biological target to initialize the synthesis engine.</p>
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

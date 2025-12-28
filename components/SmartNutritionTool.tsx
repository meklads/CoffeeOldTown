
import React, { useState, useRef } from 'react';
import { ShieldPlus, Zap, Activity, Sun, CloudSun, Moon, ArrowUpRight, BrainCircuit, AlertCircle, Sparkles, Atom, RefreshCw } from 'lucide-react';
import { SectionId, DayPlan } from '../types.ts';
import { generateMealPlan } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';

const SmartNutritionTool: React.FC = () => {
  const { selectedGoal, setSelectedGoal, feedbackHistory, language, currentPersona } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DayPlan | null>(null);
  const chamberRef = useRef<HTMLDivElement>(null);

  const isAr = language === 'ar';

  const protocols = [
    { id: 'immunity', label: isAr ? 'تعزيز المناعة' : 'Immunity Boost', icon: <ShieldPlus size={22} />, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', color: 'border-orange-500/50', accent: 'text-orange-500' },
    { id: 'recovery', label: isAr ? 'الاستشفاء الحيوي' : 'Bio-Recovery', icon: <Activity size={22} />, img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80', color: 'border-blue-500/50', accent: 'text-blue-500' },
    { id: 'focus', label: isAr ? 'التركيز الذهني' : 'Neural Focus', icon: <Zap size={22} />, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', color: 'border-[#C2A36B]/50', accent: 'text-[#C2A36B]' }
  ];

  const handleGenerate = async (goalLabel: string) => {
    if (loading) return;
    setSelectedGoal(goalLabel);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const plan = await generateMealPlan({ goal: goalLabel, diet: 'balanced', persona: currentPersona }, language, feedbackHistory);
      if (plan) {
        setResult(plan);
        chamberRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error("Empty Result");
      }
    } catch (err: any) {
      console.error("Synthesis failed:", err);
      setError(isAr ? 'فشل التخليق الحيوي. الموديل مشغول حالياً.' : 'Synthesis failed. System overloaded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={SectionId.PHASE_03_SYNTHESIS} className="relative py-32 bg-brand-light dark:bg-brand-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-dark dark:bg-white/5 border border-white/10 text-brand-primary rounded-full">
                 <Atom size={12} className="animate-spin-slow" />
                 <span className="text-[8px] font-black uppercase tracking-[0.5em]">{isAr ? 'وحدة التخليق العصبي' : 'NEURAL_SYNTHESIS_UNIT'}</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-none">
                Bio <span className="text-brand-primary italic font-normal">Synthesis.</span>
              </h2>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch min-h-[500px]">
          <div className="lg:col-span-4 flex flex-col gap-6">
            {protocols.map((item) => (
              <button key={item.id} onClick={() => handleGenerate(item.label)}
                className={`group relative overflow-hidden rounded-[45px] border-2 h-[150px] flex flex-col justify-end p-8 text-left transition-all duration-500
                  ${selectedGoal === item.label ? `${item.color.replace('/50', '')} shadow-glow scale-[1.02]` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 grayscale hover:grayscale-0'}`}
              >
                <div className="absolute inset-0"><img src={item.img} className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[2s]" alt={item.label} /><div className="absolute inset-0 bg-brand-dark/60" /></div>
                <div className="relative z-10 flex items-center justify-between w-full text-white">
                   <div className="flex items-center gap-4">{item.icon} <h3 className="text-xl font-serif font-bold tracking-tight">{item.label}</h3></div>
                   <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          <div ref={chamberRef} className="lg:col-span-8">
             <div className="h-full bg-white dark:bg-zinc-900 rounded-[60px] border-2 border-brand-primary/10 shadow-4xl relative overflow-hidden flex flex-col min-h-[500px]">
                {loading ? (
                  <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white">
                    <div className="relative">
                       <Sparkles size={60} className="text-brand-primary animate-pulse mb-8" />
                       <div className="absolute -inset-4 border border-brand-primary/20 rounded-full animate-ping" />
                    </div>
                    <h4 className="text-2xl font-serif font-bold italic animate-pulse tracking-widest">{isAr ? 'تخليق الخطة الأيضية...' : 'Synthesizing Blueprint...'}</h4>
                  </div>
                ) : error ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-fade-in">
                     <AlertCircle size={60} className="text-red-500 animate-bounce" />
                     <div className="space-y-2">
                        <h4 className="text-2xl font-serif font-bold text-red-500">{isAr ? 'خطأ في التخليق' : 'Synthesis Error'}</h4>
                        <p className="text-brand-dark/40 dark:text-white/30 text-sm font-medium italic">{error}</p>
                     </div>
                     <button onClick={() => selectedGoal && handleGenerate(selectedGoal)} className="px-12 py-4 bg-brand-dark text-white rounded-2xl font-black text-[10px] tracking-[0.4em] hover:bg-brand-primary transition-all">
                        {isAr ? 'إعادة المحاولة' : 'RETRY CONNECTION'}
                     </button>
                   </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in p-10 overflow-y-auto no-scrollbar">
                    <div className="mb-8 flex justify-between items-center border-b border-brand-dark/5 dark:border-white/10 pb-6">
                       <div className="space-y-1">
                          <h3 className="text-3xl font-serif font-bold text-brand-dark dark:text-white">{isAr ? 'المخطط الحيوي' : 'Bio Blueprint.'}</h3>
                          <span className="text-[8px] font-black uppercase tracking-[0.5em] text-brand-primary">Verified by Gemini Flash</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="bg-brand-primary text-white px-6 py-2 rounded-xl font-bold shadow-glow">{result.totalCalories} KCAL</div>
                          <button onClick={() => setResult(null)} className="p-2 text-brand-dark/20 dark:text-white/20 hover:text-brand-primary transition-all">
                             <RefreshCw size={18} />
                          </button>
                       </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                       {[ {l: 'Breakfast', i: <Sun />, d: result.breakfast}, {l: 'Lunch', i: <CloudSun />, d: result.lunch}, {l: 'Dinner', i: <Moon />, d: result.dinner} ].map((m, i) => (
                         <div key={i} className="p-6 bg-brand-cream/30 dark:bg-white/5 rounded-[35px] border border-brand-dark/5 dark:border-white/5 text-center transition-all hover:border-brand-primary/20 hover:scale-[1.02] duration-500">
                            <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-4 shadow-xl">
                               {m.i}
                            </div>
                            <h5 className="font-serif font-bold text-brand-dark dark:text-white mb-2 leading-tight text-lg">{m.d.name}</h5>
                            <p className="text-[10px] text-brand-dark/50 dark:text-white/40 italic line-clamp-2 leading-relaxed">{m.d.description}</p>
                         </div>
                       ))}
                    </div>
                    <div className="mt-8 p-10 bg-brand-dark text-brand-primary rounded-[45px] italic font-serif text-xl border border-brand-primary/20 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                         <BrainCircuit size={40} />
                      </div>
                      "{result.advice}"
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-10 opacity-20">
                     <BrainCircuit size={80} className="text-brand-primary animate-pulse" />
                     <div className="space-y-4">
                        <h4 className="text-3xl font-serif font-bold italic tracking-tighter">{isAr ? 'جاهز للتخليق' : 'Ready for Synthesis.'}</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">{isAr ? 'بانتظار اختيار البروتوكول' : 'Awaiting Protocol Input'}</p>
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

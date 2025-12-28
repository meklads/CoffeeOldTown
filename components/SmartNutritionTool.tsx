
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
    { id: 'immunity', label: isAr ? 'تعزيز المناعة' : 'Immunity Boost', icon: <ShieldPlus size={22} />, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', color: 'border-orange-500/50' },
    { id: 'recovery', label: isAr ? 'الاستشفاء الحيوي' : 'Bio-Recovery', icon: <Activity size={22} />, img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80', color: 'border-blue-500/50' },
    { id: 'focus', label: isAr ? 'التركيز الذهني' : 'Neural Focus', icon: <Zap size={22} />, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', color: 'border-[#C2A36B]/50' }
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
      console.error("Synthesis error:", err);
      setError(isAr ? 'فشل التخليق الحيوي. يرجى المحاولة لاحقاً.' : 'Synthesis failed. Please try again.');
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
                className={`group relative overflow-hidden rounded-[45px] border-2 h-[150px] flex flex-col justify-end p-8 text-left transition-all
                  ${selectedGoal === item.label ? `${item.color.replace('/50', '')} shadow-xl scale-[1.02]` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 grayscale hover:grayscale-0'}`}
              >
                <div className="absolute inset-0"><img src={item.img} className="w-full h-full object-cover opacity-20" alt={item.label} /><div className="absolute inset-0 bg-brand-dark/60" /></div>
                <div className="relative z-10 flex items-center justify-between w-full text-white">
                   <div className="flex items-center gap-4">{item.icon} <h3 className="text-xl font-serif font-bold">{item.label}</h3></div>
                   <ArrowUpRight size={20} />
                </div>
              </button>
            ))}
          </div>

          <div ref={chamberRef} className="lg:col-span-8">
             <div className="h-full bg-white dark:bg-zinc-900 rounded-[60px] border-2 border-brand-primary/10 shadow-glow relative overflow-hidden flex flex-col min-h-[500px]">
                {loading ? (
                  <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white">
                    <Sparkles size={40} className="text-brand-primary animate-pulse mb-8" />
                    <h4 className="text-2xl font-serif font-bold italic animate-pulse">{isAr ? 'تخليق الوجبات الحيوية...' : 'Synthesizing Meals...'}</h4>
                  </div>
                ) : error ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8">
                     <AlertCircle size={40} className="text-red-500" />
                     <h4 className="text-xl font-serif font-bold text-red-500">{error}</h4>
                     <button onClick={() => selectedGoal && handleGenerate(selectedGoal)} className="px-10 py-4 bg-brand-dark text-white rounded-2xl font-black text-[10px] tracking-widest">{isAr ? 'إعادة المحاولة' : 'RETRY'}</button>
                   </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in p-10 overflow-y-auto no-scrollbar">
                    <div className="mb-8 flex justify-between items-center border-b border-brand-dark/5 dark:border-white/5 pb-6">
                       <h3 className="text-3xl font-serif font-bold text-brand-dark dark:text-white">{isAr ? 'المخطط الأيضي' : 'Bio Blueprint.'}</h3>
                       <button onClick={() => setResult(null)} className="p-2 text-brand-dark/20 hover:text-brand-primary transition-colors bg-brand-dark/5 rounded-full">
                          <RefreshCw size={18} />
                       </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                       {[ {l: 'Breakfast', i: <Sun />, d: result.breakfast}, {l: 'Lunch', i: <CloudSun />, d: result.lunch}, {l: 'Dinner', i: <Moon />, d: result.dinner} ].map((m, i) => (
                         <div key={i} className="p-6 bg-brand-cream/30 dark:bg-white/5 rounded-[35px] border border-brand-dark/5 text-center transition-all hover:border-brand-primary/20">
                            <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-brand-primary mx-auto mb-4">{m.i}</div>
                            <h5 className="font-serif font-bold text-brand-dark dark:text-white mb-2 leading-tight">{m.d.name}</h5>
                            <p className="text-[10px] text-brand-dark/50 dark:text-white/40 italic line-clamp-2">{m.d.description}</p>
                         </div>
                       ))}
                    </div>
                    <div className="mt-8 p-8 bg-brand-dark text-brand-primary rounded-[40px] italic font-serif text-lg border border-brand-primary/10">
                      "{result.advice}"
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-10 opacity-20">
                     <BrainCircuit size={64} className="text-brand-primary" />
                     <h4 className="text-3xl font-serif font-bold italic">{isAr ? 'جاهز للتخليق' : 'Ready for Synthesis.'}</h4>
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

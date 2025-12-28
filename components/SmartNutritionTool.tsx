
import React, { useState, useEffect, useRef } from 'react';
import { ShieldPlus, Zap, Activity, Sun, CloudSun, Moon, ArrowUpRight, BrainCircuit, RefreshCw, AlertCircle, Beaker, Atom, Trophy, Microscope, Target } from 'lucide-react';
import { SectionId, DayPlan, BioPersona } from '../types.ts';
import { generateMealPlan } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';

const SmartNutritionTool: React.FC = () => {
  const { selectedGoal, setSelectedGoal, feedbackHistory, language, currentPersona } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DayPlan | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const chamberRef = useRef<HTMLDivElement>(null);
  const prevPersonaRef = useRef<BioPersona>(currentPersona);

  const isAr = language === 'ar';

  const protocols = [
    { 
      id: 'immunity', 
      label: isAr ? 'تعزيز المناعة' : 'Immunity Boost', 
      icon: <ShieldPlus size={22} />, 
      tag: 'RESILIENCE',
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
      code: 'PROT-IMN-01',
      color: 'border-orange-500/50'
    },
    { 
      id: 'recovery', 
      label: isAr ? 'الاستشفاء الحيوي' : 'Bio-Recovery', 
      icon: <Activity size={22} />, 
      tag: 'REPAIR',
      img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80',
      code: 'PROT-REC-04',
      color: 'border-blue-500/50'
    },
    { 
      id: 'focus', 
      label: isAr ? 'التركيز الذهني' : 'Neural Focus', 
      icon: <Zap size={22} />, 
      tag: 'COGNITION',
      img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
      code: 'PROT-NRL-09',
      color: 'border-brand-primary/50'
    }
  ];

  useEffect(() => {
    if (prevPersonaRef.current !== currentPersona) {
      setResult(null);
      setSelectedGoal(null);
      setError(null);
      prevPersonaRef.current = currentPersona;
    }
  }, [currentPersona, setSelectedGoal]);

  const handleGenerate = async (goalLabel: string) => {
    if (loading) return;
    
    setSelectedGoal(goalLabel);
    setLoading(true);
    setError(null);
    setResult(null);
    
    const steps = isAr 
      ? ['ضبط المعايير الحيوية...', 'تفعيل البروتوكول العصبي...', 'تخليق الوجبات المثالية...', 'إتمام المخطط البياني...']
      : ['Adjusting Bio-Params...', 'Activating Neural Link...', 'Synthesizing Meals...', 'Finalizing Blueprint...'];
    
    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStep(steps[stepIdx]);
    }, 2000);

    try {
      const plan = await generateMealPlan({ 
        goal: goalLabel, 
        diet: 'balanced',
        persona: currentPersona 
      }, language, feedbackHistory);
      
      if (plan) {
        setResult(plan);
        if (chamberRef.current) {
          chamberRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch (err: any) {
      setError(isAr ? 'فشل في الاتصال بوحدة التفكير. تأكد من مفتاح الـ API.' : 'Neural link timeout. Please check your API key.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <section id={SectionId.PHASE_03_SYNTHESIS} className="relative py-32 bg-brand-light dark:bg-brand-dark transition-all duration-1000 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-dark dark:bg-white/5 border border-white/10 text-brand-primary rounded-full">
                 <Atom size={12} className="animate-spin-slow" />
                 <span className="text-[8px] font-black uppercase tracking-[0.5em]">{isAr ? 'وحدة التخليق العصبي المباشر' : 'DIRECT_NEURAL_SYNTHESIS'}</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Bio <span className="text-brand-primary italic font-normal">Synthesis.</span>
              </h2>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch h-full">
          <div className="lg:col-span-4 flex flex-col gap-6">
            {protocols.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleGenerate(item.label)}
                className={`group relative overflow-hidden rounded-[45px] transition-all duration-700 border-2 h-[160px] flex flex-col justify-end p-8 text-left
                  ${selectedGoal === item.label 
                    ? `${item.color} shadow-xl scale-[1.03] z-20` 
                    : 'border-brand-dark/5 dark:border-white/5 grayscale-[0.6] hover:grayscale-0 hover:border-brand-primary/40'}`}
              >
                <div className="absolute inset-0">
                   <img src={item.img} className="w-full h-full object-cover" alt={item.label} />
                   <div className="absolute inset-0 bg-brand-dark/80" />
                </div>
                <div className="relative z-10 flex items-center justify-between w-full">
                   <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700
                        ${selectedGoal === item.label ? 'bg-brand-primary text-brand-dark' : 'bg-white/10 text-white'}`}>
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-white">{item.label}</h3>
                   </div>
                   <ArrowUpRight size={20} className="text-white" />
                </div>
              </button>
            ))}
          </div>

          <div ref={chamberRef} className="lg:col-span-8">
             <div className="h-full bg-white dark:bg-zinc-900 rounded-[60px] border border-brand-dark/5 dark:border-white/5 shadow-glow relative overflow-hidden flex flex-col min-h-[600px]">
                {loading ? (
                  <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white">
                    <BrainCircuit size={40} className="text-brand-primary animate-pulse mb-8" />
                    <h4 className="text-2xl font-serif font-bold italic">{loadingStep}</h4>
                  </div>
                ) : error ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8">
                     <AlertCircle size={40} className="text-red-500" />
                     <h4 className="text-2xl font-serif font-bold text-red-500">{error}</h4>
                     <button onClick={() => selectedGoal && handleGenerate(selectedGoal)} className="px-10 py-5 bg-brand-dark text-white rounded-2xl">
                        {isAr ? 'إعادة المحاولة' : 'RETRY'}
                     </button>
                   </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in">
                    <div className="p-10 border-b border-brand-dark/5 dark:border-white/5 bg-brand-cream/20 dark:bg-white/5">
                       <h3 className="text-3xl font-serif font-bold text-brand-dark dark:text-white">{isAr ? 'المخطط الأيضي' : 'Blueprint.'}</h3>
                       <div className="mt-4 bg-brand-dark text-white inline-block px-6 py-3 rounded-2xl font-bold">
                          {result.totalCalories} KCAL
                       </div>
                    </div>
                    <div className="p-8 grid md:grid-cols-3 gap-6 overflow-y-auto no-scrollbar">
                       {[
                         { label: 'SUNRISE', icon: <Sun size={18} />, data: result.breakfast, bg: 'bg-orange-500/5' },
                         { label: 'PEAK', icon: <CloudSun size={18} />, data: result.lunch, bg: 'bg-blue-500/5' },
                         { label: 'ZENITH', icon: <Moon size={18} />, data: result.dinner, bg: 'bg-purple-500/5' }
                       ].map((meal, idx) => (
                         <div key={idx} className={`p-8 rounded-[45px] border border-brand-dark/5 ${meal.bg} text-center`}>
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-brand-primary mx-auto mb-6">
                               {meal.icon}
                            </div>
                            <h5 className="text-xl font-serif font-bold text-brand-dark dark:text-white mb-2">{meal.data.name}</h5>
                            <p className="text-xs text-brand-dark/50 dark:text-white/40 italic">{meal.data.description}</p>
                         </div>
                       ))}
                    </div>
                    <div className="m-8 p-8 bg-brand-primary rounded-[45px] shadow-2xl">
                       <p className="text-sm font-serif font-bold text-brand-dark italic">"{result.advice}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-10 opacity-30">
                     <Beaker size={64} className="text-brand-primary" />
                     <h4 className="text-3xl font-serif font-bold italic">{isAr ? 'جاهز للتخليق' : 'Ready.'}</h4>
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

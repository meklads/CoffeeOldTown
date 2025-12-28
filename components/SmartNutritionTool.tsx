
import React, { useState, useEffect, useRef } from 'react';
import { ShieldPlus, Zap, Activity, Sun, CloudSun, Moon, ArrowUpRight, Sparkles, BrainCircuit, RefreshCw, AlertCircle, Beaker, Atom, Flame, Trophy, ChevronRight, Microscope, Target } from 'lucide-react';
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
      code: 'PROT-IMN-01'
    },
    { 
      id: 'recovery', 
      label: isAr ? 'الاستشفاء الحيوي' : 'Bio-Recovery', 
      icon: <Activity size={22} />, 
      tag: 'REPAIR',
      img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80',
      code: 'PROT-REC-04'
    },
    { 
      id: 'focus', 
      label: isAr ? 'التركيز الذهني' : 'Neural Focus', 
      icon: <Zap size={22} />, 
      tag: 'COGNITION',
      img: 'https://images.unsplash.com/photo-1532634896-26909d0d4b89?w=800&q=80',
      code: 'PROT-NRL-09'
    }
  ];

  // مزامنة ذكية: إذا تغير البروتوكول الأساسي (Persona)، يتم تصفير وحدة التخليق لضمان الدقة
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
    }, 2500);

    try {
      const plan = await generateMealPlan({ 
        goal: goalLabel, 
        diet: 'balanced',
        persona: currentPersona 
      }, language, feedbackHistory);
      
      if (plan) {
        setResult(plan);
        // التمرير التلقائي للنتيجة في الجوال
        if (window.innerWidth < 1024 && chamberRef.current) {
          chamberRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch (err: any) {
      setError(isAr ? 'فشل في الاتصال بوحدة التفكير العميق. حاول ثانية.' : 'Neural link timeout. Please re-initiate synthesis.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <section id={SectionId.PHASE_03_SYNTHESIS} className="relative py-32 bg-brand-light dark:bg-brand-dark transition-all duration-1000 overflow-hidden">
      
      {/* عناصر زخرفية للمختبر */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-dark dark:bg-white/5 border border-white/10 text-brand-primary rounded-full">
                 <Atom size={12} className="animate-spin-slow" />
                 <span className="text-[8px] font-black uppercase tracking-[0.5em]">{isAr ? 'وحدة التخليق العصبي' : 'NEURAL_SYNTHESIS_UNIT'}</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Neural <span className="text-brand-primary italic font-normal">Synthesis.</span>
              </h2>
              <div className="flex items-center gap-3 text-brand-primary/50 text-[10px] font-black uppercase tracking-widest">
                <Target size={12} />
                {isAr ? 'الهدف الأيضي:' : 'BIO-TARGET:'} <span className="text-brand-primary underline decoration-dotted">{currentPersona}</span>
              </div>
           </div>
           <p className="max-w-sm text-brand-dark/40 dark:text-white/30 text-lg font-medium italic border-l-2 border-brand-primary/20 pl-8 hidden md:block">
              {isAr ? 'قم بتوليد خطة تغذية دقيقة مصممة خصيصاً لحالتك الحيوية المختارة.' : 'Generate a precision nutrition plan tailored to your active biological state.'}
           </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch h-full">
          
          {/* قائمة الأهداف/المهام */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {protocols.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleGenerate(item.label)}
                className={`group relative overflow-hidden rounded-[40px] transition-all duration-700 border p-8 text-left h-32 md:h-auto flex flex-col justify-center
                  ${selectedGoal === item.label 
                    ? 'border-brand-primary bg-brand-dark text-white shadow-2xl scale-[1.02] z-20' 
                    : 'border-brand-dark/5 dark:border-white/5 bg-white dark:bg-zinc-900/50 text-brand-dark dark:text-white/60 hover:border-brand-primary/40 hover:scale-[1.01]'}`}
              >
                <div className="flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700
                        ${selectedGoal === item.label ? 'bg-brand-primary text-brand-dark' : 'bg-brand-dark/5 dark:bg-white/5 text-brand-primary'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <span className={`text-[7px] font-black uppercase tracking-widest block mb-1 ${selectedGoal === item.label ? 'text-brand-primary/60' : 'opacity-40'}`}>{item.code}</span>
                        <h3 className="text-2xl font-serif font-bold leading-tight">{item.label}</h3>
                      </div>
                   </div>
                   <ChevronRight size={20} className={`transition-all duration-700 ${selectedGoal === item.label ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                </div>
                {/* تأثير الخلفية عند الاختيار */}
                {selectedGoal === item.label && (
                   <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent pointer-events-none" />
                )}
              </button>
            ))}
            
            {/* بطاقة معلومات البروتوكول الحالي */}
            <div className="mt-4 p-8 bg-brand-primary/5 rounded-[40px] border border-brand-primary/10 space-y-4">
               <div className="flex items-center gap-2 text-brand-primary">
                  <Microscope size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{isAr ? 'حالة المختبر' : 'LAB_STATUS'}</span>
               </div>
               <p className="text-xs font-medium italic text-brand-dark/50 dark:text-white/40 leading-relaxed">
                  {isAr 
                    ? `النظام مُهيأ الآن للعمل وفق بروتوكول ${currentPersona}. جميع الوجبات التي يتم تخليقها ستلتزم بصرامة بمعايير هذا التشفير الحيوي.` 
                    : `System is currently locked into ${currentPersona} protocol. All synthesized blueprints will strictly adhere to this bio-encoding.`}
               </p>
            </div>
          </div>

          {/* غرفة التخليق - عرض النتائج */}
          <div ref={chamberRef} className="lg:col-span-8">
             <div className="h-full bg-white dark:bg-zinc-900 rounded-[55px] border border-brand-dark/5 dark:border-white/5 shadow-glow relative overflow-hidden flex flex-col min-h-[600px]">
                
                {loading ? (
                  <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white">
                    <div className="relative mb-12">
                       <div className="w-32 h-32 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <BrainCircuit size={40} className="text-brand-primary animate-pulse" />
                       </div>
                       <div className="absolute -inset-4 border border-brand-primary/10 rounded-full animate-ping opacity-20" />
                    </div>
                    <div className="space-y-4 max-w-xs">
                       <h4 className="text-2xl font-serif font-bold italic tracking-tight">{loadingStep}</h4>
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-primary/60">{isAr ? 'جاري التفكير العميق لضمان الدقة' : 'DEEP THINKING FOR PRECISION'}</p>
                    </div>
                  </div>
                ) : error ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-fade-in">
                     <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                        <AlertCircle size={40} />
                     </div>
                     <h4 className="text-2xl font-serif font-bold text-red-500 italic">{error}</h4>
                     <button onClick={() => selectedGoal && handleGenerate(selectedGoal)} className="px-10 py-5 bg-brand-dark dark:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all flex items-center gap-3">
                        <RefreshCw size={14} /> {isAr ? 'إعادة التخليق' : 'RE-SYNTHESIZE'}
                     </button>
                   </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in">
                    {/* ترويسة التقرير */}
                    <div className="p-10 border-b border-brand-dark/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center bg-brand-cream/20 dark:bg-white/5">
                       <div className="space-y-1">
                          <h3 className="text-3xl font-serif font-bold text-brand-dark dark:text-white tracking-tight italic">
                            {isAr ? 'المخطط الأيضي' : 'Metabolic Blueprint.'}
                          </h3>
                          <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.5em]">{isAr ? 'تشفير السعرات اليومية' : 'DAILY_CALORIC_ENCODING'}</span>
                       </div>
                       <div className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-2xl shadow-xl mt-4 md:mt-0">
                          <Flame size={16} className="text-brand-primary" />
                          <span className="text-2xl font-serif font-bold">{result.totalCalories} <span className="text-[10px] opacity-60 ml-1">KCAL</span></span>
                       </div>
                    </div>
                    
                    {/* عرض الوجبات */}
                    <div className="p-8 grid md:grid-cols-3 gap-6 flex-grow overflow-y-auto no-scrollbar">
                       {[
                         { label: isAr ? 'الشروق' : 'SUNRISE', icon: <Sun size={18} />, data: result.breakfast, bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
                         { label: isAr ? 'الذروة' : 'PEAK', icon: <CloudSun size={18} />, data: result.lunch, bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
                         { label: isAr ? 'السكينة' : 'ZENITH', icon: <Moon size={18} />, data: result.dinner, bg: 'bg-purple-500/5', border: 'border-purple-500/20' }
                       ].map((meal, idx) => (
                         <div key={idx} className={`p-8 rounded-[45px] border ${meal.border} ${meal.bg} flex flex-col items-center text-center group transition-all duration-500 hover:shadow-xl`}>
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
                               {meal.icon}
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3">{meal.label}</h4>
                            <h5 className="text-xl font-serif font-bold text-brand-dark dark:text-white leading-tight mb-4 min-h-[48px]">{meal.data.name}</h5>
                            <div className="flex gap-2 mb-6">
                               <span className="text-[7px] font-black bg-brand-dark/5 dark:bg-white/5 text-brand-dark dark:text-white/60 px-3 py-1 rounded-full">{meal.data.calories} KCAL</span>
                               <span className="text-[7px] font-black bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full">{meal.data.protein} PROTEIN</span>
                            </div>
                            <p className="text-[10px] text-brand-dark/50 dark:text-white/40 italic leading-relaxed font-medium">
                               {meal.data.description}
                            </p>
                         </div>
                       ))}
                    </div>

                    {/* نصيحة الخبير (تذييل) */}
                    <div className="m-8 mt-0 p-10 bg-brand-primary rounded-[45px] flex items-center gap-8 shadow-2xl relative overflow-hidden group">
                       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <Trophy size={32} className="text-brand-dark shrink-0 animate-bounce" />
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-brand-dark uppercase tracking-[0.4em] opacity-50">{isAr ? 'توصية المختبر النهائية' : 'FINAL LAB RECOMMENDATION'}</span>
                          <p className="text-md font-serif font-bold text-brand-dark italic leading-tight">"{result.advice}"</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  /* واجهة الجاهزية/المزامنة */
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-10 animate-fade-in">
                     <div className="relative">
                        <Beaker size={64} strokeWidth={1} className="text-brand-primary/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Microscope size={28} className="text-brand-primary animate-pulse" />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-3xl font-serif font-bold text-brand-dark/60 dark:text-white/40 italic">
                          {isAr ? 'بانتظار تفعيل بروتوكول التخليق' : 'Awaiting Synthesis Activation.'}
                        </h4>
                        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-brand-primary/40">
                          {isAr ? `نظام المختبر مُعد حالياً لوضع: ${currentPersona}` : `LAB CURRENTLY CONFIGURED FOR: ${currentPersona}`}
                        </p>
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

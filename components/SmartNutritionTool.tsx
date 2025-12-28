
import React, { useState, useRef } from 'react';
import { ShieldPlus, Zap, Activity, Sun, CloudSun, Moon, ArrowUpRight, BrainCircuit, AlertCircle, Sparkles, Atom, RefreshCw, ChevronRight, Fingerprint } from 'lucide-react';
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
    { id: 'focus', label: isAr ? 'التركيز الذهني' : 'Neural Focus', icon: <Zap size={22} />, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', color: 'border-brand-primary/50', accent: 'text-brand-primary' },
    { id: 'recovery', label: isAr ? 'الاستشفاء الحيوي' : 'Bio-Recovery', icon: <Activity size={22} />, img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80', color: 'border-blue-500/50', accent: 'text-blue-500' },
    { id: 'immunity', label: isAr ? 'تعزيز المناعة' : 'Immunity Boost', icon: <ShieldPlus size={22} />, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', color: 'border-orange-500/50', accent: 'text-orange-500' }
  ];

  const handleGenerate = async (goalLabel: string) => {
    if (loading) return;
    setSelectedGoal(goalLabel);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const plan = await generateMealPlan(
        { goal: goalLabel, diet: 'balanced', persona: currentPersona }, 
        language, 
        feedbackHistory
      );
      
      // Safety check: ensure plan and its primary expected meals exist, and it's not an error response
      if (plan && !('error' in plan) && (plan.breakfast || plan.lunch || plan.dinner)) {
        setResult(plan);
        // Defer scroll to ensure DOM has updated with the results
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (chamberRef.current) {
              chamberRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        });
      } else {
        const errorMsg = (plan as any)?.message || "Malformed Response";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("Synthesis failed:", err);
      setError(isAr ? 'فشل التخليق الحيوي. يرجى التحقق من مفتاح API أو المحاولة لاحقاً.' : 'Synthesis failed. Please check API key or retry later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={SectionId.PHASE_03_SYNTHESIS} className="relative py-32 bg-brand-light dark:bg-brand-dark overflow-hidden transition-all duration-1000">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 border border-white/5 text-brand-primary rounded-full shadow-2xl">
                 <Atom size={14} className="animate-spin-slow" />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'وحدة التخليق الحيوي 2.0' : 'BIO-SYNTHESIS UNIT 2.0'}</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Neural <br /> <span className="text-brand-primary italic font-normal">{isAr ? 'التخليق.' : 'Synthesis.'}</span>
              </h2>
           </div>
           
           <div className="bg-brand-primary/5 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-brand-primary/10 max-w-sm hidden md:block">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
                    <Fingerprint size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{isAr ? 'مزامنة البروتوكول' : 'PROTOCOL SYNC'}</span>
              </div>
              <p className="text-xs text-brand-dark/40 dark:text-white/30 italic font-medium">
                {isAr ? `يتم الآن تخصيص النتائج بناءً على "${currentPersona}" لضمان توافق حيوي كامل.` : `Currently tailoring output based on "${currentPersona}" for full metabolic alignment.`}
              </p>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Goal Selectors */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {protocols.map((item) => (
              <button key={item.id} onClick={() => handleGenerate(item.label)}
                className={`group relative overflow-hidden rounded-[45px] border-2 h-[160px] flex flex-col justify-end p-8 text-left transition-all duration-700
                  ${selectedGoal === item.label ? `${item.color} shadow-glow scale-[1.02] z-10` : 'bg-white dark:bg-zinc-900 border-brand-dark/5 dark:border-white/5 grayscale hover:grayscale-0'}`}
              >
                <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                  <img src={item.img} className="w-full h-full object-cover opacity-10" alt={item.label} />
                  <div className={`absolute inset-0 bg-gradient-to-t ${selectedGoal === item.label ? 'from-brand-dark/90' : 'from-brand-dark/40'} via-transparent to-transparent`} />
                </div>
                
                <div className="relative z-10 flex items-center justify-between w-full text-white">
                   <div className="space-y-2">
                      <div className={`transition-colors ${selectedGoal === item.label ? 'text-brand-primary' : 'text-white/40'}`}>{item.icon}</div>
                      <h3 className="text-2xl font-serif font-bold tracking-tight">{item.label}</h3>
                   </div>
                   <div className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-all ${selectedGoal === item.label ? 'bg-brand-primary text-brand-dark rotate-0' : 'bg-white/5 text-white/20 rotate-45 group-hover:rotate-0'}`}>
                      <ChevronRight size={20} />
                   </div>
                </div>
              </button>
            ))}
          </div>

          {/* Results Chamber */}
          <div ref={chamberRef} className="lg:col-span-8">
             <div className="h-full bg-white dark:bg-zinc-900/50 rounded-[65px] border-2 border-brand-primary/10 shadow-4xl relative overflow-hidden flex flex-col min-h-[550px] backdrop-blur-3xl transition-all duration-1000">
                
                {loading ? (
                  <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center text-white">
                    <div className="relative mb-10">
                       <Sparkles size={80} className="text-brand-primary animate-pulse" />
                       <div className="absolute -inset-8 border-2 border-brand-primary/20 rounded-full animate-ping" />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-3xl font-serif font-bold italic animate-pulse tracking-widest">{isAr ? 'جاري بناء المخطط الحيوي...' : 'Synthesizing Bio-Blueprint...'}</h4>
                       <p className="text-[10px] text-brand-primary/40 font-black uppercase tracking-[0.5em]">Protocol: {currentPersona}</p>
                    </div>
                  </div>
                ) : error ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-fade-in">
                     <AlertCircle size={70} className="text-red-500/50 animate-bounce" />
                     <div className="space-y-2">
                        <h4 className="text-3xl font-serif font-bold text-red-500">{isAr ? 'خلل في التخليق' : 'Synthesis Disruption'}</h4>
                        <p className="text-brand-dark/40 dark:text-white/30 text-base font-medium italic">{error}</p>
                     </div>
                     <button onClick={() => selectedGoal && handleGenerate(selectedGoal)} className="px-12 py-5 bg-brand-dark text-white rounded-[25px] font-black text-[10px] tracking-[0.4em] hover:bg-brand-primary transition-all shadow-glow">
                        {isAr ? 'إعادة الربط العصبي' : 'RETRY NEURAL LINK'}
                     </button>
                   </div>
                ) : result ? (
                  <div className="flex flex-col h-full animate-fade-in-up p-12 overflow-y-auto no-scrollbar">
                    
                    <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-brand-dark/5 dark:border-white/5 pb-10">
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse shadow-glow" />
                             <h3 className="text-4xl font-serif font-bold text-brand-dark dark:text-white">{isAr ? 'المخطط النهائي' : 'The Final Blueprint.'}</h3>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-primary">{currentPersona} MODALITY ACTIVATED</p>
                       </div>
                       
                       <div className="flex items-center gap-4 bg-brand-dark/5 dark:bg-white/5 p-4 rounded-3xl border border-brand-primary/10">
                          <div className="text-right">
                             <span className="block text-[8px] font-black uppercase text-brand-primary/50 tracking-widest">{isAr ? 'إجمالي الطاقة' : 'TOTAL LOAD'}</span>
                             <span className="text-3xl font-serif font-bold text-brand-primary">{result?.totalCalories || '---'}</span>
                          </div>
                          <span className="text-xs font-bold text-brand-primary/30 mt-4 tracking-tighter">KCAL</span>
                          <button onClick={() => setResult(null)} className="ml-4 p-3 bg-brand-dark text-white rounded-2xl hover:bg-brand-primary transition-all">
                             <RefreshCw size={18} />
                          </button>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {[ 
                         {l: isAr ? 'الإفطار' : 'Breakfast', i: <Sun />, d: result?.breakfast, bg: 'bg-orange-500/5 text-orange-500' }, 
                         {l: isAr ? 'الغداء' : 'Lunch', i: <CloudSun />, d: result?.lunch, bg: 'bg-blue-500/5 text-blue-500' }, 
                         {l: isAr ? 'العشاء' : 'Dinner', i: <Moon />, d: result?.dinner, bg: 'bg-indigo-500/5 text-indigo-500' },
                         {l: isAr ? 'سناك' : 'Snack', i: <Zap />, d: result?.snack, bg: 'bg-brand-primary/5 text-brand-primary' }
                       ].map((m, i) => (
                         <div key={i} className="group/card p-8 bg-brand-cream/10 dark:bg-white/5 rounded-[45px] border border-brand-dark/5 dark:border-white/5 text-center transition-all hover:bg-white dark:hover:bg-brand-dark/80 hover:shadow-3xl hover:-translate-y-2 duration-700">
                            <div className={`w-14 h-14 ${m.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover/card:scale-110 transition-transform`}>
                               {m.i}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-brand-dark/30 dark:text-white/20 mb-2 block">{m.l}</span>
                            <h5 className="font-serif font-bold text-brand-dark dark:text-white mb-3 text-lg leading-tight line-clamp-2">{m.d?.name || (isAr ? 'عينة قيد البرمجة' : 'Sample Encoding')}</h5>
                            <div className="text-[10px] text-brand-primary font-bold mb-4">{m.d?.calories || '---'} KCAL</div>
                            <p className="text-[10px] text-brand-dark/40 dark:text-white/20 italic line-clamp-2 leading-relaxed opacity-0 group-hover/card:opacity-100 transition-opacity">
                               {m.d?.description || (isAr ? 'يتم تحليل المكونات الجزيئية لهذه الوجبة.' : 'Analyzing molecular substrates of this meal.')}
                            </p>
                         </div>
                       ))}
                    </div>

                    <div className="mt-12 p-10 bg-brand-dark dark:bg-zinc-950 text-brand-primary rounded-[50px] border border-brand-primary/20 shadow-glow relative overflow-hidden group/advice">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl group-hover/advice:bg-brand-primary/10 transition-all" />
                      <div className="relative z-10 flex gap-8 items-start">
                         <BrainCircuit size={40} className="shrink-0 animate-pulse text-brand-primary/40" />
                         <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">{isAr ? 'توصية المختبر العصبية' : 'LAB NEURAL ADVISORY'}</span>
                            <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/90">
                               "{result?.advice || (isAr ? 'استمر في الالتزام بالبروتوكول لضمان أفضل استقرار لعملياتك الحيوية.' : 'Adhere to protocol parameters for optimal biometric stability.')}"
                            </p>
                         </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-12 animate-fade-in opacity-40">
                     <div className="relative">
                        <BrainCircuit size={100} className="text-brand-primary animate-pulse-slow" />
                        <div className="absolute -inset-4 border border-brand-primary/5 rounded-full animate-spin-slow" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-4xl font-serif font-bold italic tracking-tighter text-brand-dark dark:text-white">{isAr ? 'جاهز للتخليق.' : 'Ready for Synthesis.'}</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-brand-primary">
                          {isAr ? `في انتظار تحديد هدفك لبروتوكول ${currentPersona}` : `Awaiting goal input for ${currentPersona} Protocol`}
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

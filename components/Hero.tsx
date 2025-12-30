
import React, { useState, useRef, useEffect } from 'react';
import { Utensils, Zap, HeartPulse, Baby, ShieldAlert, Check, BrainCircuit, RefreshCcw, UploadCloud, AlertCircle, Sparkles, Radio, Cpu, Settings2, Camera, Search, Activity, ThermometerSun, Droplets, Link2, FileText, BarChart3 } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language, isApiKeyLinked, setIsApiKeyLinked } = useApp();
  const [image, setImage] = useState<string | null>(lastAnalysisResult?.imageUrl || null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>(lastAnalysisResult ? 'success' : 'idle');
  const [errorType, setErrorType] = useState<'GENERIC' | 'AUTH'>('GENERIC');
  const [scanProgress, setScanProgress] = useState(0);
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== 'loading') {
      setStatus('idle');
      setScanProgress(0);
      setLastAnalysisResult(null);
    }
  }, [currentPersona]);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        const linked = await window.aistudio.hasSelectedApiKey();
        setIsApiKeyLinked(linked);
      }
    };
    checkKey();
  }, [setIsApiKeyLinked]);

  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, accent: string, color: string, ring: string }> = {
    GENERAL: { label: isAr ? 'بروتوكول عام' : 'GENERAL PROTOCOL', icon: <Utensils size={20} />, accent: 'text-[#C2A36B]', color: 'bg-[#C2A36B]', ring: 'ring-[#C2A36B]/20' },
    ATHLETE: { label: isAr ? 'الرياضي' : 'ATHLETE MODE', icon: <Zap size={20} />, accent: 'text-orange-500', color: 'bg-orange-500', ring: 'ring-orange-500/20' },
    DIABETIC: { label: isAr ? 'السكري' : 'DIABETIC CARE', icon: <HeartPulse size={20} />, accent: 'text-blue-500', color: 'bg-blue-500', ring: 'ring-blue-500/20' },
    PREGNANCY: { label: isAr ? 'الحامل' : 'PREGNANCY SAFE', icon: <Baby size={20} />, accent: 'text-pink-500', color: 'bg-pink-500', ring: 'ring-pink-500/20' }
  };

  const handleLinkKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setIsApiKeyLinked(true);
        if (status === 'error') handleAnalyze(); 
        return true;
      } catch (e) { return false; }
    }
    return false;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStatus('idle');
        setLastAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setScanProgress(5);
    try {
      // Logic for progress animation - keeps tools stable
      const timer = setInterval(() => setScanProgress(p => p >= 90 ? 90 : p + 5), 300);
      const result = await analyzeMealImage(image, { 
        chronicDiseases: "none", dietProgram: "general", activityLevel: "moderate", persona: currentPersona 
      }, language);
      clearInterval(timer);
      setScanProgress(100);
      
      if (result) {
        setLastAnalysisResult(result);
        incrementScans(result);
        setStatus('success');
      }
    } catch (err: any) {
      setStatus('error');
      setScanProgress(0);
      if (err.message === "KEY_AUTH_FAILED" || err.message === "API_KEY_MISSING") {
        setErrorType('AUTH');
      } else {
        setErrorType('GENERIC');
      }
    }
  };

  const resetScanner = () => {
    setImage(null);
    setStatus('idle');
    setLastAnalysisResult(null);
    setScanProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen pt-24 pb-20 bg-brand-light dark:bg-brand-dark overflow-hidden flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          <div className="lg:col-span-5 space-y-10 animate-fade-in order-2 lg:order-1 lg:sticky lg:top-32">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                 <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-white/5 shadow-2xl">
                    <ShieldAlert size={14} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'نظام النبض 5.0' : 'PULSE SYSTEM 5.0'}</span>
                 </div>
                 <button onClick={handleLinkKey} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isApiKeyLinked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary animate-pulse'}`}>
                    <Radio size={12} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isApiKeyLinked ? (isAr ? 'رابط نشط' : 'LINK ACTIVE') : (isAr ? 'رابط السحابة' : 'LINK CLOUD')}</span>
                 </button>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Bio-Metric <br /> <span className={`${personaConfigs[currentPersona].accent} italic`}>{isAr ? 'التشخيص.' : 'Diagnostics.'}</span>
              </h1>
              <p className="text-brand-dark/40 dark:text-white/30 text-lg italic max-w-sm">
                {isAr ? 'تحليل العينة الأيضية وفك شفرة التركيب الجزيئي للغذاء.' : 'Decoding metabolic samples and food molecular structures.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(personaConfigs) as BioPersona[]).map((key) => (
                <button key={key} onClick={() => setCurrentPersona(key)}
                  className={`p-6 rounded-[35px] border transition-all h-[120px] flex flex-col justify-between text-left relative overflow-hidden group
                    ${currentPersona === key ? `${personaConfigs[key].color} text-white shadow-2xl scale-[1.02]` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40 hover:border-brand-primary/20'}`}
                >
                  <div className="flex justify-between relative z-10">
                    <div className={`${currentPersona === key ? 'text-white' : 'text-brand-primary'}`}>{personaConfigs[key].icon}</div>
                    {currentPersona === key && <Check size={14} className="animate-in zoom-in" />}
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10">{personaConfigs[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center order-1 lg:order-2 w-full">
             <div className={`relative w-full max-w-[620px] bg-white dark:bg-[#0D0D0D] rounded-[60px] md:rounded-[80px] border-2 transition-all duration-700 ${status === 'loading' ? 'border-brand-primary shadow-glow' : 'border-brand-dark/5 dark:border-white/10'} shadow-4xl overflow-hidden min-h-[600px] flex flex-col`}>
                
                {image ? (
                   <div className="relative flex-grow flex flex-col">
                      <div className={`relative w-full transition-all duration-700 ${status === 'success' ? 'h-40 md:h-52' : 'h-[600px]'}`}>
                        <img src={image} className="w-full h-full object-cover" alt="Meal Specimen" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
                        
                        {status === 'loading' && (
                          <div className="absolute inset-0 bg-brand-dark/85 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-white z-50">
                             <Cpu size={70} className="text-brand-primary animate-spin-slow mb-6" />
                             <h3 className="text-2xl font-serif font-bold italic mb-4">{isAr ? 'جاري التحليل الأيضي...' : 'Metabolic Analysis...'}</h3>
                             <div className="w-full max-w-[240px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary shadow-glow transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                             </div>
                          </div>
                        )}
                      </div>

                      {status === 'success' && lastAnalysisResult && (
                        <div className="flex-grow bg-white dark:bg-[#0D0D0D] p-8 md:p-12 animate-fade-in-up space-y-12 overflow-y-auto no-scrollbar">
                           {/* Main Identity Header */}
                           <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-brand-dark/5 dark:border-white/5 pb-8">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                   <Activity size={18} className={personaConfigs[currentPersona].accent} />
                                   <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{isAr ? 'تم التحقق من العينة' : 'SPECIMEN VERIFIED'}</span>
                                </div>
                                <h4 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark dark:text-white leading-tight tracking-tighter">{lastAnalysisResult.summary}</h4>
                              </div>
                              <div className={`flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full border-2 ${personaConfigs[currentPersona].ring} ring-8 ring-offset-4 ring-offset-transparent shadow-2xl`}>
                                 <span className={`text-3xl md:text-4xl font-serif font-bold ${personaConfigs[currentPersona].accent}`}>{lastAnalysisResult.healthScore}</span>
                                 <span className="text-[8px] font-black uppercase tracking-widest opacity-40">VITALITY</span>
                              </div>
                           </div>

                           {/* Macro Stats Grid */}
                           <div className="grid grid-cols-3 gap-6">
                              {[
                                { label: isAr ? 'بروتين' : 'PROTEIN', value: lastAnalysisResult.macros.protein, color: 'bg-orange-500', icon: <Zap size={12} /> },
                                { label: isAr ? 'كربوهيدرات' : 'CARBS', value: lastAnalysisResult.macros.carbs, color: 'bg-blue-500', icon: <ThermometerSun size={12} /> },
                                { label: isAr ? 'دهون' : 'FAT', value: lastAnalysisResult.macros.fat, color: 'bg-emerald-500', icon: <Droplets size={12} /> }
                              ].map((m, i) => (
                                <div key={i} className="space-y-3">
                                   <div className="flex justify-between items-center px-1">
                                      <span className="text-[9px] font-black opacity-40 flex items-center gap-2">{m.icon} {m.label}</span>
                                      <span className="text-xs font-bold text-brand-dark dark:text-white">{m.value}g</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-brand-dark/5 dark:bg-white/5 rounded-full overflow-hidden">
                                      <div className={`h-full ${m.color} transition-all duration-1000 delay-300`} style={{ width: `${Math.min(100, m.value * 1.5)}%` }} />
                                   </div>
                                </div>
                              ))}
                           </div>

                           {/* Calories & Ingredients Section */}
                           <div className="grid md:grid-cols-2 gap-10">
                              <div className="space-y-4">
                                 <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">{isAr ? 'التركيب المكتشف' : 'DETECTED COMPOSITION'}</span>
                                 <div className="flex flex-wrap gap-2">
                                    {lastAnalysisResult.ingredients.map((ing, i) => (
                                       <span key={i} className="px-3 py-2 bg-brand-dark/5 dark:bg-white/5 border border-brand-dark/5 dark:border-white/10 rounded-xl text-[10px] font-bold text-brand-dark dark:text-white/70">
                                          {ing.name} <span className="opacity-30 ml-1">{ing.calories} kcal</span>
                                       </span>
                                    ))}
                                 </div>
                              </div>
                              <div className="bg-brand-dark dark:bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center border border-white/5">
                                 <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1">{isAr ? 'الحمل السعري' : 'CALORIC LOAD'}</span>
                                 <span className="text-3xl font-serif font-bold text-white">{lastAnalysisResult.totalCalories}</span>
                                 <span className="text-[9px] font-bold text-brand-primary/40 uppercase">KCAL / Unit</span>
                              </div>
                           </div>

                           {/* AI Advice Block */}
                           <div className={`p-8 rounded-[40px] border border-brand-primary/10 relative overflow-hidden group/advice ${personaConfigs[currentPersona].color}/5`}>
                              <div className="absolute top-0 right-0 p-4 opacity-5"><BrainCircuit size={40} className={personaConfigs[currentPersona].accent} /></div>
                              <div className="relative z-10 space-y-2">
                                 <span className={`text-[9px] font-black uppercase tracking-widest ${personaConfigs[currentPersona].accent}`}>{isAr ? 'نصيحة البروتوكول' : 'PROTOCOL ADVICE'}</span>
                                 <p className="text-lg font-serif italic text-brand-dark dark:text-white/90 leading-relaxed italic">
                                    "{lastAnalysisResult.personalizedAdvice}"
                                 </p>
                              </div>
                           </div>

                           <div className="flex flex-col sm:flex-row gap-4 pt-4">
                              <button onClick={resetScanner} className="flex-grow py-5 bg-brand-dark text-white rounded-[25px] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-brand-primary transition-all flex items-center justify-center gap-3">
                                 <RefreshCcw size={14} /> {isAr ? 'عينة جديدة' : 'NEW SPECIMEN'}
                              </button>
                              <button onClick={() => window.print()} className="px-10 py-5 border-2 border-brand-dark/5 dark:border-white/10 rounded-[25px] text-[10px] font-black uppercase tracking-widest hover:border-brand-primary transition-all text-brand-dark dark:text-white">
                                 {isAr ? 'تقرير PDF' : 'PRINT PDF'}
                              </button>
                           </div>
                        </div>
                      )}

                      {status === 'error' && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center text-white z-50 animate-in fade-in">
                           <AlertCircle size={48} className="text-red-500 animate-pulse mb-6" />
                           {errorType === 'AUTH' ? (
                             <div className="space-y-6">
                               <h3 className="text-2xl font-serif font-bold mb-4">{isAr ? 'مطلوب ربط المفتاح' : 'Key Link Required'}</h3>
                               <p className="text-sm text-white/50 mb-10 italic leading-relaxed">
                                  {isAr ? 'بيئة التشغيل الحالية تفتقد للمفتاح السحابي. يرجى ربطه يدوياً لتفعيل "عقدة المعالجة".' : 'The current environment lacks a cloud key. Please link manually to activate the "Processing Node".'}
                               </p>
                               <button onClick={handleLinkKey} className="w-full py-5 bg-brand-primary text-white rounded-[25px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-glow">
                                  <Link2 size={18} /> {isAr ? 'ربط مفتاح API الآن' : 'LINK API KEY NOW'}
                               </button>
                               <p className="text-[9px] text-white/20 uppercase tracking-widest font-mono">NODE_ERROR_403_HANDLED</p>
                             </div>
                           ) : (
                             <div className="space-y-6">
                               <h3 className="text-2xl font-serif font-bold mb-4">{isAr ? 'فشل الاتصال' : 'Connection Failed'}</h3>
                               <p className="text-sm text-white/50 mb-10 italic">{isAr ? 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى.' : 'Verify your connection and try again.'}</p>
                               <button onClick={handleAnalyze} className="w-full py-5 bg-brand-primary text-white rounded-[25px] text-[10px] font-black uppercase tracking-widest">RETRY</button>
                             </div>
                           )}
                        </div>
                      )}

                      {status === 'idle' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/20 backdrop-blur-[1px] z-40">
                            <button onClick={handleAnalyze} className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl ${personaConfigs[currentPersona].color} shadow-glow hover:scale-110 active:scale-95 transition-all duration-500`}>
                               <BrainCircuit size={48} />
                            </button>
                            <span className="mt-8 text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">{isAr ? 'انقر للتشخيص' : 'TAP TO ANALYZE'}</span>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="flex-grow w-full flex flex-col items-center justify-center p-12 text-center cursor-pointer group/upload relative bg-brand-cream/50 dark:bg-white/[0.02]" onClick={() => fileInputRef.current?.click()}>
                      <div className="absolute inset-10 border-2 border-dashed border-brand-primary/10 rounded-[60px] group-hover/upload:border-brand-primary transition-all duration-700" />
                      <div className="relative z-10 space-y-6">
                         <div className="w-20 h-20 bg-brand-primary/10 rounded-[30px] flex items-center justify-center mx-auto text-brand-primary group-hover/upload:scale-110 transition-all duration-700">
                           <UploadCloud size={40} />
                         </div>
                         <div className="space-y-2">
                           <h4 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">{isAr ? 'ارفع العينة' : 'Input Specimen.'}</h4>
                           <p className="text-[10px] font-black text-brand-dark/20 dark:text-white/20 uppercase tracking-[0.4em]">{isAr ? 'صور طعامك لبدء التحليل' : 'SNAP MEAL TO START ANALYSIS'}</p>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </section>
  );
};

export default Hero;

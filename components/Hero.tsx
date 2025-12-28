
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Baby, HeartPulse, Zap, Camera, Utensils, ShieldAlert, Terminal, ArrowRight, RefreshCw, Key, UploadCloud, Check, AlertCircle, ImagePlus, Lock } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language, setView } = useApp();
  const [image, setImage] = useState<string | null>(lastAnalysisResult?.imageUrl || null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'loading' | 'error' | 'success'>(lastAnalysisResult ? 'success' : 'idle');
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorType, setErrorType] = useState<'general' | 'key' | null>(null);
  const [hasKey, setHasKey] = useState(false);

  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const exists = await window.aistudio.hasSelectedApiKey();
      setHasKey(exists);
    };
    checkKey();
  }, []);

  const handleActivateKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
      setErrorType(null);
    } catch (e) {
      console.error("Key selection failed");
    }
  };

  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, slogan: string, color: string, accent: string, border: string }> = {
    GENERAL: { label: isAr ? 'بروتوكول عام' : 'GENERAL PROTOCOL', icon: <Utensils size={20} />, slogan: isAr ? 'تغذية متوازنة' : 'Balanced Nutrition', color: 'bg-[#C2A36B]', accent: 'text-[#C2A36B]', border: 'border-[#C2A36B]' },
    ATHLETE: { label: isAr ? 'بروتوكول الرياضي' : 'ATHLETE MODE', icon: <Zap size={20} />, slogan: isAr ? 'أداء واستشفاء' : 'Power & Recovery', color: 'bg-orange-500', accent: 'text-orange-500', border: 'border-orange-500' },
    DIABETIC: { label: isAr ? 'إدارة السكري' : 'DIABETIC CARE', icon: <HeartPulse size={20} />, slogan: isAr ? 'توازن الجلوكوز' : 'Glucose Balance', color: 'bg-blue-500', accent: 'text-blue-500', border: 'border-blue-500' },
    PREGNANCY: { label: isAr ? 'رعاية الحامل' : 'PREGNANCY SAFE', icon: <Baby size={20} />, slogan: isAr ? 'نمو وصحة' : 'Growth & Vitality', color: 'bg-pink-500', accent: 'text-pink-500', border: 'border-pink-500' }
  };

  const currentConf = personaConfigs[currentPersona];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatus('processing');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStatus('idle');
        setErrorType(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!hasKey) {
      setErrorType('key');
      return;
    }
    if (!image || status === 'loading') return;
    
    setStatus('loading');
    setProgress(0);
    setErrorType(null);
    
    const steps = isAr ? ['تنشيط البروتوكول...', 'تحليل العينة...', 'توليد التقرير...'] : ['Syncing...', 'Analyzing...', 'Finalizing...'];
    let stepIdx = 0;
    setLoadingStep(steps[0]);

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(p => {
        const next = p + 1.5;
        if (next >= 98) return 98;
        const s = Math.floor((next/100)*steps.length);
        if (s !== stepIdx && s < steps.length) { stepIdx = s; setLoadingStep(steps[s]); }
        return next;
      });
    }, 50);

    try {
      const result = await analyzeMealImage(image, { chronicDiseases: "none", dietProgram: "general", activityLevel: "moderate", persona: currentPersona }, language);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (result) {
        setLastAnalysisResult(result);
        incrementScans(result);
        setStatus('success');
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
      if (err.message === "KEY_INVALID") {
        setHasKey(false);
        setErrorType('key');
      } else {
        setErrorType('general');
      }
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen pt-32 pb-20 bg-brand-light dark:bg-brand-dark transition-all duration-1000">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-white/5">
                <ShieldAlert size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'نظام التشخيص الحيوي' : 'BIO-DIAGNOSTIC SYSTEM'}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Metabolic <br /> <span className={`${currentConf.accent} italic transition-colors`}>{isAr ? 'التشخيص.' : 'Diagnostics.'}</span>
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(personaConfigs) as BioPersona[]).map((key) => {
                const conf = personaConfigs[key];
                const isActive = currentPersona === key;
                return (
                  <button key={key} onClick={() => { setCurrentPersona(key); setStatus('idle'); }}
                    className={`p-6 rounded-[35px] border transition-all h-[110px] flex flex-col justify-between text-left
                      ${isActive ? `${conf.color} text-white shadow-xl` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40'}`}
                  >
                    <div className="flex justify-between">{conf.icon} {isActive && <Check size={14} />}</div>
                    <span className="text-sm font-serif font-bold">{conf.label}</span>
                  </button>
                );
              })}
            </div>

            {!hasKey && (
              <div className="p-8 bg-brand-primary/10 border border-brand-primary/20 rounded-[40px] space-y-6 animate-pulse">
                <div className="flex items-center gap-4 text-brand-primary">
                  <Lock size={24} />
                  <h4 className="font-serif font-bold">{isAr ? 'يجب تنشيط الارتباط العصبي' : 'Neural Link Required'}</h4>
                </div>
                <p className="text-xs text-brand-dark/50 dark:text-white/40 italic">
                  {isAr ? 'موديلات Gemini 3 تتطلب اختيار مفتاح API نشط للعمل من المتصفح.' : 'Gemini 3 models require an active API key for client-side processing.'}
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1 text-brand-primary">{isAr ? 'المزيد عن الفوترة' : 'Billing info'}</a>
                </p>
                <button onClick={handleActivateKey} className="w-full py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-brand-primary transition-all">
                  ACTIVATE LINK NOW
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 flex flex-col items-center">
             <div className={`relative w-full max-w-[500px] aspect-[4/5] bg-white dark:bg-zinc-900 rounded-[60px] border-2 transition-all duration-700 ${currentConf.border} shadow-4xl overflow-hidden`}>
                
                {image ? (
                   <div className="relative h-full w-full">
                      <img src={image} className="w-full h-full object-cover" alt="Meal" />
                      
                      {status === 'loading' && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white z-50">
                           <Terminal size={40} className={`${currentConf.accent} animate-pulse mb-8`} />
                           <h3 className="text-2xl font-serif font-bold mb-4">{loadingStep}</h3>
                           <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full ${currentConf.color} transition-all duration-300`} style={{ width: `${progress}%` }} />
                           </div>
                        </div>
                      )}

                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-x-6 bottom-6 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-2xl rounded-[45px] p-8 border border-white/10 shadow-glow animate-fade-in-up z-50">
                           <div className="flex justify-between mb-4">
                              <h4 className="text-xl font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.summary}</h4>
                              <span className="text-brand-primary font-bold">{lastAnalysisResult.totalCalories} KCAL</span>
                           </div>
                           <button onClick={() => { setImage(null); setStatus('idle'); fileInputRef.current?.click(); }} className={`w-full py-4 ${currentConf.color} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest`}>
                              {isAr ? 'تحليل عينة جديدة' : 'ANALYZE NEW SPECIMEN'}
                           </button>
                        </div>
                      )}

                      {(status === 'idle' || status === 'error') && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/60 backdrop-blur-sm z-40 text-center p-10">
                            {errorType === 'key' ? (
                               <div className="space-y-6 animate-fade-in">
                                  <AlertCircle size={48} className="text-brand-primary mx-auto" />
                                  <h4 className="text-xl font-serif font-bold text-white">{isAr ? 'تنشيط المفتاح مطلوب' : 'Activation Required'}</h4>
                                  <button onClick={handleActivateKey} className="px-10 py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] tracking-widest">ACTIVATE</button>
                               </div>
                            ) : (
                              <div className="space-y-6">
                                <button onClick={handleAnalyze} className={`w-24 h-24 rounded-full flex items-center justify-center ${currentConf.color} text-white shadow-glow hover:scale-110 transition-transform`}>
                                   <Zap size={40} fill="currentColor" />
                                </button>
                                <h4 className="text-xl font-serif font-bold text-white italic">{isAr ? 'انقر للتشخيص' : 'Start Diagnosis'}</h4>
                              </div>
                            )}
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className={`w-32 h-32 rounded-[45px] border-2 border-dashed ${currentConf.border} ${currentConf.accent} flex items-center justify-center mb-8`}>
                         <UploadCloud size={48} />
                      </div>
                      <h4 className="text-2xl font-serif font-bold text-brand-dark/40 dark:text-white/40">{isAr ? 'ارفع صورة الوجبة' : 'Upload Meal Image'}</h4>
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


import React, { useState, useRef, useEffect } from 'react';
import { Utensils, Zap, HeartPulse, Baby, ShieldAlert, Check, BrainCircuit, RefreshCcw, UploadCloud, AlertCircle, Sparkles, Radio, Cpu, Settings2, Camera, Search, Activity, ThermometerSun, Droplets, Link2 } from 'lucide-react';
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
        if (status === 'error') handleAnalyze(); // Auto-retry after linking
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
      const result = await analyzeMealImage(image, { 
        chronicDiseases: "none", dietProgram: "general", activityLevel: "moderate", persona: currentPersona 
      }, language);
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
                 <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-white/5">
                    <ShieldAlert size={14} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'نظام النبض 5.0' : 'PULSE SYSTEM 5.0'}</span>
                 </div>
                 <button onClick={handleLinkKey} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isApiKeyLinked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary animate-pulse'}`}>
                    <Radio size={12} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isApiKeyLinked ? (isAr ? 'رابط نشط' : 'LINK ACTIVE') : (isAr ? 'غير مرتبط' : 'LINK KEY')}</span>
                 </button>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Bio-Metric <br /> <span className={`${personaConfigs[currentPersona].accent} italic`}>{isAr ? 'التشخيص.' : 'Diagnostics.'}</span>
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(personaConfigs) as BioPersona[]).map((key) => (
                <button key={key} onClick={() => setCurrentPersona(key)}
                  className={`p-5 md:p-6 rounded-[35px] border transition-all h-[110px] flex flex-col justify-between text-left relative overflow-hidden group
                    ${currentPersona === key ? `${personaConfigs[key].color} text-white shadow-2xl` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40'}`}
                >
                  <div className="flex justify-between relative z-10">
                    <div className={`${currentPersona === key ? 'text-white' : 'text-brand-primary'}`}>{personaConfigs[key].icon}</div>
                    {currentPersona === key && <Check size={14} />}
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10">{personaConfigs[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center order-1 lg:order-2 w-full">
             <div className={`relative w-full max-w-[580px] bg-white dark:bg-[#0D0D0D] rounded-[60px] md:rounded-[80px] border-2 transition-all duration-700 ${status === 'loading' ? 'border-brand-primary shadow-glow' : 'border-brand-dark/5 dark:border-white/10'} shadow-4xl overflow-hidden min-h-[550px]`}>
                {image ? (
                   <div className="relative w-full h-full flex flex-col">
                      <div className={`relative w-full transition-all duration-700 ${status === 'success' ? 'h-48 md:h-64' : 'h-[500px]'}`}>
                        <img src={image} className="w-full h-full object-cover" alt="Meal Specimen" />
                        {status === 'loading' && (
                          <div className="absolute inset-0 bg-brand-dark/85 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-white z-50">
                             <Cpu size={70} className="text-brand-primary animate-spin-slow mb-6" />
                             <h3 className="text-2xl font-serif font-bold italic mb-4">{isAr ? 'جاري التحليل...' : 'Analyzing...'}</h3>
                             <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary transition-all" style={{ width: `${scanProgress}%` }} />
                             </div>
                          </div>
                        )}
                      </div>

                      {status === 'success' && lastAnalysisResult && (
                        <div className="flex-grow bg-white dark:bg-[#0D0D0D] p-8 md:p-12 animate-fade-in-up space-y-10 overflow-y-auto no-scrollbar">
                           <div className="flex justify-between items-start border-b border-brand-dark/5 pb-8">
                              <h4 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark dark:text-white leading-tight">{lastAnalysisResult.summary}</h4>
                              <div className={`p-6 rounded-[35px] border ${personaConfigs[currentPersona].ring} ring-4 text-center`}>
                                 <span className={`text-4xl font-serif font-bold ${personaConfigs[currentPersona].accent}`}>{lastAnalysisResult.healthScore}</span>
                                 <span className="block text-[8px] font-black opacity-40">VITALITY</span>
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-6">
                              {[
                                { l: 'PRO', v: lastAnalysisResult.macros.protein, c: 'bg-orange-500' },
                                { l: 'CARB', v: lastAnalysisResult.macros.carbs, c: 'bg-blue-500' },
                                { l: 'FAT', v: lastAnalysisResult.macros.fat, c: 'bg-emerald-500' }
                              ].map((m, i) => (
                                <div key={i} className="space-y-3">
                                   <div className="flex justify-between px-1"><span className="text-[9px] opacity-40 font-black">{m.l}</span><span className="text-xs font-bold">{m.v}g</span></div>
                                   <div className="h-1.5 w-full bg-brand-dark/5 rounded-full overflow-hidden">
                                      <div className={`h-full ${m.c} transition-all duration-1000`} style={{ width: `${Math.min(100, m.v * 2)}%` }} />
                                   </div>
                                </div>
                              ))}
                           </div>

                           <div className={`p-8 rounded-[40px] border border-brand-primary/10 ${personaConfigs[currentPersona].color}/5`}>
                              <span className={`text-[9px] font-black ${personaConfigs[currentPersona].accent}`}>{isAr ? 'نصيحة البروتوكول' : 'PROTOCOL ADVICE'}</span>
                              <p className="text-lg font-serif italic text-brand-dark dark:text-white/90 leading-relaxed mt-2 italic">"{lastAnalysisResult.personalizedAdvice}"</p>
                           </div>

                           <button onClick={resetScanner} className="w-full py-5 bg-brand-dark text-white rounded-[25px] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-brand-primary transition-all">
                              {isAr ? 'عينة جديدة' : 'NEW SPECIMEN'}
                           </button>
                        </div>
                      )}

                      {status === 'error' && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center text-white z-50">
                           <AlertCircle size={48} className="text-red-500 animate-pulse mb-6" />
                           {errorType === 'AUTH' ? (
                             <>
                               <h3 className="text-2xl font-serif font-bold mb-4">{isAr ? 'مطلوب ربط المفتاح' : 'Key Link Required'}</h3>
                               <p className="text-sm text-white/50 mb-10 italic">{isAr ? 'بيئة التشغيل (Vercel) تفتقد للمفتاح. يرجى ربطه يدوياً للاستمرار.' : 'Vercel environment key is missing. Please link manually to proceed.'}</p>
                               <button onClick={handleLinkKey} className="w-full py-5 bg-brand-primary text-white rounded-[25px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4">
                                  <Link2 size={18} /> {isAr ? 'ربط مفتاح API' : 'LINK API KEY'}
                               </button>
                             </>
                           ) : (
                             <>
                               <h3 className="text-2xl font-serif font-bold mb-4">{isAr ? 'فشل الاتصال' : 'Connection Failed'}</h3>
                               <button onClick={handleAnalyze} className="w-full py-5 bg-brand-primary text-white rounded-[25px] text-[10px] font-black uppercase tracking-widest">RETRY</button>
                             </>
                           )}
                        </div>
                      )}

                      {status === 'idle' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/20 backdrop-blur-[1px] z-40">
                            <button onClick={handleAnalyze} className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl ${personaConfigs[currentPersona].color} shadow-glow`}>
                               <BrainCircuit size={48} />
                            </button>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="h-[600px] w-full flex flex-col items-center justify-center p-12 text-center cursor-pointer group/upload relative bg-brand-cream/50 dark:bg-white/[0.02]" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud size={60} className="text-brand-primary opacity-30 mb-8" />
                      <h4 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">{isAr ? 'ارفع العينة' : 'Input Specimen.'}</h4>
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

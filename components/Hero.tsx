
import React, { useState, useRef, useEffect } from 'react';
import { Utensils, Zap, HeartPulse, Baby, ShieldAlert, Check, BrainCircuit, RefreshCcw, UploadCloud, AlertCircle, Sparkles, Info, Key, Globe, Radio, Settings } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language, isApiKeyLinked, setIsApiKeyLinked } = useApp();
  const [image, setImage] = useState<string | null>(lastAnalysisResult?.imageUrl || null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>(lastAnalysisResult ? 'success' : 'idle');
  const [errorType, setErrorType] = useState<'timeout' | 'key' | 'general'>('general');
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, accent: string, color: string, glow: string }> = {
    GENERAL: { label: isAr ? 'بروتوكول عام' : 'GENERAL PROTOCOL', icon: <Utensils size={20} />, accent: 'text-[#C2A36B]', color: 'bg-[#C2A36B]', glow: 'shadow-[#C2A36B]/20' },
    ATHLETE: { label: isAr ? 'الرياضي' : 'ATHLETE MODE', icon: <Zap size={20} />, accent: 'text-orange-500', color: 'bg-orange-500', glow: 'shadow-orange-500/20' },
    DIABETIC: { label: isAr ? 'السكري' : 'DIABETIC CARE', icon: <HeartPulse size={20} />, accent: 'text-blue-500', color: 'bg-blue-500', glow: 'shadow-blue-500/20' },
    PREGNANCY: { label: isAr ? 'الحامل' : 'PREGNANCY SAFE', icon: <Baby size={20} />, accent: 'text-pink-500', color: 'bg-pink-500', glow: 'shadow-pink-500/20' }
  };

  const currentConf = personaConfigs[currentPersona];

  // Fix: Added resetScanner function to reset the scanner state and image
  const resetScanner = () => {
    setImage(null);
    setStatus('idle');
    setLastAnalysisResult(null);
  };

  const handleLinkKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsApiKeyLinked(true);
      if (status === 'error') handleAnalyze(); // إعادة التحليل تلقائياً بعد الربط
    }
  };

  const resizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 320; // حجم فائق السرعة
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; } }
        else { if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.4)); 
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resized = await resizeImage(reader.result as string);
        setImage(resized);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    try {
      const result = await analyzeMealImage(image, { chronicDiseases: "none", dietProgram: "general", activityLevel: "moderate", persona: currentPersona }, language);
      if (result) {
        setLastAnalysisResult(result);
        incrementScans(result);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorType('general');
      }
    } catch (err: any) {
      setStatus('error');
      if (err.message === "SCAN_TIMEOUT") setErrorType('timeout');
      else if (err.message === "KEY_REBIND_NEEDED") setErrorType('key');
      else setErrorType('general');
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen pt-32 pb-20 bg-brand-light dark:bg-brand-dark">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                 <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-white/5 shadow-xl">
                    <ShieldAlert size={14} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'نظام التشخيص 3.1' : 'DIAGNOSTIC 3.1'}</span>
                 </div>
                 <button onClick={handleLinkKey} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isApiKeyLinked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary animate-pulse'}`}>
                    {isApiKeyLinked ? <Check size={14} /> : <Key size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isApiKeyLinked ? (isAr ? 'الربط المباشر نشط' : 'DIRECT LINK ACTIVE') : (isAr ? 'اربط مفتاحك للسرعة' : 'LINK KEY FOR SPEED')}</span>
                 </button>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Metabolic <br /> <span className={`${currentConf.accent} italic`}>{isAr ? 'التشخيص.' : 'Diagnostics.'}</span>
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(personaConfigs) as BioPersona[]).map((key) => {
                const conf = personaConfigs[key];
                return (
                  <button key={key} onClick={() => setCurrentPersona(key)}
                    className={`p-6 rounded-[35px] border transition-all h-[110px] flex flex-col justify-between text-left relative overflow-hidden
                      ${currentPersona === key ? `${conf.color} text-white shadow-2xl scale-105 z-10` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40'}`}
                  >
                    <div className="flex justify-between relative z-10">{conf.icon} {currentPersona === key && <Check size={14} />}</div>
                    <span className="text-sm font-serif font-bold relative z-10">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center">
             <div className={`relative w-full max-w-[500px] aspect-[4/5] bg-white dark:bg-zinc-900 rounded-[60px] border-2 transition-all duration-700 ${status === 'loading' ? 'border-brand-primary' : 'border-brand-primary/10'} shadow-4xl overflow-hidden`}>
                {image ? (
                   <div className="relative h-full w-full">
                      <img src={image} className="w-full h-full object-cover" alt="Meal" />
                      {status === 'loading' && (
                        <div className="absolute inset-0 bg-brand-dark/85 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white z-50">
                           <div className="relative mb-8">
                              <BrainCircuit size={80} className="text-brand-primary animate-spin-slow" />
                              <div className="absolute -inset-4 border-2 border-brand-primary/20 rounded-full animate-ping" />
                           </div>
                           <h3 className="text-2xl font-serif font-bold italic tracking-widest mb-2">{isAr ? 'نبض عصبي...' : 'Neural Pulse...'}</h3>
                           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-brand-primary/60">{isApiKeyLinked ? 'BYPASSING SERVERS' : 'ATTEMPTING RELAY'}</p>
                        </div>
                      )}
                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-x-6 bottom-6 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-2xl rounded-[45px] p-8 border border-brand-primary/20 shadow-glow animate-fade-in-up z-50">
                           <div className="flex justify-between items-start mb-4">
                              <div className="space-y-1">
                                <h4 className="text-2xl font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.summary}</h4>
                                <div className="relative inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                                  <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{isAr ? 'الصحة' : 'HEALTH'}: {lastAnalysisResult.healthScore}%</span>
                                  <Sparkles size={10} className="text-brand-primary" />
                                </div>
                              </div>
                              <button onClick={resetScanner} className="p-2 text-brand-primary"><RefreshCcw size={20} /></button>
                           </div>
                           <button onClick={resetScanner} className="w-full py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">{isAr ? 'عينة جديدة' : 'NEW SPECIMEN'}</button>
                        </div>
                      )}
                      {status === 'error' && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-lg flex flex-col items-center justify-center p-12 text-center text-white z-50">
                           <AlertCircle size={60} className="text-red-500 mb-6 animate-pulse" />
                           <h3 className="text-2xl font-serif font-bold mb-2">{errorType === 'timeout' ? (isAr ? 'تجاوز الوقت' : 'Timeout') : (isAr ? 'خطأ في الربط' : 'Link Error')}</h3>
                           <p className="text-xs text-white/40 mb-10 italic max-w-xs">
                             {errorType === 'timeout' 
                               ? (isAr ? 'الخادم العام لا يستجيب. يجب عليك تفعيل الربط المباشر.' : 'The public relay is non-responsive. You MUST enable Direct Link.') 
                               : (isAr ? 'حدث خطأ في مفتاحك. يرجى إعادة الربط.' : 'There is an issue with your key. Please re-bind.')}
                           </p>
                           <div className="flex flex-col w-full gap-4">
                              <button onClick={handleLinkKey} className="w-full py-5 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] shadow-glow flex items-center justify-center gap-3">
                                 <Key size={16} /> {isAr ? 'تفعيل الربط المباشر' : 'ACTIVATE DIRECT LINK'}
                              </button>
                              <button onClick={handleAnalyze} className="w-full py-4 border border-white/10 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                 RETRY RELAY
                              </button>
                           </div>
                        </div>
                      )}
                      {status === 'idle' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/40 backdrop-blur-[2px] z-40">
                            <button onClick={handleAnalyze} className={`w-24 h-24 rounded-full flex items-center justify-center ${currentConf.color} text-white shadow-glow hover:scale-110 transition-transform`}>
                               <BrainCircuit size={40} />
                            </button>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud size={48} className="text-brand-primary/40 group-hover:text-brand-primary transition-all mb-4" />
                      <h4 className="text-2xl font-serif font-bold text-brand-dark/30 dark:text-white/30">{isAr ? 'ارفع صورة الوجبة' : 'Upload Meal Image'}</h4>
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

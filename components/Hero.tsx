
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Baby, HeartPulse, Zap, Camera, Utensils, Share2, Activity, AlertCircle, UploadCloud, Check, Copy, Key, Loader2, ShieldAlert, Terminal, Settings, ArrowRight } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  // Destructure setView from useApp to fix the "Cannot find name 'setView'" error
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language, setView } = useApp();
  
  const [image, setImage] = useState<string | null>(lastAnalysisResult?.imageUrl || null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'loading' | 'error' | 'success'>(
    lastAnalysisResult ? 'success' : 'idle'
  );
  
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<{title: string, detail: string, type: 'quota' | 'config' | 'general'} | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'error'>('idle');
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // إعدادات البروتوكولات الأربعة
  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, slogan: string, color: string, border: string, accent: string, bg: string }> = {
    GENERAL: { 
        label: isAr ? 'بروتوكول عام' : 'GENERAL PROTOCOL', 
        icon: <Utensils size={20} />, 
        slogan: isAr ? 'تغذية متوازنة' : 'Balanced Nutrition',
        color: 'bg-[#C2A36B]', 
        accent: 'text-[#C2A36B]', 
        border: 'border-[#C2A36B]',
        bg: 'bg-[#C2A36B]/10'
    },
    ATHLETE: { 
        label: isAr ? 'بروتوكول الرياضي' : 'ATHLETE MODE', 
        icon: <Zap size={20} />, 
        slogan: isAr ? 'أداء واستشفاء' : 'Power & Recovery',
        color: 'bg-orange-500', 
        accent: 'text-orange-500', 
        border: 'border-orange-500',
        bg: 'bg-orange-500/10'
    },
    DIABETIC: { 
        label: isAr ? 'إدارة السكري' : 'DIABETIC CARE', 
        icon: <HeartPulse size={20} />, 
        slogan: isAr ? 'توازن الجلوكوز' : 'Glucose Balance',
        color: 'bg-blue-500', 
        accent: 'text-blue-500', 
        border: 'border-blue-500',
        bg: 'bg-blue-500/10'
    },
    PREGNANCY: { 
        label: isAr ? 'رعاية الحامل' : 'PREGNANCY SAFE', 
        icon: <Baby size={20} />, 
        slogan: isAr ? 'نمو وصحة' : 'Growth & Vitality',
        color: 'bg-pink-500', 
        accent: 'text-pink-500', 
        border: 'border-pink-500',
        bg: 'bg-pink-500/10'
    }
  };

  const currentConf = personaConfigs[currentPersona];

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatus('processing');
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setImage(compressed);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setImage(null);
    setStatus('idle');
    setProgress(0);
    setLastAnalysisResult(null);
    setErrorMsg(null);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setProgress(0);
    setErrorMsg(null);
    
    const steps = isAr 
      ? ['تحسين الصورة...', 'تشفير البيانات...', 'تحليل بصمة الأيض...', 'توليد التقرير...'] 
      : ['Optimizing Image...', 'Encoding Data...', 'Metabolic Analysis...', 'Generating Report...'];
    
    let currentStepIdx = 0;
    setLoadingStep(steps[0]);

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 10) + 1;
        if (next >= 98) return 98;
        const stepIdx = Math.floor((next / 100) * steps.length);
        if (stepIdx !== currentStepIdx && stepIdx < steps.length) {
          currentStepIdx = stepIdx;
          setLoadingStep(steps[stepIdx]);
        }
        return next;
      });
    }, 80);

    try {
      const result = await analyzeMealImage(image, {
        chronicDiseases: "none",
        dietProgram: "general",
        activityLevel: "moderate",
        persona: currentPersona
      }, language); 
      
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      
      if (result) {
        setLastAnalysisResult({ ...result, imageUrl: image });
        incrementScans(result);
        setStatus('success');
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
      
      const isQuota = err.message === "QUOTA_EXCEEDED";
      const isConfig = err.message.includes("CONFIG_ERROR") || err.message.includes("API_KEY");

      setErrorMsg({
        title: isConfig ? (isAr ? "خطأ في الإعدادات" : "Configuration Error") : isQuota ? (isAr ? "تحجيم الأداء" : "Throttling") : (isAr ? "خطأ في الاتصال" : "Connection Error"),
        detail: isConfig 
          ? (isAr ? "مفتاح API مفقود في Vercel. يرجى إضافته في الإعدادات وإعادة النشر." : "API_KEY is missing from Vercel variables. Add it and redeploy.")
          : isQuota 
            ? (isAr ? "تم الوصول للحد الأقصى للطلبات. جرب مجدداً بعد دقيقة." : "Free tier limit reached. Please wait 60 seconds.")
            : (isAr ? "السيرفر استغرق وقتاً طويلاً أو الصورة كبيرة جداً." : "Server timeout or payload too large for Vercel Hobby."),
        type: isConfig ? 'config' : isQuota ? 'quota' : 'general'
      });
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-brand-light dark:bg-brand-dark transition-colors duration-1000">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 h-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Column 1: Branding & Persona Selection */}
          <div className="lg:col-span-5 space-y-10 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full shadow-lg border border-white/5">
                <ShieldAlert size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'نظام تحليل جزيئي معتمد' : 'MOLECULAR ANALYSIS VERIFIED'}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-[0.9]">
                Metabolic <br /> 
                <span className={`${currentConf.accent} italic font-normal transition-colors duration-700`}>{isAr ? 'التشخيص الذكي.' : 'Diagnostics.'}</span>
              </h1>
              <p className="text-brand-dark/50 dark:text-white/40 text-lg font-medium italic leading-relaxed max-w-sm">
                {isAr ? 'اختر البروتوكول المناسب لحالتك الحيوية قبل بدء الفحص.' : 'Calibrate your biometric protocol before initiating the scan.'}
              </p>
            </div>

            {/* Persona Selection Grid - THE FOUR BUTTONS REINSTATED */}
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(personaConfigs) as BioPersona[]).map((key) => {
                const conf = personaConfigs[key];
                const isActive = currentPersona === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCurrentPersona(key)}
                    className={`group relative p-6 rounded-[35px] border transition-all duration-500 text-left overflow-hidden h-[120px] flex flex-col justify-between
                      ${isActive ? `${conf.color} ${conf.border} text-white shadow-xl scale-[1.02]` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40 hover:bg-brand-primary/5 hover:border-brand-primary/20'}`}
                  >
                    <div className="flex justify-between items-start">
                       <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-white/20 text-white' : 'bg-brand-dark/5 dark:bg-white/5 text-brand-primary'}`}>
                          {conf.icon}
                       </div>
                       {isActive && <Check size={14} className="animate-fade-in" />}
                    </div>
                    <div>
                      <span className="text-[14px] font-serif font-bold block leading-none mb-1">{conf.label}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest block transition-colors duration-500 ${isActive ? 'text-white/60' : 'opacity-30'}`}>{conf.slogan}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="pt-6 hidden lg:block">
               <div className="flex items-center gap-4 text-brand-dark/20 dark:text-white/10 uppercase font-black text-[9px] tracking-[0.4em]">
                  <Settings size={14} className="animate-spin-slow" />
                  <span>{isAr ? 'تعديل المعلمات يتم آلياً بناءً على اختيارك' : 'PARAMETERS CALIBRATED AUTOMATICALLY'}</span>
               </div>
            </div>
          </div>

          {/* Column 2: The Scanner Unit */}
          <div className="lg:col-span-7 flex flex-col items-center">
             <div className={`relative w-full max-w-[500px] aspect-[4/5] bg-white dark:bg-zinc-900 rounded-[60px] lg:rounded-[80px] border-2 transition-all duration-700 ${currentConf.border} shadow-[0_60px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden group`}>
                
                {image ? (
                   <div className="relative h-full w-full">
                      <img src={image} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt="Meal" />
                      
                      {status === 'loading' && (
                        <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-fade-in z-50">
                           <div className="relative mb-10">
                              <div className={`w-36 h-36 rounded-full border border-white/5 border-t-brand-primary animate-spin ${currentConf.accent}`} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <Terminal size={32} className={`${currentConf.accent} animate-pulse`} />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <h3 className="text-2xl font-serif font-bold text-white tracking-tight">{loadingStep}</h3>
                              <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <div className={`h-full transition-all duration-300 ${currentConf.color}`} style={{ width: `${progress}%` }} />
                              </div>
                              <p className="text-[10px] text-white/40 uppercase tracking-[0.5em]">{progress}% Processed</p>
                           </div>
                        </div>
                      )}

                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-x-6 bottom-6 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-xl rounded-[45px] p-8 border border-white/20 shadow-glow animate-fade-in-up z-50">
                           <div className="flex justify-between items-start mb-6">
                              <div className="space-y-1">
                                 <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${currentConf.accent}`}>{isAr ? 'تقرير الأيض' : 'METABOLIC_REPORT'}</span>
                                 <h4 className="text-2xl font-serif font-bold text-brand-dark dark:text-white tracking-tight line-clamp-1">{lastAnalysisResult.summary}</h4>
                              </div>
                              <div className={`${currentConf.color} text-white px-5 py-3 rounded-2xl font-serif font-bold text-2xl`}>
                                 {lastAnalysisResult.totalCalories} <span className="text-[10px] ml-1">KCAL</span>
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-4 py-6 border-y border-brand-dark/5 dark:border-white/5 mb-6">
                              <div className="text-center">
                                 <span className="text-[7px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-widest block mb-1">PROTEIN</span>
                                 <span className="text-lg font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.macros.protein}g</span>
                              </div>
                              <div className="text-center">
                                 <span className="text-[7px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-widest block mb-1">CARBS</span>
                                 <span className="text-lg font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.macros.carbs}g</span>
                              </div>
                              <div className="text-center">
                                 <span className="text-[7px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-widest block mb-1">FAT</span>
                                 <span className="text-lg font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.macros.fat}g</span>
                              </div>
                           </div>
                           <div className="flex gap-2">
                             <button onClick={handleReset} className={`flex-1 py-4 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${currentConf.color} hover:scale-105`}>
                                <RotateCcw size={14} /> {isAr ? 'إعادة' : 'RESET'}
                             </button>
                             <button onClick={() => setView('vaults')} className="flex-1 py-4 bg-white dark:bg-white/5 text-brand-dark dark:text-white border border-brand-dark/5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all">
                                {isAr ? 'الأرشيف' : 'ARCHIVE'} <ArrowRight size={14} />
                             </button>
                           </div>
                        </div>
                      )}

                      {status === 'error' && errorMsg && (
                        <div className="absolute inset-0 bg-red-500/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white animate-fade-in z-50">
                           <AlertCircle size={64} className="mb-6 animate-bounce" />
                           <h3 className="text-3xl font-serif font-bold mb-4">{errorMsg.title}</h3>
                           <p className="text-lg font-medium italic opacity-80 mb-8 max-w-xs">{errorMsg.detail}</p>
                           <button onClick={handleReset} className="bg-white text-red-500 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all shadow-2xl">
                              {isAr ? 'إعادة التشغيل' : 'REBOOT SYSTEM'}
                           </button>
                        </div>
                      )}

                      {status === 'idle' && (
                         <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/40 group-hover:bg-brand-dark/20 transition-all z-40">
                            <button 
                              onClick={handleAnalyze}
                              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-glow animate-pulse hover:scale-110 transition-transform ${currentConf.color} text-white`}
                            >
                               <Zap size={44} fill="currentColor" />
                            </button>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center space-y-10 bg-brand-cream/10 dark:bg-brand-dark/50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="relative group">
                         <div className={`w-36 h-36 rounded-[50px] border-2 border-dashed flex items-center justify-center transition-all duration-700 ${currentConf.border} ${currentConf.accent} group-hover:scale-110`}>
                            <UploadCloud size={64} strokeWidth={1} />
                         </div>
                         <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-glow animate-bounce ${currentConf.color}`}>
                            <Camera size={18} />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-3xl font-serif font-bold text-brand-dark/60 dark:text-white/40 italic">{isAr ? 'وحدة المسح جاهزة' : 'Biometric Input Ready.'}</h4>
                         <p className="text-[10px] font-black text-brand-dark/20 dark:text-white/10 uppercase tracking-[0.5em]">{isAr ? 'ارفع صورة الوجبة للمختبر' : 'UPLOAD SPECIMEN TO LAB'}</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${currentConf.accent}`}>{isAr ? 'البروتوكول الفعال:' : 'ACTIVE_PROTOCOL:'} {currentConf.label}</span>
                        <div className={`w-32 h-1 rounded-full ${currentConf.bg} overflow-hidden`}>
                           <div className={`h-full w-full animate-scan ${currentConf.color}`} />
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

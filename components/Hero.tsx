
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Microscope, RotateCcw, Flame, Activity, RefreshCcw, Baby, HeartPulse, Zap, Droplets, Info, XCircle, Camera, Utensils, Apple, Brain } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language, setView } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  
  // حالة محلية لمعرفة ما إذا كان المستخدم قد اختار بروتوكولاً فعلياً في هذه الجلسة
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hoveredId, setHoveredId] = useState<BioPersona | null>(null);

  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const personaData = [
    { 
      id: 'GENERAL' as BioPersona, 
      label: isAr ? 'عام' : 'GENERAL', 
      node: '01',
      slogan: isAr ? 'وجبتك اليومية' : 'Daily Meal',
      icon: <Utensils size={14} />
    },
    { 
      id: 'PREGNANCY' as BioPersona, 
      label: isAr ? 'حمل' : 'PREGNANCY', 
      node: '02',
      slogan: isAr ? 'تغذية الجنين' : 'Prenatal Care',
      icon: <Baby size={14} />
    },
    { 
      id: 'DIABETIC' as BioPersona, 
      label: isAr ? 'سكري' : 'DIABETIC', 
      node: '03',
      slogan: isAr ? 'توازن الجلوكوز' : 'Sugar Balance',
      icon: <HeartPulse size={14} />
    },
    { 
      id: 'ATHLETE' as BioPersona, 
      label: isAr ? 'رياضي' : 'ATHLETE', 
      node: '04',
      slogan: isAr ? 'أداء رياضي' : 'Performance',
      icon: <Zap size={14} />
    }
  ];

  const handlePersonaSelect = (id: BioPersona) => {
    setCurrentPersona(id);
    setHasInteracted(true);
    setStatus('idle');
    setErrorMessage('');
    
    // تمرير ذكي ليملأ السكانر الشاشة في الجوال
    if (scannerRef.current) {
      const offset = 60; 
      const elementPosition = scannerRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setProgress(0);
    setErrorMessage('');
    
    const steps = isAr 
      ? ['بدء المعايرة الحيوية...', 'تحليل مكونات الوجبة...', 'حساب القيم الغذائية...', 'توليد النصيحة المخصصة...'] 
      : ['Initializing Bio-Scan...', 'Deconstructing Ingredients...', 'Calculating Macros...', 'Synthesizing Advice...'];
    
    let currentStepIdx = 0;
    setLoadingStep(steps[0]);

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 5) + 2;
        if (next >= 98) return 98;
        
        const stepIdx = Math.floor((next / 100) * steps.length);
        if (stepIdx !== currentStepIdx && stepIdx < steps.length) {
          currentStepIdx = stepIdx;
          setLoadingStep(steps[stepIdx]);
        }
        return next;
      });
    }, 200);

    try {
      const result = await analyzeMealImage(image, {
        chronicDiseases: "none",
        dietProgram: "general",
        activityLevel: "moderate",
        persona: currentPersona
      }, language); 
      
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      
      if (result && result.totalCalories) {
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: image });
        incrementScans(result);
        setStatus('success');
      } else {
        throw new Error(isAr ? "فشل استخراج البيانات." : "Diagnostic extraction failed.");
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
      setErrorMessage(isAr ? "حدث خطأ في الاتصال. يرجى التأكد من إعدادات المفتاح." : "Communication error. Verify API setup.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
             if (w > h) { h = (h * maxDim) / w; w = maxDim; }
             else { w = (w * maxDim) / h; h = maxDim; }
          }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          setImage(canvas.toDataURL('image/jpeg', 0.7)); 
          setStatus('idle'); 
          setProgress(0);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light dark:bg-brand-dark pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          <div className="space-y-12 w-full">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">AI Diagnostic Unit</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-[0.9] tracking-tighter">
                Precision <br /><span className="text-brand-primary italic font-normal">Command.</span>
              </h1>
              <p className="text-brand-dark/50 dark:text-white/30 text-lg italic max-w-md">
                {isAr ? 'اختر العقدة الحيوية لتنشيط نظام التحليل المخصص.' : 'Select a bio-node to activate your custom analysis system.'}
              </p>
            </div>

            {/* الأزرار الموحدة 2x2 - لا يوجد تحديد مسبق */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-lg">
              {personaData.map((p) => {
                const isActive = hasInteracted && currentPersona === p.id;
                const isHovered = hoveredId === p.id;

                return (
                  <button
                    key={p.id}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handlePersonaSelect(p.id)}
                    className={`group p-5 md:p-6 rounded-[35px] border transition-all duration-700 text-left relative overflow-hidden flex flex-col justify-between h-[120px] md:h-[140px]
                      ${isActive 
                        ? 'bg-brand-primary border-brand-primary text-white shadow-[0_20px_50px_rgba(194,163,107,0.3)] scale-[1.05] z-10' 
                        : isHovered 
                          ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary scale-[1.02] shadow-xl'
                          : 'bg-white dark:bg-white/5 border-brand-dark/10 dark:border-white/10 text-brand-dark dark:text-white/40'}`}
                  >
                    <div className="flex justify-between items-start">
                       <span className={`text-[8px] font-black uppercase tracking-widest block opacity-50 ${isActive ? 'text-white' : 'text-brand-primary'}`}>NODE_{p.node}</span>
                       <div className={`transition-all duration-500 ${isActive ? 'scale-110 text-white' : isHovered ? 'scale-110 text-brand-primary opacity-100' : 'opacity-20'}`}>
                          {p.icon}
                       </div>
                    </div>
                    <div className="mt-auto">
                      <span className={`text-sm md:text-base font-bold block mb-0.5 transition-colors ${isActive ? 'text-white' : isHovered ? 'text-brand-primary' : ''}`}>{p.label}</span>
                      <span className={`text-[9px] italic font-medium block leading-tight transition-colors ${isActive ? 'text-white/80' : 'text-brand-dark/30 dark:text-white/20'}`}>
                        {p.slogan}
                      </span>
                    </div>
                    {/* خلفية توهج خفيفة عند الـ Hover */}
                    {!isActive && isHovered && <div className="absolute inset-0 bg-brand-primary opacity-5 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* وحدة السكانر - تملأ الشاشة في الجوال بعد الضغط */}
          <div ref={scannerRef} className="flex justify-center scroll-mt-20 w-full">
            <div className="relative w-full max-w-[480px] aspect-[3/4] rounded-[50px] md:rounded-[60px] bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-4xl overflow-hidden group">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-10 transition-colors hover:bg-brand-primary/5"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-8 animate-pulse shadow-glow">
                    <Camera size={40} />
                  </div>
                  <h4 className="text-2xl font-serif font-bold italic text-brand-dark/40 dark:text-white/20 mb-2">
                    {isAr ? 'اضغط لمسح وجبتك' : 'Scan Your Meal'}
                  </h4>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] text-center">
                    {isAr ? 'التقط صورة أو اختر من المعرض' : 'Take a photo or upload from gallery'}
                  </p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="absolute inset-0">
                  <img src={image} className="w-full h-full object-cover" alt="Meal" />
                  
                  {status === 'loading' && (
                    <div className="absolute inset-0 z-40">
                      <div className="absolute w-full h-1.5 bg-brand-primary shadow-[0_0_20px_#C2A36B] animate-scan z-50" />
                      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-white">
                        <div className="w-24 h-24 relative mb-6">
                           <svg className="w-full h-full -rotate-90">
                              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/10" />
                              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * progress / 100)} className="text-brand-primary transition-all duration-300" />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">{progress}%</div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">{loadingStep}</p>
                      </div>
                    </div>
                  )}

                  {status === 'success' && lastAnalysisResult && (
                    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl z-50 p-8 text-white overflow-y-auto custom-scrollbar animate-fade-in">
                      <div className="flex justify-between items-center mb-8">
                        <div className="bg-brand-primary/20 px-4 py-1.5 rounded-full border border-brand-primary/30 text-brand-primary text-[8px] font-black tracking-widest">BIO_READY</div>
                        <button onClick={() => { setImage(null); setStatus('idle'); }} className="p-2 text-white/40 hover:text-white transition-colors"><RotateCcw size={20} /></button>
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-2xl font-serif font-bold italic leading-tight">{lastAnalysisResult.summary}</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Energy</span>
                            <p className="text-xl font-serif font-bold">{lastAnalysisResult.totalCalories} <span className="text-[10px] opacity-40">kcal</span></p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                             <div className="flex justify-between items-center mb-2">
                               <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Vitality</span>
                               <span className="text-xs text-brand-primary font-bold">{lastAnalysisResult.healthScore}%</span>
                             </div>
                             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-brand-primary" style={{ width: `${lastAnalysisResult.healthScore}%` }} />
                             </div>
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-sm text-white/70">"{lastAnalysisResult.personalizedAdvice}"</div>
                      </div>
                      <button onClick={() => { setView('home'); setTimeout(() => { const el = document.getElementById(SectionId.PHASE_03_SYNTHESIS); if(el) window.scrollTo({top: el.offsetTop - 80, behavior: 'smooth'}); }, 300); }} className="w-full mt-10 py-5 bg-brand-primary text-brand-dark rounded-3xl text-[9px] font-black uppercase tracking-[0.4em] shadow-glow">Generate Full Protocol</button>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white z-50 animate-fade-in">
                      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><XCircle size={40} className="text-red-500" /></div>
                      <h4 className="text-2xl font-serif font-bold italic mb-4">{isAr ? 'فشل التحليل' : 'Analysis Failed'}</h4>
                      <p className="text-sm text-white/50 mb-10">{errorMessage}</p>
                      <button onClick={handleAnalyze} className="w-full bg-white text-brand-dark py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-primary transition-colors"><RefreshCcw size={14} /> {isAr ? 'إعادة المحاولة' : 'Retry'}</button>
                    </div>
                  )}

                  {status === 'idle' && (
                    <div className="absolute bottom-10 left-10 right-10 z-40">
                      <button onClick={handleAnalyze} className="w-full py-6 bg-brand-primary text-brand-dark rounded-3xl font-black text-[10px] uppercase tracking-[0.5em] shadow-glow active:scale-95 transition-all">
                        {isAr ? 'بدء المزامنة' : 'Sync Diagnostics'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Baby, HeartPulse, Zap, Camera, Utensils, Share2, Activity, AlertCircle, UploadCloud, Check, Copy, Key, Loader2, ShieldAlert, Terminal } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language } = useApp();
  
  const [image, setImage] = useState<string | null>(lastAnalysisResult?.imageUrl || null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'loading' | 'error' | 'success'>(
    lastAnalysisResult ? 'success' : 'idle'
  );
  
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<{title: string, detail: string, type?: 'quota' | 'general' | 'help'} | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'error'>('idle');
  const [isConnectingKey, setIsConnectingKey] = useState(false);
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // وظيفة لضغط الصورة وتصغير حجمها لضمان التوافق مع Vercel
  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000; // حجم مثالي للذكاء الاصطناعي
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // ضغط بجودة 0.7 لتقليل الحجم بشكل كبير مع الحفاظ على التفاصيل
        resolve(canvas.toDataURL('image/jpeg', 0.7));
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
        setProgress(0);
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
    setShareStatus('idle');
    setIsConnectingKey(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConnectPersonalKey = async () => {
    const aistudio = (window as any).aistudio;
    setIsConnectingKey(true);
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      try {
        await aistudio.openSelectKey();
        handleReset();
      } catch (e) {
        setIsConnectingKey(false);
      }
    } else {
      setTimeout(() => {
        setIsConnectingKey(false);
        setErrorMsg({
          title: isAr ? "نظام الربط الشخصي" : "Personal Key Link",
          detail: isAr 
            ? "الربط متاح في AI Studio. للنشر الخارجي، يجب إضافة API_KEY في إعدادات Vercel." 
            : "Direct link is for AI Studio. For public use, add API_KEY to Vercel Settings.",
          type: 'help'
        });
      }, 1000);
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setProgress(0);
    setErrorMsg(null);
    
    const steps = isAr 
      ? ['ضغط البيانات...', 'تشفير العينة...', 'تحليل بصمة الأيض...', 'توليد التقرير...'] 
      : ['Compressing Data...', 'Encrypting Specimen...', 'Metabolic Analysis...', 'Synthesizing Report...'];
    
    let currentStepIdx = 0;
    setLoadingStep(steps[0]);

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 8) + 1;
        if (next >= 99) return 99;
        const stepIdx = Math.floor((next / 100) * steps.length);
        if (stepIdx !== currentStepIdx && stepIdx < steps.length) {
          currentStepIdx = stepIdx;
          setLoadingStep(steps[stepIdx]);
        }
        return next;
      });
    }, 100);

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
        const finalResult = { ...result, timestamp: new Date().toLocaleString(), imageUrl: image };
        setLastAnalysisResult(finalResult);
        incrementScans(finalResult);
        setStatus('success');
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
      const isQuota = err.message === "QUOTA_EXCEEDED";
      
      setErrorMsg({
        title: isQuota ? (isAr ? "تحجيم الأداء" : "Throttling") : (isAr ? "فشل الوحدة" : "Module Fault"),
        detail: isQuota
          ? (isAr ? "وصل المفتاح المشترك للحد الأقصى. يرجى استخدام مفتاحك الخاص في Vercel." : "API Limit reached. Please set your own API_KEY in Vercel Environment Variables.")
          : (isAr ? `خطأ تقني: ${err.message}` : `Technical Error: ${err.message}`),
        type: isQuota ? 'quota' : 'general'
      });
    }
  };

  const handleShare = async () => {
    if (!lastAnalysisResult) return;
    const shareText = isAr 
      ? `📊 تقرير التغذية:\n📝 ${lastAnalysisResult.summary}\n🔥 السعرات: ${lastAnalysisResult.totalCalories}`
      : `📊 Nutrition Report:\n📝 ${lastAnalysisResult.summary}\n🔥 Calories: ${lastAnalysisResult.totalCalories}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Specimen Report', text: shareText, url: window.location.href });
        setShareStatus('shared');
        setTimeout(() => setShareStatus('idle'), 3000);
      } catch (err) { copyToClipboard(shareText); }
    } else { copyToClipboard(shareText); }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus('shared');
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch (err) { setShareStatus('error'); }
  };

  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, slogan: string, color: string, border: string, accent: string }> = {
    GENERAL: { label: isAr ? 'عام' : 'GENERAL', icon: <Utensils size={14} />, slogan: isAr ? 'يومي' : 'Daily', color: 'bg-[#C2A36B]', accent: 'text-[#C2A36B]', border: 'border-[#C2A36B]' },
    PREGNANCY: { label: isAr ? 'حمل' : 'PREGNANCY', icon: <Baby size={14} />, slogan: isAr ? 'نمو' : 'Growth', color: 'bg-[#E5C1CD]', accent: 'text-[#E5C1CD]', border: 'border-[#E5C1CD]' },
    DIABETIC: { label: isAr ? 'سكري' : 'DIABETIC', icon: <HeartPulse size={14} />, slogan: isAr ? 'توازن' : 'Sync', color: 'bg-[#64B5F6]', accent: 'text-[#64B5F6]', border: 'border-[#64B5F6]' },
    ATHLETE: { label: isAr ? 'رياضي' : 'ATHLETE', icon: <Zap size={14} />, slogan: isAr ? 'أداء' : 'Power', color: 'bg-[#FF7043]', accent: 'text-[#FF7043]', border: 'border-[#FF7043]' }
  };

  const activeConfig = personaConfigs[currentPersona];

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative h-screen bg-brand-dark flex items-center justify-center overflow-hidden pt-16 lg:pt-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full h-full flex flex-col lg:flex-row lg:items-center lg:gap-20">
        
        {/* Branding Column */}
        <div className="lg:w-[45%] flex flex-col justify-start lg:justify-center py-4 lg:py-6 animate-fade-in z-20 space-y-4 lg:space-y-12">
          <div className="space-y-2 lg:space-y-6 text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl lg:text-8xl font-serif font-bold text-white leading-tight lg:leading-[0.85] tracking-tighter">
              Precision <span className={`italic font-normal transition-colors duration-1000 ${activeConfig.accent}`}>Biometrics.</span>
            </h1>
            <p className="hidden lg:block text-white/30 text-base italic max-w-sm leading-relaxed">
              {isAr ? 'اختر البروتوكول لتعديل مخرجات التحليل الجزيئي.' : 'Select protocol to calibrate molecular diagnostic output.'}
            </p>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4 max-w-md">
            {(Object.keys(personaConfigs) as BioPersona[]).map((id) => {
              const p = personaConfigs[id];
              const isActive = currentPersona === id;
              return (
                <button
                  key={id}
                  onClick={() => setCurrentPersona(id)}
                  className={`group p-6 rounded-[35px] border transition-all duration-500 text-left relative overflow-hidden h-[140px] cursor-pointer active:scale-95
                    ${isActive ? `${p.color} ${p.border} text-brand-dark scale-[1.02]` : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-start">
                     <span className={`text-[7px] font-black uppercase tracking-widest block transition-colors duration-500 ${isActive ? 'text-brand-dark/60' : 'opacity-50 group-hover:text-white/60'}`}>PROTO</span>
                     <div className={`transition-all duration-500 ${isActive ? 'opacity-100 text-brand-dark' : 'opacity-20 group-hover:opacity-100'}`}>
                        {p.icon}
                     </div>
                  </div>
                  <div className="mt-auto">
                    <span className="text-lg font-sans font-bold block leading-none mb-1">{p.label}</span>
                    <span className={`text-[9px] italic font-medium block transition-colors duration-500 ${isActive ? 'text-brand-dark/50' : 'opacity-30'}`}>{p.slogan}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* The Diagnostic Scanner Unit */}
        <div className="flex-1 lg:flex-none lg:w-[55%] w-full flex flex-col items-center lg:items-end justify-center relative z-10 px-2 lg:px-0">
           <div className={`w-full max-w-[420px] lg:max-w-[480px] aspect-[4/5] bg-[#0A0908] rounded-[40px] lg:rounded-[60px] border transition-all duration-700 ${activeConfig.border} shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden`}>
              <div className="flex-1 m-2 lg:m-4 rounded-[30px] lg:rounded-[45px] bg-[#050505] overflow-hidden flex flex-col border border-white/5">
                 
                 <div className="p-4 lg:p-6 flex justify-between items-center bg-white/[0.02] border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-2">
                       <div className={`w-1 h-1 rounded-full animate-pulse transition-colors duration-1000 ${activeConfig.color}`} />
                       <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em]">
                         {status === 'loading' ? (isAr ? 'جاري الفحص...' : 'SCAN ACTIVE') : 'INTERFACE_v5'}
                       </span>
                    </div>
                    {(image || status !== 'idle') && (
                      <button onClick={handleReset} className="text-white/10 hover:text-brand-primary transition-all flex items-center gap-2 group/reset">
                         <span className="text-[7px] font-black tracking-widest uppercase">{isAr ? 'إعادة ضبط' : 'RESET'}</span>
                         <RotateCcw size={10} className="group-hover:rotate-180 transition-transform duration-500" />
                      </button>
                    )}
                 </div>

                 <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4 lg:p-8 flex flex-col justify-center relative">
                    {status === 'idle' && !image ? (
                      <div onClick={() => fileInputRef.current?.click()} className="h-full flex flex-col items-center justify-center text-center space-y-6 lg:space-y-10 cursor-pointer group/up py-4 animate-fade-in relative">
                         <div className={`relative w-32 h-32 lg:w-44 lg:h-44 bg-white/[0.03] border-2 border-dashed border-white/10 rounded-[50px] flex items-center justify-center transition-all duration-700 group-hover/up:${activeConfig.border}`}>
                            <div className="absolute inset-3 border border-white/5 rounded-[40px] animate-pulse-slow" />
                            <div className={`transition-all duration-700 ${activeConfig.accent} group-hover/up:scale-125`}>
                              <UploadCloud size={48} strokeWidth={1} />
                            </div>
                         </div>
                         <div className="space-y-4 max-w-[280px]">
                            <h4 className="text-2xl lg:text-3xl font-serif font-bold italic text-white/80">{isAr ? 'تلقيم العينة البيولوجية' : 'Insert Biometric Sample'}</h4>
                         </div>
                      </div>
                    ) : status === 'processing' ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-8 text-center animate-fade-in">
                         <div className={`w-20 h-20 rounded-full border-2 border-t-transparent animate-spin ${activeConfig.accent} ${activeConfig.border}`} />
                         <h5 className="text-lg font-serif italic text-white/60">{isAr ? 'معالجة جزيئات الصورة...' : 'Processing Specimen...'}</h5>
                      </div>
                    ) : status === 'idle' && image ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-6 lg:space-y-10 animate-fade-in">
                         <div className="relative aspect-square w-full max-w-[200px] lg:max-w-[300px] rounded-[50px] overflow-hidden border-2 border-white/10 shadow-4xl bg-zinc-900">
                            <img src={image} className="w-full h-full object-cover" alt="Sample" />
                            <div className={`absolute top-0 left-0 w-full h-[3px] shadow-glow animate-scan transition-colors duration-1000 ${activeConfig.color}`} />
                         </div>
                         <button onClick={handleAnalyze} className={`w-full py-5 lg:py-6 text-brand-dark rounded-3xl font-black text-[10px] uppercase tracking-[0.6em] shadow-glow transition-all flex items-center justify-center gap-4 ${activeConfig.color} hover:scale-[1.02]`}>
                            <Zap size={16} fill="currentColor" /> {isAr ? 'بدء الفحص الجزيئي' : 'INITIATE MOLECULAR SCAN'}
                         </button>
                      </div>
                    ) : status === 'loading' ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-8 lg:space-y-12 animate-fade-in">
                         <div className="relative w-36 h-36 lg:w-52 lg:h-52">
                            <svg className="w-full h-full -rotate-90">
                               <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" />
                               <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * progress / 100)} className={`transition-all duration-500 ${activeConfig.accent}`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                               <span className="text-4xl lg:text-6xl font-sans font-bold text-white">{progress}%</span>
                               <Activity size={18} className={`mt-2 ${activeConfig.accent} animate-pulse`} />
                            </div>
                         </div>
                         <h3 className={`font-black uppercase tracking-[0.6em] animate-pulse text-[9px] lg:text-[11px] ${activeConfig.accent}`}>{loadingStep}</h3>
                      </div>
                    ) : status === 'error' && errorMsg ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 lg:p-10 text-center animate-fade-in">
                         <div className="mb-6">
                            {errorMsg.type === 'quota' ? (
                              <div className="relative">
                                 <ShieldAlert size={48} className="text-brand-primary animate-pulse" />
                                 <div className="absolute -inset-4 bg-brand-primary/10 rounded-full blur-xl" />
                              </div>
                            ) : errorMsg.type === 'help' ? (
                              <Terminal size={48} className="text-brand-primary" />
                            ) : (
                              <AlertCircle size={48} className="text-red-500" />
                            )}
                         </div>
                         
                         <div className="space-y-4 mb-8">
                            <h4 className={`text-2xl lg:text-4xl font-serif font-bold italic tracking-tight ${errorMsg.type === 'general' ? 'text-red-500' : 'text-brand-primary'}`}>
                               {errorMsg.title}
                            </h4>
                            <p className="text-white/40 text-[11px] leading-relaxed max-w-xs mx-auto font-medium">
                               {errorMsg.detail}
                            </p>
                         </div>
                         
                         <div className="flex flex-col gap-3 w-full">
                            {(errorMsg.type === 'quota' || errorMsg.type === 'help') ? (
                              <button 
                                onClick={handleConnectPersonalKey} 
                                disabled={isConnectingKey}
                                className="w-full py-5 bg-brand-primary text-brand-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-glow flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-70"
                              >
                                 {isConnectingKey ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />} 
                                 {isAr ? 'ربط مفتاح شخصي' : 'LINK PERSONAL KEY'}
                              </button>
                            ) : null}
                            <button onClick={handleReset} className={`w-full py-5 bg-white/5 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] border border-white/10 transition-all hover:bg-white/10`}>
                               {isAr ? 'إعادة محاولة' : 'RESTART SYSTEM'}
                            </button>
                         </div>
                      </div>
                    ) : status === 'success' && lastAnalysisResult ? (
                      <div className="w-full space-y-4 lg:space-y-6 animate-fade-in h-full flex flex-col justify-center">
                         <div className="space-y-1">
                            <span className={`text-[7px] font-black uppercase tracking-widest ${activeConfig.accent}`}>{isAr ? 'النتائج المستخلصة' : 'BIO-REPORT'}</span>
                            <h2 className="text-sm lg:text-xl font-sans font-bold text-white tracking-tight">{lastAnalysisResult.summary}</h2>
                         </div>
                         <div className="grid grid-cols-2 gap-2 lg:gap-4">
                            <div className="bg-white/5 p-4 rounded-[25px] border border-white/5">
                               <span className="text-[6px] font-black uppercase text-white/30 block mb-1">ENERGY_LOAD</span>
                               <div className="text-2xl font-sans font-bold text-white">{lastAnalysisResult.totalCalories}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-[25px] border border-white/5">
                               <span className="text-[6px] font-black uppercase text-white/30 block mb-1">HEALTH_SCORE</span>
                               <div className="text-2xl font-sans font-bold text-white">{lastAnalysisResult.healthScore}%</div>
                            </div>
                         </div>
                         <div className="p-5 bg-white/5 border border-white/10 rounded-[30px] italic text-white/80 text-[10px] lg:text-sm">
                            "{lastAnalysisResult.personalizedAdvice}"
                         </div>
                         <div className="flex gap-2">
                            <button onClick={handleReset} className="flex-1 py-4 bg-brand-primary text-brand-dark rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                               <Camera size={14} /> {isAr ? 'فحص جديد' : 'NEW SCAN'}
                            </button>
                            <button 
                              onClick={handleShare}
                              className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest border border-white/5 hover:scale-105 transition-all
                                ${shareStatus === 'shared' ? 'bg-emerald-500 text-brand-dark' : 'bg-white/5 text-white'}`}
                            >
                               {shareStatus === 'shared' ? <Check size={14} /> : (navigator.share ? <Share2 size={14} /> : <Copy size={14} />)}
                               {shareStatus === 'shared' ? (isAr ? 'تم النسخ' : 'COPIED') : (isAr ? 'مشاركة' : 'SHARE')}
                            </button>
                         </div>
                      </div>
                    ) : null}
                 </div>

                 <div className="p-3 border-t border-white/5 flex justify-between bg-white/[0.01] shrink-0">
                    <span className="text-[6px] font-black text-white/10 uppercase tracking-[0.5em]">SYSTEM_STABLE_VERIFIED</span>
                 </div>
              </div>
           </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </section>
  );
};

export default Hero;

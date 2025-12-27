
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, RefreshCcw, Baby, HeartPulse, Zap, XCircle, Camera, Utensils, Activity, Flame, Target, Droplets, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';
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
  
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hoveredId, setHoveredId] = useState<BioPersona | null>(null);

  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stationRef = useRef<HTMLDivElement>(null);
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
      slogan: isAr ? 'تغذية الجنين' : 'Prenatal fuel',
      icon: <Baby size={14} />
    },
    { 
      id: 'DIABETIC' as BioPersona, 
      label: isAr ? 'سكري' : 'DIABETIC', 
      node: '03',
      slogan: isAr ? 'توازن السكر' : 'Glucose sync',
      icon: <HeartPulse size={14} />
    },
    { 
      id: 'ATHLETE' as BioPersona, 
      label: isAr ? 'رياضي' : 'ATHLETE', 
      node: '04',
      slogan: isAr ? 'أداء بدني' : 'Muscle fuel',
      icon: <Zap size={14} />
    }
  ];

  const handlePersonaSelect = (id: BioPersona) => {
    setCurrentPersona(id);
    setHasInteracted(true);
    
    // التمرير السلس إلى محطة التشخيص العملاقة
    setTimeout(() => {
      if (stationRef.current) {
        stationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setProgress(0);
    setErrorMessage('');
    
    const steps = isAr 
      ? ['تنشيط الرؤية الحاسوبية...', 'تحليل البروتوكول الجزيئي...', 'حساب القيم الحيوية...', 'توليد النصيحة الذهبية...'] 
      : ['Activating Computer Vision...', 'Analyzing Molecular Protocol...', 'Calculating Vital Metrics...', 'Generating Golden Insight...'];
    
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
    }, 150);

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
      setErrorMessage(isAr ? "حدث خطأ في الاتصال. يرجى التحقق من المفتاح." : "Connection error. Verify setup.");
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
          const maxDim = 1200; // جودة أعلى للتحليل العميق
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
             if (w > h) { h = (h * maxDim) / w; w = maxDim; }
             else { w = (w * maxDim) / h; h = maxDim; }
          }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          setImage(canvas.toDataURL('image/jpeg', 0.85)); 
          setStatus('idle'); 
          setProgress(0);
          
          // بعد اختيار الصورة، التمرير التلقائي لبدء التحليل
          if (stationRef.current) {
            stationRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative bg-brand-light dark:bg-brand-dark transition-colors duration-1000">
      
      {/* الشاشة الأولى: اختيار البروتوكول */}
      <div className="min-h-screen pt-32 pb-20 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">AI Diagnostic Unit</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-[0.9] tracking-tighter">
                  Precision <br /><span className="text-brand-primary italic font-normal">Command.</span>
                </h1>
                <p className="text-brand-dark/50 dark:text-white/30 text-lg italic max-w-md leading-relaxed">
                  {isAr ? 'اختر عقدتك الحيوية لتفعيل الرؤية الحاسوبية المخصصة.' : 'Select a bio-node to activate specialized computer vision.'}
                </p>
              </div>

              {/* شبكة الأزرار 2x2 - فخامة وحياد */}
              <div className="grid grid-cols-2 gap-3 md:gap-5 max-w-lg">
                {personaData.map((p) => {
                  const isActive = currentPersona === p.id;
                  const isHovered = hoveredId === p.id;
                  return (
                    <button
                      key={p.id}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => handlePersonaSelect(p.id)}
                      className={`group p-6 md:p-8 rounded-[40px] border transition-all duration-700 text-left relative overflow-hidden flex flex-col justify-between h-[130px] md:h-[160px]
                        ${isActive 
                          ? 'bg-brand-primary border-brand-primary text-white shadow-4xl scale-[1.03] z-10' 
                          : isHovered 
                            ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary scale-[1.02]'
                            : 'bg-white dark:bg-white/5 border-brand-dark/10 dark:border-white/10 text-brand-dark dark:text-white/40'}`}
                    >
                      <div className="flex justify-between items-start">
                         <span className={`text-[8px] font-black uppercase tracking-widest block opacity-50 ${isActive ? 'text-white' : 'text-brand-primary'}`}>NODE_{p.node}</span>
                         <div className={`transition-all duration-500 ${isActive ? 'scale-125 text-white' : isHovered ? 'scale-125 text-brand-primary opacity-100' : 'opacity-20'}`}>
                            {p.icon}
                         </div>
                      </div>
                      <div className="mt-auto">
                        <span className={`text-base md:text-lg font-bold block mb-1 ${isActive ? 'text-white' : isHovered ? 'text-brand-primary' : ''}`}>{p.label}</span>
                        <span className={`text-[10px] italic font-medium block leading-tight ${isActive ? 'text-white/70' : 'opacity-30'}`}>{p.slogan}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="hidden lg:flex flex-col items-center justify-center h-full">
               <div className="relative animate-float-slow">
                  <div className="w-80 h-80 rounded-full border border-brand-primary/10 flex items-center justify-center">
                     <div className="w-60 h-60 rounded-full border border-brand-primary/20 flex items-center justify-center">
                        <div className="w-40 h-40 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary">
                           <Activity size={48} className="animate-pulse" />
                        </div>
                     </div>
                  </div>
               </div>
               <div className="mt-12 text-center space-y-2 opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-[0.6em]">{isAr ? 'النظام بانتظار المدخلات' : 'SYSTEM AWAITING INPUT'}</p>
                  <ChevronDown className="mx-auto animate-bounce" size={20} />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* الشاشة الثانية: منصة التشخيص العملاقة (The Station) */}
      <div ref={stationRef} className="min-h-screen bg-brand-dark relative flex flex-col lg:flex-row overflow-hidden border-t border-white/5 scroll-mt-0">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        
        {/* الجانب الأيسر: الرؤية البصرية */}
        <div className="lg:w-1/2 relative h-[50vh] lg:h-screen bg-black overflow-hidden flex items-center justify-center">
          {!image ? (
            <div onClick={() => fileInputRef.current?.click()} className="group cursor-pointer flex flex-col items-center gap-8 p-12 text-center max-w-sm">
               <div className="w-24 h-24 rounded-full border border-dashed border-brand-primary/30 flex items-center justify-center text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary/10 transition-all duration-700 shadow-glow">
                  <Camera size={40} />
               </div>
               <div className="space-y-2">
                  <h4 className="text-2xl font-serif font-bold italic text-white/50">{isAr ? 'تنشيط الكاميرا' : 'Activate Vision'}</h4>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">{isAr ? 'أدخل بيانات الوجبة' : 'INPUT MEAL SAMPLE'}</p>
               </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
               <img src={image} className={`w-full h-full object-cover transition-all duration-[3s] ${status === 'success' ? 'scale-105 saturate-125' : 'grayscale-[0.4]'}`} alt="Sample" />
               {status === 'loading' && <div className="absolute inset-x-0 h-2 bg-brand-primary shadow-[0_0_40px_#C2A36B] animate-scan z-30" />}
               <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
               <button onClick={() => { setImage(null); setStatus('idle'); }} className="absolute bottom-10 left-10 p-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-brand-primary transition-all z-40">
                  <RotateCcw size={20} />
               </button>
            </div>
          )}
        </div>

        {/* الجانب الأيمن: البيانات والنتائج */}
        <div className="lg:w-1/2 p-10 md:p-16 lg:p-24 flex flex-col justify-center overflow-y-auto bg-grain relative">
          
          {status === 'idle' && (
            <div className="space-y-12 animate-fade-in text-center lg:text-left">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 text-brand-primary font-black text-[10px] uppercase tracking-[0.5em]">{isAr ? 'عقدة التشخيص' : 'DIAGNOSTIC_NODE'}: {currentPersona}</div>
                  <h2 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter leading-none">{isAr ? 'جاهز للمزامنة؟' : 'Ready to Sync?'}</h2>
                  <p className="text-white/30 text-lg italic">{isAr ? 'قم برفع صورة وجبتك لتحويلها إلى بروتوكول بيانات دقيق.' : 'Upload your meal sample to transform it into a high-precision data protocol.'}</p>
               </div>
               {image && (
                 <button onClick={handleAnalyze} className="w-full max-w-md py-7 bg-brand-primary text-brand-dark rounded-full font-black text-xs uppercase tracking-[0.6em] shadow-glow hover:scale-[1.02] active:scale-95 transition-all mx-auto lg:mx-0">
                    {isAr ? 'تنشيط التحليل الجزيئي' : 'INITIATE MOLECULAR ANALYSIS'}
                 </button>
               )}
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-12 animate-fade-in">
               <div className="relative w-48 h-48 mx-auto lg:mx-0">
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                     <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * progress / 100)} className="text-brand-primary transition-all duration-300" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-serif font-bold text-4xl text-white">{progress}%</div>
               </div>
               <div className="space-y-4 text-center lg:text-left">
                  <h3 className="text-brand-primary font-black uppercase tracking-[0.6em] animate-pulse text-lg">{loadingStep}</h3>
                  <p className="text-white/20 text-[10px] italic">{isAr ? 'خوارزميات Gemini تفكك المكونات الآن...' : 'Gemini AI Algorithms deconstructing ingredients...'}</p>
               </div>
            </div>
          )}

          {status === 'success' && lastAnalysisResult && (
            <div className="space-y-12 animate-fade-in">
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-brand-primary font-black text-[10px] uppercase tracking-[0.5em]">
                     <Sparkles size={16} /> {isAr ? 'تحليل موثق' : 'VERIFIED_ANALYSIS'}
                  </div>
                  <h2 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter leading-tight">{lastAnalysisResult.summary}</h2>
               </div>

               {/* لوحة البيانات الرئيسية */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 flex flex-col justify-between h-[200px] hover:bg-white/10 transition-colors group">
                     <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{isAr ? 'الطاقة الكلية' : 'Total Energy'}</span>
                        <Flame className="text-brand-primary group-hover:scale-125 transition-transform" size={24} />
                     </div>
                     <div className="text-6xl font-serif font-bold text-white">{lastAnalysisResult.totalCalories} <span className="text-xl text-brand-primary/50">kcal</span></div>
                  </div>
                  
                  <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 flex flex-col justify-between h-[200px] hover:bg-white/10 transition-colors group">
                     <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{isAr ? 'مؤشر الحيوية' : 'Vitality Index'}</span>
                        <Target className="text-brand-primary group-hover:scale-125 transition-transform" size={24} />
                     </div>
                     <div className="flex items-end gap-6">
                        <span className="text-6xl font-serif font-bold text-white">{lastAnalysisResult.healthScore}%</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
                           <div className="h-full bg-brand-primary" style={{ width: `${lastAnalysisResult.healthScore}%` }} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* تفصيل المغذيات الكبرى (Macros) */}
               <div className="bg-white/5 p-10 rounded-[60px] border border-white/5 space-y-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">{isAr ? 'توزيع الوحدات البنائية' : 'METABOLIC SUBSTRATES'}</h4>
                  <div className="grid grid-cols-3 gap-8">
                     {[
                       { l: isAr ? 'بروتين' : 'PROTEIN', v: lastAnalysisResult.macros.protein, c: 'text-brand-primary', icon: <Zap size={16} /> },
                       { l: isAr ? 'كربوهيدرات' : 'CARBS', v: lastAnalysisResult.macros.carbs, c: 'text-emerald-500', icon: <Activity size={16} /> },
                       { l: isAr ? 'دهون' : 'LIPIDS', v: lastAnalysisResult.macros.fat, c: 'text-blue-400', icon: <Droplets size={16} /> }
                     ].map((m, i) => (
                       <div key={i} className="space-y-3">
                          <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${m.c}`}>{m.icon} {m.l}</div>
                          <div className="text-3xl font-serif font-bold text-white">{m.v} <span className="text-sm opacity-30 italic">g</span></div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* التوصية والنصيحة المخصصة */}
               <div className="p-12 bg-brand-primary text-brand-dark rounded-[60px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000"><ShieldAlert size={80} /></div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.6em] mb-6 opacity-60">{isAr ? 'نصيحة الخبير الذكي' : 'CHIEF ANALYST ADVICE'}</h4>
                  <p className="text-2xl md:text-3xl font-serif font-bold italic leading-tight">"{lastAnalysisResult.personalizedAdvice}"</p>
               </div>

               <div className="flex flex-col md:flex-row gap-5 pt-10">
                  <button onClick={() => { setView('home'); setTimeout(() => { const el = document.getElementById(SectionId.PHASE_03_SYNTHESIS); if(el) window.scrollTo({top: el.offsetTop - 80, behavior: 'smooth'}); }, 400); }} className="flex-1 py-7 bg-white text-brand-dark rounded-full font-black text-[11px] uppercase tracking-[0.5em] hover:bg-brand-primary hover:text-white transition-all shadow-4xl active:scale-95">Generate Full Protocol</button>
                  <button onClick={() => { setImage(null); setStatus('idle'); }} className="py-7 px-10 border border-white/10 text-white/40 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                     <RotateCcw size={16} /> {isAr ? 'مسح جديد' : 'NEW SCAN'}
                  </button>
               </div>
            </div>
          )}

          {status === 'error' && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white space-y-8 animate-fade-in">
               <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500"><XCircle size={48} /></div>
               <div className="space-y-4">
                  <h4 className="text-3xl font-serif font-bold italic">{isAr ? 'خطأ في تشفير البيانات' : 'Data Encryption Fault'}</h4>
                  <p className="text-white/40 max-w-sm mx-auto">{errorMessage}</p>
               </div>
               <button onClick={handleAnalyze} className="w-full max-w-sm bg-white text-brand-dark py-6 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-primary transition-all shadow-glow"><RefreshCcw size={18} /> {isAr ? 'إعادة المحاولة' : 'RETRY PROTOCOL'}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;


import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Baby, HeartPulse, Zap, Camera, Utensils, Activity, Flame, Target, Sparkles, Monitor as MonitorIcon } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language, setView } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stationRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const personaData = [
    { id: 'GENERAL' as BioPersona, label: isAr ? 'عام' : 'GENERAL', node: '01', slogan: isAr ? 'وجبة يومية' : 'Daily Meal', icon: <Utensils size={14} /> },
    { id: 'PREGNANCY' as BioPersona, label: isAr ? 'حمل' : 'PREGNANCY', node: '02', slogan: isAr ? 'تغذية الجنين' : 'Prenatal fuel', icon: <Baby size={14} /> },
    { id: 'DIABETIC' as BioPersona, label: isAr ? 'سكري' : 'DIABETIC', node: '03', slogan: isAr ? 'توازن السكر' : 'Glucose sync', icon: <HeartPulse size={14} /> },
    { id: 'ATHLETE' as BioPersona, label: isAr ? 'رياضي' : 'ATHLETE', node: '04', slogan: isAr ? 'أداء بدني' : 'Muscle fuel', icon: <Zap size={14} /> }
  ];

  const handlePersonaSelect = (id: BioPersona) => {
    setCurrentPersona(id);
    // في الجوال، ننتقل للسكانر بعد اختيار البروتوكول
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        stationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setProgress(0);
    
    const steps = isAr 
      ? ['تنشيط الماسح الضوئي...', 'تحليل المكونات...', 'مزامنة البيانات...', 'توليد البروتوكول...'] 
      : ['Activating Scanner...', 'Analyzing Ingredients...', 'Syncing Data...', 'Generating Protocol...'];
    
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
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setImage(reader.result as string);
        setStatus('idle'); 
        setProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-dark overflow-hidden flex flex-col">
      
      {/* القسم العلوي: الهيرو المنقسم (ديسكتوب) أو المتسلسل (جوال) */}
      <div className="flex-1 flex items-center justify-center pt-32 pb-12 lg:py-0">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* اليسار (ديسكتوب) / الأعلى (جوال): النصوص والخيارات */}
            <div className="space-y-12 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">AI Diagnostic Unit</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-serif font-bold text-white leading-[0.9] tracking-tighter">
                  Precision <br /><span className="text-brand-primary italic font-normal">Command.</span>
                </h1>
                <p className="text-white/40 text-lg italic max-w-md leading-relaxed">
                  {isAr ? 'اختر البروتوكول الصحي لبدء فحص وجبتك.' : 'Select your health protocol to start scanning your meal.'}
                </p>
              </div>

              {/* شبكة الأزرار 2x2 - موحدة بالكامل */}
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                {personaData.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaSelect(p.id)}
                    className={`group p-6 md:p-8 rounded-[40px] border transition-all duration-700 text-left relative overflow-hidden flex flex-col justify-between h-[130px] md:h-[150px]
                      bg-white/5 border-white/10 text-white/40
                      hover:bg-brand-primary hover:border-brand-primary hover:text-brand-dark hover:scale-[1.03] hover:shadow-glow
                      ${currentPersona === p.id ? 'ring-2 ring-brand-primary/20' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                       <span className="text-[8px] font-black uppercase tracking-widest block opacity-50 group-hover:opacity-100 group-hover:text-brand-dark">PROTOCOL</span>
                       <div className="transition-all duration-500 opacity-20 group-hover:opacity-100 group-hover:scale-125 group-hover:text-brand-dark">
                          {p.icon}
                       </div>
                    </div>
                    <div className="mt-auto">
                      <span className="text-lg md:text-xl font-serif font-bold block mb-1 group-hover:text-brand-dark">{p.label}</span>
                      <span className="text-[9px] italic font-medium block opacity-30 group-hover:opacity-70 group-hover:text-brand-dark/60">{p.slogan}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* اليمين (ديسكتوب) / الأسفل (جوال): شاشة السكانر المؤطرة */}
            <div ref={stationRef} className="relative w-full py-12 lg:py-24">
               {/* الإطار الخارجي (The Monitor Frame) */}
               <div className="w-full max-w-[550px] mx-auto aspect-[4/5] bg-[#0A0A0A] rounded-[60px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative group">
                  
                  {/* محتوى الشاشة الداخلي */}
                  <div className="flex-1 p-10 md:p-14 flex flex-col relative z-10 overflow-y-auto no-scrollbar">
                     
                     {/* الهيدر الصغير داخل الشاشة */}
                     <div className="flex justify-between items-center mb-10 shrink-0">
                        <div className="bg-brand-primary/10 border border-brand-primary/20 px-4 py-1.5 rounded-full flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                           <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">BIO_READY</span>
                        </div>
                        {image && (
                          <button onClick={() => { setImage(null); setStatus('idle'); }} className="text-white/20 hover:text-brand-primary transition-colors">
                             <RotateCcw size={18} />
                          </button>
                        )}
                     </div>

                     {/* منطقة التفاعل المركزية */}
                     <div className="flex-1 flex flex-col justify-center items-center">
                        {status === 'idle' && !image ? (
                          <div onClick={() => fileInputRef.current?.click()} className="text-center space-y-8 cursor-pointer group/upload">
                             <div className="w-28 h-28 bg-brand-primary/5 border border-dashed border-brand-primary/30 rounded-full flex items-center justify-center text-brand-primary group-hover/upload:bg-brand-primary group-hover/upload:text-brand-dark transition-all duration-700 shadow-glow mx-auto">
                                <Camera size={44} />
                             </div>
                             <div className="space-y-2">
                                <h4 className="text-3xl font-serif font-bold italic text-white/50">{isAr ? 'ارفع العينة' : 'Upload Sample'}</h4>
                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em]">{isAr ? 'اضغط لتفعيل البصيرة' : 'ACTIVATE VISION'}</p>
                             </div>
                          </div>
                        ) : status === 'idle' && image ? (
                          <div className="w-full space-y-10 animate-fade-in text-center">
                             <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/5 shadow-2xl mx-auto max-w-[280px]">
                                <img src={image} className="w-full h-full object-cover grayscale-[0.3]" alt="Sample" />
                                <div className="absolute inset-0 bg-brand-primary/10" />
                             </div>
                             <button onClick={handleAnalyze} className="w-full py-7 bg-brand-primary text-brand-dark rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-glow hover:scale-[1.02] transition-all">
                                {isAr ? 'بدء الفحص' : 'INITIATE SCAN'}
                             </button>
                          </div>
                        ) : status === 'loading' ? (
                          <div className="space-y-12 animate-fade-in text-center">
                             <div className="relative w-48 h-48 mx-auto">
                                <svg className="w-full h-full -rotate-90">
                                   <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                                   <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * progress / 100)} className="text-brand-primary transition-all duration-300 shadow-glow" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-serif font-bold text-4xl text-white">{progress}%</div>
                             </div>
                             <div className="space-y-4">
                                <h3 className="text-brand-primary font-black uppercase tracking-[0.6em] animate-pulse text-lg">{loadingStep}</h3>
                                <p className="text-white/20 text-[10px] italic tracking-widest">GEMINI_CORE_LINKED</p>
                             </div>
                          </div>
                        ) : status === 'success' && lastAnalysisResult ? (
                          <div className="w-full space-y-10 animate-fade-in text-left">
                             <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tighter italic leading-tight">
                               {lastAnalysisResult.summary}
                             </h2>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-6 rounded-[35px] border border-white/5">
                                   <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">ENERGY</span>
                                   <div className="text-3xl font-serif font-bold text-white">{lastAnalysisResult.totalCalories} <span className="text-xs opacity-40">kcal</span></div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-[35px] border border-white/5">
                                   <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">VITALITY</span>
                                   <div className="text-3xl font-serif font-bold text-white">{lastAnalysisResult.healthScore}%</div>
                                </div>
                             </div>

                             <div className="p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-[40px] relative">
                                <p className="text-white/60 text-sm font-medium italic leading-relaxed">
                                   "{lastAnalysisResult.personalizedAdvice}"
                                </p>
                             </div>
                          </div>
                        ) : null}
                     </div>

                     {/* الفوتر داخل الشاشة */}
                     <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center shrink-0">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">VERIFIED_BY_GEMINI</span>
                        <MonitorIcon size={14} className="text-white/10" />
                     </div>
                  </div>

                  {/* إضاءة جانبية للإطار */}
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-brand-primary/30" />
               </div>

               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

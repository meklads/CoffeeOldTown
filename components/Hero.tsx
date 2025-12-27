
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Baby, HeartPulse, Zap, Camera, Utensils, Monitor as MonitorIcon, Share2, AlertTriangle, Info, Download, FileText } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stationRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const personaData = [
    { id: 'GENERAL' as BioPersona, label: isAr ? 'عام' : 'GENERAL', icon: <Utensils size={14} />, slogan: isAr ? 'وجبة يومية' : 'Daily Meal' },
    { id: 'PREGNANCY' as BioPersona, label: isAr ? 'حمل' : 'PREGNANCY', icon: <Baby size={14} />, slogan: isAr ? 'تغذية الجنين' : 'Prenatal fuel' },
    { id: 'DIABETIC' as BioPersona, label: isAr ? 'سكري' : 'DIABETIC', icon: <HeartPulse size={14} />, slogan: isAr ? 'توازن السكر' : 'Glucose sync' },
    { id: 'ATHLETE' as BioPersona, label: isAr ? 'رياضي' : 'ATHLETE', icon: <Zap size={14} />, slogan: isAr ? 'أداء بدني' : 'Muscle fuel' }
  ];

  const handlePersonaSelect = (id: BioPersona) => {
    setCurrentPersona(id);
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
      ? ['تنشيط العدسات...', 'تحليل الجزيئات...', 'فحص المحاذير الحيوية...', 'توليد التقرير...'] 
      : ['Activating Lens...', 'Molecular Analysis...', 'Checking Bio-Warnings...', 'Generating Report...'];
    
    let currentStepIdx = 0;
    setLoadingStep(steps[0]);

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 4) + 1;
        if (next >= 99) return 99;
        const stepIdx = Math.floor((next / 100) * steps.length);
        if (stepIdx !== currentStepIdx && stepIdx < steps.length) {
          currentStepIdx = stepIdx;
          setLoadingStep(steps[stepIdx]);
        }
        return next;
      });
    }, 120);

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
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: image });
        incrementScans(result);
        setStatus('success');
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
    }
  };

  const handleDownloadReport = () => {
    if (!lastAnalysisResult) return;
    
    const reportText = `
COFFEE OLD TOWN LAB - BIOMETRIC REPORT
--------------------------------------
Timestamp: ${lastAnalysisResult.timestamp}
Protocol: ${currentPersona}
Summary: ${lastAnalysisResult.summary}
Total Energy: ${lastAnalysisResult.totalCalories} kcal
Health Score: ${lastAnalysisResult.healthScore}/100

MACRONUTRIENTS:
- Protein: ${lastAnalysisResult.macros.protein}g
- Carbs: ${lastAnalysisResult.macros.carbs}g
- Fats: ${lastAnalysisResult.macros.fat}g

DIAGNOSTIC ADVICE:
${lastAnalysisResult.personalizedAdvice}

WARNINGS:
${lastAnalysisResult.warnings?.map(w => typeof w === 'string' ? `- ${w}` : `- ${w.text}`).join('\n') || 'None'}

VERIFIED BY GEMINI AI SYSTEM v5.0
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OTL-Report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share && lastAnalysisResult) {
      try {
        await navigator.share({
          title: 'Old Town Bio-Report',
          text: `My meal analysis: ${lastAnalysisResult.summary} (${lastAnalysisResult.totalCalories} kcal)`,
          url: window.location.href,
        });
      } catch (err) { console.log(err); }
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
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-dark overflow-hidden flex flex-col pt-16">
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row lg:items-stretch gap-12 lg:gap-20 py-10">
          
          {/* الكتلة اليسرى: النصوص والبروتوكولات */}
          <div className="lg:w-1/2 flex flex-col justify-between py-2 animate-fade-in order-1">
            <div className="space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Diagnostic Unit v5.0</span>
              </div>
              <h1 className="text-6xl md:text-8xl xl:text-[110px] font-serif font-bold text-white leading-[0.85] tracking-tighter">
                Precision <br /><span className="text-brand-primary italic font-normal text-5xl md:text-7xl xl:text-8xl">Biometrics.</span>
              </h1>
              <p className="text-white/40 text-lg italic max-w-md leading-relaxed">
                {isAr ? 'اختر البروتوكول الحيوي لبدء فحص العينة وتحليل جودة الغذاء.' : 'Select your bio-protocol to initiate molecular scanning.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 lg:mt-0 max-w-lg">
              {personaData.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePersonaSelect(p.id)}
                  className={`group p-6 md:p-8 rounded-[35px] border transition-all duration-700 text-left relative overflow-hidden flex flex-col justify-between h-[140px] md:h-[160px]
                    bg-white/5 border-white/10 text-white/40
                    hover:bg-brand-primary hover:border-brand-primary hover:text-brand-dark hover:scale-[1.03]
                    ${currentPersona === p.id ? 'ring-2 ring-brand-primary/50 bg-white/10 border-brand-primary/30 text-white' : ''}`}
                >
                  <div className="flex justify-between items-start">
                     <span className="text-[8px] font-black uppercase tracking-widest block opacity-50 group-hover:text-brand-dark">PROTOCOL</span>
                     <div className="transition-all duration-500 opacity-20 group-hover:opacity-100 group-hover:scale-125 group-hover:text-brand-dark">
                        {p.icon}
                     </div>
                  </div>
                  <div className="mt-auto">
                    <span className="text-xl font-serif font-bold block mb-1 group-hover:text-brand-dark">{p.label}</span>
                    <span className="text-[9px] italic font-medium block opacity-30 group-hover:opacity-70 group-hover:text-brand-dark/60">{p.slogan}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* الكتلة اليمنى: شاشة السكانر (The Monitor Frame) */}
          <div ref={stationRef} className="lg:w-1/2 w-full order-2 flex flex-col justify-center">
               <div className="w-full max-w-[500px] mx-auto bg-[#0F0D0C] rounded-[55px] md:rounded-[65px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative group m-6 md:m-0">
                  
                  {/* شاشة النتائج الداخلية */}
                  <div className="flex-1 p-8 md:p-12 flex flex-col relative z-10 h-[750px] md:h-[730px] overflow-y-auto no-scrollbar bg-[#050505]">
                     
                     <div className="flex justify-between items-center mb-10 shrink-0">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                           <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">SYSTEM_LIVE</span>
                        </div>
                        {image && (
                          <button onClick={() => { setImage(null); setStatus('idle'); }} className="text-white/20 hover:text-brand-primary transition-all">
                             <RotateCcw size={16} />
                          </button>
                        )}
                     </div>

                     <div className="flex-grow flex flex-col justify-center">
                        {status === 'idle' && !image ? (
                          <div onClick={() => fileInputRef.current?.click()} className="text-center space-y-12 cursor-pointer group/up">
                             <div className="w-32 h-32 bg-brand-primary/5 border border-dashed border-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary group-hover/up:bg-brand-primary group-hover/up:text-brand-dark transition-all duration-700 mx-auto shadow-glow">
                                <Camera size={48} strokeWidth={1} />
                             </div>
                             <div className="space-y-3">
                                <h4 className="text-4xl font-serif font-bold italic text-white/60">{isAr ? 'ارفع العينة' : 'Feed Vision'}</h4>
                                <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.6em]">{isAr ? 'اضغط للبدء' : 'INITIATE ANALYSIS'}</p>
                             </div>
                          </div>
                        ) : status === 'idle' && image ? (
                          <div className="space-y-12 animate-fade-in text-center">
                             <div className="relative aspect-square rounded-[45px] overflow-hidden border border-white/5 shadow-2xl mx-auto max-w-[300px]">
                                <img src={image} className="w-full h-full object-cover grayscale-[0.3]" alt="Sample" />
                                <div className="absolute inset-0 bg-brand-primary/5 shadow-inner" />
                             </div>
                             <button onClick={handleAnalyze} className="w-full py-8 bg-brand-primary text-brand-dark rounded-full font-black text-[12px] uppercase tracking-[0.5em] shadow-glow hover:scale-[1.02] transition-all">
                                {isAr ? 'بدء الفحص' : 'INITIATE SCAN'}
                             </button>
                          </div>
                        ) : status === 'loading' ? (
                          <div className="space-y-16 animate-fade-in text-center">
                             <div className="relative w-56 h-56 mx-auto">
                                <svg className="w-full h-full -rotate-90">
                                   <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" />
                                   <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * progress / 100)} className="text-brand-primary transition-all duration-500" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-serif font-bold text-5xl text-white">{progress}%</div>
                             </div>
                             <h3 className="text-brand-primary font-black uppercase tracking-[0.7em] animate-pulse text-sm">{loadingStep}</h3>
                          </div>
                        ) : status === 'success' && lastAnalysisResult ? (
                          <div className="w-full space-y-10 animate-fade-in py-4">
                             <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <FileText size={12} className="text-brand-primary" />
                                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{isAr ? 'التقرير الأيضي' : 'BIO-REPORT'}</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight leading-relaxed">{lastAnalysisResult.summary}</h2>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                                   <span className="text-[9px] font-black uppercase text-white/30 block mb-3">ENERGY</span>
                                   <div className="text-4xl font-serif font-bold text-white">{lastAnalysisResult.totalCalories} <span className="text-xs ml-1 opacity-30">kcal</span></div>
                                </div>
                                <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                                   <span className="text-[9px] font-black uppercase text-white/30 block mb-3">VITALITY</span>
                                   <div className="text-4xl font-serif font-bold text-white">{lastAnalysisResult.healthScore}%</div>
                                </div>
                             </div>

                             <div className="flex gap-3">
                                {['protein', 'carbs', 'fat'].map((macro) => (
                                  <div key={macro} className="flex-1 bg-white/5 py-5 rounded-[28px] border border-white/5 text-center">
                                    <span className="text-[9px] font-black text-white/20 uppercase block mb-1">{macro}</span>
                                    <span className="text-base font-sans font-bold text-white">{(lastAnalysisResult.macros as any)[macro]}g</span>
                                  </div>
                                ))}
                             </div>

                             {lastAnalysisResult.warnings && lastAnalysisResult.warnings.length > 0 && (
                               <div className="p-7 bg-red-500/10 border border-red-500/20 rounded-[40px] flex gap-6 items-start">
                                  <AlertTriangle size={22} className="text-red-500 shrink-0 mt-1" />
                                  <div className="space-y-1">
                                     <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">CRITICAL ALERT</span>
                                     <p className="text-xs font-sans text-white/70 leading-relaxed">
                                       {typeof lastAnalysisResult.warnings[0] === 'object' ? (lastAnalysisResult.warnings[0] as any).text : lastAnalysisResult.warnings[0]}
                                     </p>
                                  </div>
                               </div>
                             )}

                             <div className="p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-[45px] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-5 text-brand-primary/20"><Info size={20} /></div>
                                <p className="text-white/80 text-sm font-sans italic leading-relaxed">"{lastAnalysisResult.personalizedAdvice}"</p>
                             </div>

                             <div className="flex gap-4 pt-6">
                                <button onClick={handleShare} className="flex-1 py-6 bg-white/10 hover:bg-brand-primary hover:text-brand-dark transition-all rounded-[28px] flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-white">
                                   <Share2 size={18} /> SHARE
                                </button>
                                <button onClick={handleDownloadReport} className="w-24 py-6 bg-white/10 hover:bg-white hover:text-brand-dark transition-all rounded-[28px] flex items-center justify-center text-white">
                                   <Download size={20} />
                                </button>
                             </div>
                          </div>
                        ) : null}
                     </div>

                     <div className="mt-8 pt-10 border-t border-white/5 flex justify-between items-center shrink-0 opacity-30">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em]">GEMINI_AI_VERIFIED</span>
                        <div className="flex gap-2">
                           <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                           <div className="w-1 h-1 rounded-full bg-brand-primary/50 animate-pulse delay-75" />
                           <div className="w-1 h-1 rounded-full bg-brand-primary/20 animate-pulse delay-150" />
                        </div>
                     </div>
                  </div>

                  {/* تفاصيل الهاردوير الجانبية */}
                  <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-brand-primary/10" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-24 w-1 bg-brand-primary/40 rounded-r-full shadow-glow" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/10 rounded-full" />
               </div>

               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

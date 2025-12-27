
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
          
          {/* الكتلة اليسرى: النصوص والبروتوكولات (تحدد الارتفاع) */}
          <div className="lg:w-1/2 flex flex-col justify-between py-2 animate-fade-in order-1">
            <div className="space-y-6 md:space-y-10">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Diagnostic Unit v5.0</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl xl:text-[115px] font-serif font-bold text-white leading-[0.82] tracking-tighter">
                  Precision <br /><span className="text-brand-primary italic font-normal text-5xl md:text-7xl xl:text-[100px]">Biometrics.</span>
                </h1>
                <p className="text-white/40 text-lg md:text-xl italic max-w-md leading-relaxed">
                  {isAr ? 'اختر البروتوكول الحيوي لبدء فحص العينة وتحليل جودة الغذاء.' : 'Select your bio-protocol to initiate molecular scanning.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mt-12 lg:mt-0 max-w-lg">
              {personaData.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePersonaSelect(p.id)}
                  className={`group p-6 md:p-8 rounded-[40px] border transition-all duration-700 text-left relative overflow-hidden flex flex-col justify-between h-[150px] md:h-[180px]
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
                    <span className="text-xl md:text-2xl font-serif font-bold block mb-1 group-hover:text-brand-dark">{p.label}</span>
                    <span className="text-[10px] italic font-medium block opacity-30 group-hover:opacity-70 group-hover:text-brand-dark/60">{p.slogan}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* الكتلة اليمنى: شاشة السكانر (The Monitor Frame) */}
          {/* تم استخدام flex-grow و items-stretch لضمان التساوي في الارتفاع مع اليسار */}
          <div ref={stationRef} className="lg:w-1/2 w-full order-2 flex flex-col items-stretch">
               <div className="w-full max-w-[500px] ml-auto bg-[#0F0D0C] rounded-[55px] md:rounded-[75px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative group h-full">
                  
                  {/* شاشة النتائج الداخلية - الارتفاع h-full مع سكرول داخلي */}
                  <div className="flex-1 p-8 md:p-14 flex flex-col relative z-10 h-full bg-[#050505] overflow-y-auto no-scrollbar">
                     
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
                          <div onClick={() => fileInputRef.current?.click()} className="text-center space-y-12 cursor-pointer group/up py-20">
                             <div className="w-32 h-32 bg-brand-primary/5 border border-dashed border-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary group-hover/up:bg-brand-primary group-hover/up:text-brand-dark transition-all duration-700 mx-auto shadow-glow">
                                <Camera size={48} strokeWidth={1} />
                             </div>
                             <div className="space-y-4">
                                <h4 className="text-4xl font-serif font-bold italic text-white/60">{isAr ? 'ارفع العينة' : 'Feed Vision'}</h4>
                                <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.6em]">{isAr ? 'اضغط للبدء' : 'INITIATE ANALYSIS'}</p>
                             </div>
                          </div>
                        ) : status === 'idle' && image ? (
                          <div className="space-y-14 animate-fade-in text-center py-10">
                             <div className="relative aspect-square rounded-[50px] overflow-hidden border border-white/5 shadow-2xl mx-auto max-w-[320px]">
                                <img src={image} className="w-full h-full object-cover grayscale-[0.3]" alt="Sample" />
                                <div className="absolute inset-0 bg-brand-primary/5 shadow-inner" />
                             </div>
                             <button onClick={handleAnalyze} className="w-full py-8 bg-brand-primary text-brand-dark rounded-full font-black text-[12px] uppercase tracking-[0.5em] shadow-glow hover:scale-[1.02] transition-all">
                                {isAr ? 'بدء الفحص' : 'INITIATE SCAN'}
                             </button>
                          </div>
                        ) : status === 'loading' ? (
                          <div className="space-y-16 animate-fade-in text-center py-20">
                             <div className="relative w-60 h-60 mx-auto">
                                <svg className="w-full h-full -rotate-90">
                                   <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" />
                                   <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * progress / 100)} className="text-brand-primary transition-all duration-500" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-serif font-bold text-6xl text-white">{progress}%</div>
                             </div>
                             <h3 className="text-brand-primary font-black uppercase tracking-[0.7em] animate-pulse text-sm">{loadingStep}</h3>
                          </div>
                        ) : status === 'success' && lastAnalysisResult ? (
                          <div className="w-full space-y-12 animate-fade-in py-6">
                             <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <FileText size={14} className="text-brand-primary" />
                                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{isAr ? 'التقرير الأيضي' : 'BIO-REPORT'}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight leading-relaxed">{lastAnalysisResult.summary}</h2>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-5">
                                <div className="bg-white/5 p-8 rounded-[45px] border border-white/5 group/stat">
                                   <span className="text-[9px] font-black uppercase text-white/30 block mb-4 group-hover/stat:text-brand-primary transition-colors">ENERGY</span>
                                   <div className="text-5xl font-serif font-bold text-white">{lastAnalysisResult.totalCalories} <span className="text-xs ml-1 opacity-30 font-sans">kcal</span></div>
                                </div>
                                <div className="bg-white/5 p-8 rounded-[45px] border border-white/5 group/stat">
                                   <span className="text-[9px] font-black uppercase text-white/30 block mb-4 group-hover/stat:text-brand-primary transition-colors">VITALITY</span>
                                   <div className="text-5xl font-serif font-bold text-white">{lastAnalysisResult.healthScore}%</div>
                                </div>
                             </div>

                             <div className="flex gap-4">
                                {['protein', 'carbs', 'fat'].map((macro) => (
                                  <div key={macro} className="flex-1 bg-white/5 py-6 rounded-[30px] border border-white/5 text-center">
                                    <span className="text-[9px] font-black text-white/20 uppercase block mb-2">{macro}</span>
                                    <span className="text-xl font-sans font-bold text-white">{(lastAnalysisResult.macros as any)[macro]}g</span>
                                  </div>
                                ))}
                             </div>

                             {lastAnalysisResult.warnings && lastAnalysisResult.warnings.length > 0 && (
                               <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[45px] flex gap-6 items-start">
                                  <AlertTriangle size={24} className="text-red-500 shrink-0 mt-1" />
                                  <div className="space-y-2">
                                     <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">CRITICAL ALERT</span>
                                     <p className="text-sm font-sans text-white/70 leading-relaxed">
                                       {typeof lastAnalysisResult.warnings[0] === 'object' ? (lastAnalysisResult.warnings[0] as any).text : lastAnalysisResult.warnings[0]}
                                     </p>
                                  </div>
                               </div>
                             )}

                             <div className="p-10 bg-brand-primary/5 border border-brand-primary/20 rounded-[50px] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 text-brand-primary/20"><Info size={24} /></div>
                                <p className="text-white/80 text-base font-sans italic leading-relaxed">"{lastAnalysisResult.personalizedAdvice}"</p>
                             </div>

                             <div className="flex gap-5 pt-8 shrink-0">
                                <button onClick={handleShare} className="flex-1 py-7 bg-white/10 hover:bg-brand-primary hover:text-brand-dark transition-all rounded-[32px] flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-white">
                                   <Share2 size={20} /> SHARE
                                </button>
                                <button onClick={handleDownloadReport} className="w-28 py-7 bg-white/10 hover:bg-white hover:text-brand-dark transition-all rounded-[32px] flex items-center justify-center text-white">
                                   <Download size={22} />
                                </button>
                             </div>
                          </div>
                        ) : null}
                     </div>

                     <div className="mt-8 pt-10 border-t border-white/5 flex justify-between items-center shrink-0 opacity-30">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em]">GEMINI_AI_VERIFIED</span>
                        <div className="flex gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/50 animate-pulse delay-75" />
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/20 animate-pulse delay-150" />
                        </div>
                     </div>
                  </div>

                  {/* تفاصيل الهاردوير الجانبية - الحواف المضيئة والمحاذاة */}
                  <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-brand-primary/10" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-32 w-1.5 bg-brand-primary/40 rounded-r-full shadow-glow" />
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-2 bg-white/10 rounded-full" />
               </div>

               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

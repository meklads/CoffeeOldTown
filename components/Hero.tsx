
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Baby, HeartPulse, Zap, Camera, Utensils, Share2, AlertTriangle, Info, Download, FileText, RefreshCw } from 'lucide-react';
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
  const progressIntervalRef = useRef<number | null>(null);

  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, slogan: string, color: string, glow: string, border: string }> = {
    GENERAL: { 
      label: isAr ? 'عام' : 'GENERAL', 
      icon: <Utensils size={14} />, 
      slogan: isAr ? 'يومي' : 'Daily',
      color: 'bg-[#C2A36B]',
      glow: 'shadow-[0_0_20px_rgba(194,163,107,0.4)]',
      border: 'border-[#C2A36B]'
    },
    PREGNANCY: { 
      label: isAr ? 'حمل' : 'PREGNANCY', 
      icon: <Baby size={14} />, 
      slogan: isAr ? 'نمو' : 'Growth',
      color: 'bg-[#E5C1CD]',
      glow: 'shadow-[0_0_20px_rgba(229,193,205,0.4)]',
      border: 'border-[#E5C1CD]'
    },
    DIABETIC: { 
      label: isAr ? 'سكري' : 'DIABETIC', 
      icon: <HeartPulse size={14} />, 
      slogan: isAr ? 'توازن' : 'Sync',
      color: 'bg-[#64B5F6]',
      glow: 'shadow-[0_0_20px_rgba(100,181,246,0.4)]',
      border: 'border-[#64B5F6]'
    },
    ATHLETE: { 
      label: isAr ? 'رياضي' : 'ATHLETE', 
      icon: <Zap size={14} />, 
      slogan: isAr ? 'أداء' : 'Power',
      color: 'bg-[#FF7043]',
      glow: 'shadow-[0_0_20px_rgba(255,112,67,0.4)]',
      border: 'border-[#FF7043]'
    }
  };

  const activeConfig = personaConfigs[currentPersona];

  useEffect(() => {
    if (status === 'success') {
      setStatus('idle');
      setLastAnalysisResult(null);
    }
  }, [currentPersona]);

  const handlePersonaSelect = (id: BioPersona) => {
    if (currentPersona === id) return;
    setCurrentPersona(id);
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setProgress(0);
    
    const steps = isAr 
      ? ['تنشيط...', 'مسح جزيئي...', 'تحليل حيوي...', 'تقرير...'] 
      : ['Activating...', 'Molecular Scan...', 'Bio-Analysis...', 'Report...'];
    
    let currentStepIdx = 0;
    setLoadingStep(steps[0]);

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 5) + 2;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setImage(reader.result as string);
        setStatus('idle'); 
        setProgress(0);
        setLastAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative h-screen bg-brand-dark flex items-center justify-center overflow-hidden pt-16 lg:pt-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full h-full flex flex-col lg:flex-row lg:items-center lg:gap-20">
        
        {/* المحتوى النصي (العنوان) - يتصدر المشهد في الجوال */}
        <div className="lg:w-[45%] flex flex-col justify-start lg:justify-center py-4 lg:py-6 animate-fade-in z-20 space-y-4 lg:space-y-12">
          
          <div className="space-y-2 lg:space-y-6">
            <div className="hidden lg:inline-flex items-center gap-3 px-3 py-1 bg-white/5 rounded-full border border-white/10 transition-colors duration-1000">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-1000 ${activeConfig.color}`} />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/50">Module v5.5 Multi-Proto</span>
            </div>
            
            <div className="space-y-1 lg:space-y-4 text-center lg:text-left">
              <h1 className="text-3xl md:text-5xl lg:text-8xl font-serif font-bold text-white leading-tight lg:leading-[0.85] tracking-tighter">
                Precision <span className={`italic font-normal transition-colors duration-1000 ${currentPersona === 'GENERAL' ? 'text-brand-primary' : activeConfig.color.replace('bg-', 'text-')}`}>Biometrics.</span>
              </h1>
              <p className="hidden lg:block text-white/30 text-base italic max-w-sm leading-relaxed">
                {isAr ? 'اختر البروتوكول لتعديل مخرجات التحليل الجزيئي.' : 'Select protocol to calibrate molecular diagnostic output.'}
              </p>
            </div>
          </div>

          {/* أزرار البروتوكول في نسخة الديسك توب تظهر هنا */}
          <div className="hidden lg:grid grid-cols-2 gap-4 max-w-md">
            {(Object.keys(personaConfigs) as BioPersona[]).map((id) => {
              const p = personaConfigs[id];
              const isActive = currentPersona === id;
              return (
                <button
                  key={id}
                  onClick={() => handlePersonaSelect(id)}
                  className={`group p-6 rounded-[35px] border transition-all duration-500 text-left relative overflow-hidden flex flex-col justify-between h-[140px]
                    ${isActive ? `${p.color} ${p.border} text-brand-dark ${p.glow} scale-[1.02]` : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
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
        
        {/* السكانر الاحترافي - العنصر المركزي */}
        <div className="flex-1 lg:flex-none lg:w-[55%] w-full flex flex-col items-center lg:items-end justify-center relative z-10 px-2 lg:px-0">
           <div className={`w-full max-w-[420px] lg:max-w-[480px] aspect-[4/5] bg-[#0A0908] rounded-[40px] lg:rounded-[60px] border transition-all duration-1000 ${activeConfig.border.replace('border-', 'border-')} shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden group`}>
              
              <div className="flex-1 m-2 lg:m-4 rounded-[30px] lg:rounded-[45px] bg-[#050505] overflow-hidden flex flex-col border border-white/5">
                 
                 <div className="p-4 lg:p-6 flex justify-between items-center bg-white/[0.02] border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-2">
                       <div className={`w-1 h-1 rounded-full animate-pulse transition-colors duration-1000 ${activeConfig.color}`} />
                       <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em]">
                         {status === 'loading' ? (isAr ? 'جاري الفحص...' : 'SCANNING') : 'Interface_v5'}
                       </span>
                    </div>
                    {image && (
                      <button onClick={() => { setImage(null); setStatus('idle'); setLastAnalysisResult(null); }} className="text-white/10 hover:text-brand-primary transition-all">
                         <RotateCcw size={12} />
                      </button>
                    )}
                 </div>

                 <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4 lg:p-8 flex flex-col justify-center">
                    {status === 'idle' && !image ? (
                      <div onClick={() => fileInputRef.current?.click()} className="h-full flex flex-col items-center justify-center text-center space-y-6 lg:space-y-8 cursor-pointer group/up py-4">
                         <div className={`w-14 h-14 lg:w-20 lg:h-20 bg-white/5 border border-dashed border-white/10 rounded-full flex items-center justify-center transition-all duration-700 group-hover/up:${activeConfig.color.replace('bg-', 'border-')} group-hover/up:${activeConfig.color.replace('bg-', 'text-')}`}>
                            <Camera size={24} className="lg:hidden" strokeWidth={1} />
                            <Camera size={32} className="hidden lg:block" strokeWidth={1} />
                         </div>
                         <div className="space-y-2">
                            <h4 className="text-lg lg:text-2xl font-serif font-bold italic text-white/60 tracking-tight">{isAr ? 'تلقيم العينة' : 'Insert Specimen'}</h4>
                            <p className={`text-[8px] lg:text-[9px] font-black uppercase tracking-[0.6em] transition-colors duration-1000 ${activeConfig.color.replace('bg-', 'text-')}`}>{isAr ? 'اضغط للبدء' : 'SCAN SAMPLE'}</p>
                         </div>
                      </div>
                    ) : status === 'idle' && image ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 lg:space-y-8 animate-fade-in">
                         <div className="relative aspect-square w-full max-w-[180px] lg:max-w-[240px] rounded-[30px] lg:rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
                            <img src={image} className="w-full h-full object-cover grayscale-[0.2]" alt="Sample" />
                            <div className={`absolute top-0 left-0 w-full h-[2px] shadow-glow animate-scan transition-colors duration-1000 ${activeConfig.color}`} />
                            <div className={`absolute bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 bg-brand-dark/90 backdrop-blur-md px-3 py-1 lg:py-1.5 rounded-full border border-white/10 flex items-center gap-2 whitespace-nowrap`}>
                               <span className="text-[7px] lg:text-[8px] font-black text-white uppercase tracking-widest">{currentPersona}</span>
                            </div>
                         </div>
                         <button onClick={handleAnalyze} className={`w-full py-4 lg:py-5 text-brand-dark rounded-full font-black text-[9px] lg:text-[10px] uppercase tracking-[0.5em] shadow-glow transition-all flex items-center justify-center gap-3 duration-1000 ${activeConfig.color}`}>
                            <Zap size={14} /> {isAr ? 'بدء الفحص' : 'INITIATE'}
                         </button>
                      </div>
                    ) : status === 'loading' ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-6 lg:space-y-10 animate-fade-in py-6">
                         <div className="relative w-24 h-24 lg:w-40 lg:h-40">
                            <svg className="w-full h-full -rotate-90">
                               <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" />
                               <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" lg:strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * progress / 100)} className={`transition-all duration-500 ${activeConfig.color.replace('bg-', 'text-')}`} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-sans font-bold text-2xl lg:text-4xl text-white">{progress}%</div>
                         </div>
                         <h3 className={`font-black uppercase tracking-[0.5em] animate-pulse text-[8px] lg:text-[9px] transition-colors duration-1000 ${activeConfig.color.replace('bg-', 'text-')}`}>{loadingStep}</h3>
                      </div>
                    ) : status === 'success' && lastAnalysisResult ? (
                      <div className="w-full space-y-4 lg:space-y-8 animate-fade-in py-2">
                         <div className="space-y-1 lg:space-y-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[7px] lg:text-[8px] font-black uppercase tracking-widest transition-colors duration-1000 ${activeConfig.color.replace('bg-', 'text-')}`}>{isAr ? 'التقرير الأيضي' : 'BIO-REPORT'}</span>
                            </div>
                            <h2 className="text-sm lg:text-xl font-sans font-bold text-white tracking-tight leading-snug">{lastAnalysisResult.summary}</h2>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-2 lg:gap-4">
                            <div className="bg-white/5 p-3 lg:p-5 rounded-[20px] lg:rounded-[30px] border border-white/5">
                               <span className="text-[6px] lg:text-[7px] font-black uppercase text-white/30 block mb-1 lg:mb-2 tracking-widest">KCAL</span>
                               <div className="text-xl lg:text-3xl font-sans font-bold text-white tracking-tighter">{lastAnalysisResult.totalCalories}</div>
                            </div>
                            <div className="bg-white/5 p-3 lg:p-5 rounded-[20px] lg:rounded-[30px] border border-white/5">
                               <span className="text-[6px] lg:text-[7px] font-black uppercase text-white/30 block mb-1 lg:mb-2 tracking-widest">SCORE</span>
                               <div className="text-xl lg:text-3xl font-sans font-bold text-white tracking-tighter">{lastAnalysisResult.healthScore}%</div>
                            </div>
                         </div>

                         <div className={`p-4 lg:p-6 bg-white/5 border border-white/10 rounded-[25px] lg:rounded-[35px] relative overflow-hidden`}>
                            <p className="text-white/70 text-[10px] lg:text-xs font-sans italic leading-relaxed">"{lastAnalysisResult.personalizedAdvice}"</p>
                         </div>

                         <div className="flex gap-2 pt-2">
                            <button className={`flex-1 py-4 bg-white/5 hover:${activeConfig.color} hover:text-brand-dark transition-all rounded-[15px] lg:rounded-[25px] flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-white border border-white/5`}>
                               <Share2 size={12} /> {isAr ? 'مشاركة' : 'SHARE'}
                            </button>
                         </div>
                      </div>
                    ) : null}
                 </div>

                 <div className="p-3 lg:p-4 border-t border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
                    <span className="text-[6px] lg:text-[7px] font-black text-white/20 uppercase tracking-[0.5em]">SYSTEM_STABLE</span>
                    <div className="flex gap-1">
                       <div className={`w-1 h-1 rounded-full transition-colors duration-1000 ${activeConfig.color}`} />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* أزرار البروتوكول في نسخة الجوال تظهر في الأسفل بنمط مدمج جداً */}
        <div className="lg:hidden w-full pb-6 pt-2 z-20">
           <div className="grid grid-cols-4 gap-2">
              {(Object.keys(personaConfigs) as BioPersona[]).map((id) => {
                const p = personaConfigs[id];
                const isActive = currentPersona === id;
                return (
                  <button
                    key={id}
                    onClick={() => handlePersonaSelect(id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-[20px] border transition-all duration-500
                      ${isActive ? `${p.color} ${p.border} text-brand-dark scale-105 shadow-glow` : 'bg-white/5 border-white/5 text-white/30'}`}
                  >
                    <div className="mb-1">{p.icon}</div>
                    <span className="text-[7px] font-black uppercase tracking-tighter leading-none">{p.label}</span>
                  </button>
                );
              })}
           </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </section>
  );
};

export default Hero;

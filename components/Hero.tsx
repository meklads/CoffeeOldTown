
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Microscope, Fingerprint, CheckCircle2, RotateCcw, Flame, Activity, AlertTriangle, RefreshCcw, Baby, HeartPulse, Zap, Settings2, ShieldCheck, Binary, Share2, BookOpen, ExternalLink, Droplets, Info, Sparkles, ChevronRight } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, scrollTo, lastAnalysisResult, currentPersona, setCurrentPersona, language } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 1024) {
        setMousePos({
          x: (e.clientX / window.innerWidth - 0.5) * 8,
          y: (e.clientY / window.innerHeight - 0.5) * 8
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePersonaSelect = (id: BioPersona) => {
    if (id === currentPersona) return;
    
    setIsCalibrating(true);
    setCurrentPersona(id);
    
    // Auto-scroll logic for mobile/tablet users
    if (window.innerWidth < 1024 && scannerRef.current) {
      setTimeout(() => {
        scannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    
    setTimeout(() => setIsCalibrating(false), 800);
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setProgress(0);
    setErrorMessage('');
    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => (prev >= 96 ? 96 : prev + Math.floor(Math.random() * 6) + 2));
    }, 150);

    try {
      const result = await analyzeMealImage(image, {
        chronicDiseases: "none",
        dietProgram: "general",
        activityLevel: "moderate",
        persona: currentPersona
      });
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      if (result && result.totalCalories) {
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: image });
        incrementScans(result);
        setStatus('success');
      } else { throw new Error("Extraction fault."); }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
      setErrorMessage(err.message || "Diagnostic node connection failure.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result as string); setStatus('idle'); setProgress(0); };
      reader.readAsDataURL(file);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    setLastAnalysisResult(null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Bio-Analysis Report | Old Town Lab',
        text: `Check out my metabolic analysis: ${lastAnalysisResult?.summary} with ${lastAnalysisResult?.totalCalories} kcal.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert(isAr ? 'تم نسخ الرابط للمشاركة' : 'Link copied to clipboard');
    }
  };

  const getWarningIcon = (type: string) => {
    switch (type) {
      case 'sugar': return <Droplets size={14} className="text-orange-400" />;
      case 'pregnancy': return <Baby size={14} className="text-rose-400" />;
      case 'allergy': return <AlertTriangle size={14} className="text-red-400" />;
      case 'sodium': return <Activity size={14} className="text-amber-400" />;
      default: return <Info size={14} className="text-blue-400" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  const personaConfigs = [
    { id: 'GENERAL' as BioPersona, icon: <Fingerprint size={18} />, label: isAr ? 'عام' : 'GENERAL' },
    { id: 'PREGNANCY' as BioPersona, icon: <Baby size={18} />, label: isAr ? 'حمل' : 'PREGNANCY' },
    { id: 'DIABETIC' as BioPersona, icon: <HeartPulse size={18} />, label: isAr ? 'سكري' : 'DIABETIC' },
    { id: 'ATHLETE' as BioPersona, icon: <Zap size={18} />, label: isAr ? 'رياضي' : 'ATHLETE' },
  ];

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light dark:bg-brand-dark flex items-center overflow-hidden pt-32 pb-20 transition-colors duration-1000">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02] z-0" 
           style={{ backgroundImage: 'radial-gradient(#C2A36B 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl w-full mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          
          <div className="lg:col-span-5 space-y-12 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white dark:bg-white/5 border border-brand-dark/[0.05] dark:border-white/5 rounded-full shadow-sm mx-auto lg:mx-0">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCalibrating ? 'bg-brand-primary' : 'bg-emerald-500'}`} />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-brand-dark/40 dark:text-white/40 italic uppercase">
                  {isCalibrating ? 'CALIBRATING_NODE...' : 'SYSTEM_STABLE'}
                </span>
              </div>
              <h1 className="text-5xl md:text-8xl lg:text-[100px] font-serif font-bold text-brand-dark dark:text-white leading-[0.85] tracking-tighter">
                Diagnostic <br /><span className="text-brand-primary italic font-normal">Command.</span>
              </h1>
              <p className="text-brand-dark/40 dark:text-white/30 text-[10px] md:text-[11px] font-bold tracking-[0.3em] max-w-sm mx-auto lg:mx-0 uppercase leading-relaxed">
                Precision bio-scanning engineered for maternal, athletic, and metabolic oversight.
              </p>
            </div>

            <div className="space-y-6 relative">
               <div className="flex items-center gap-4 mb-2">
                  <Settings2 size={14} className="text-brand-primary animate-spin-slow" />
                  <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em]">Protocol Selection</span>
               </div>
               <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0">
                  {personaConfigs.map((config) => (
                    <button
                      key={config.id}
                      onClick={() => handlePersonaSelect(config.id)}
                      className={`group relative p-5 rounded-[28px] border transition-all duration-500 flex items-center gap-4 overflow-hidden
                        ${currentPersona === config.id 
                          ? 'bg-brand-primary border-brand-primary text-brand-dark shadow-glow' 
                          : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark/40 dark:text-white/30 hover:border-brand-primary/40'}`}
                    >
                      <div className={`shrink-0 transition-transform duration-500 ${currentPersona === config.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {config.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                      {currentPersona === config.id && (
                        <div className="absolute right-4 w-1 h-1 rounded-full bg-brand-dark animate-pulse" />
                      )}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-6 opacity-30">
               <div className="flex items-center gap-3">
                  <Binary size={14} className="text-brand-primary" />
                  <span className="text-[7px] font-black uppercase tracking-widest">GEMINI_3_FLASH_ACTIVE</span>
               </div>
               <div className="flex items-center gap-3">
                  <ShieldCheck size={14} className="text-brand-primary" />
                  <span className="text-[7px] font-black uppercase tracking-widest">METABOLIC_ENCRYPTION_v2</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center items-center">
            <div 
               ref={scannerRef}
               className="relative w-full max-w-[460px] transition-transform duration-1000"
               style={{ transform: window.innerWidth > 1024 ? `translate(${mousePos.x}px, ${mousePos.y}px)` : 'none' }}
             >
               <div className="absolute -inset-10 border border-brand-primary/5 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none" />
               <div className="absolute -inset-20 border border-brand-primary/5 rounded-full animate-[spin_30s_linear_infinite] pointer-events-none" style={{ animationDirection: 'reverse' }} />

               <div className="relative aspect-[3/4] rounded-[70px] border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-4xl z-20 group">
                  
                  {isCalibrating && (
                    <div className="absolute inset-0 z-[60] bg-brand-primary/10 backdrop-blur-[2px] flex items-center justify-center animate-fade-in">
                       <div className="w-32 h-32 rounded-full border-4 border-brand-primary animate-ping opacity-20" />
                    </div>
                  )}

                  {image ? (
                    <div className="absolute inset-0">
                      <img src={image} className="w-full h-full object-cover" alt="Specimen" />
                      
                      {status === 'loading' && (
                        <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in text-white">
                           <div className="relative w-28 h-28 mb-8">
                              <svg className="w-full h-full -rotate-90">
                                <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                                <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                  strokeDasharray={427} strokeDashoffset={427 - (427 * progress) / 100}
                                  className="text-brand-primary transition-all duration-300" 
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-3xl font-serif font-bold">{progress}%</div>
                           </div>
                           <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.6em] animate-pulse">EXTRACTING_DATA_FOR_{currentPersona}</span>
                        </div>
                      )}

                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl flex flex-col p-8 z-50 animate-fade-in text-white overflow-y-auto custom-scrollbar">
                           <div className="flex justify-between items-start mb-6 shrink-0">
                              <div className="bg-brand-primary/20 p-2 rounded-2xl border border-brand-primary/30 text-brand-primary flex items-center gap-2">
                                <CheckCircle2 size={14} />
                                <span className="text-[7px] font-black uppercase tracking-widest">{currentPersona}_OK</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={handleShare} className="p-2 text-white/20 hover:text-white transition-colors"><Share2 size={16} /></button>
                                <button onClick={resetScanner} className="p-2 text-white/20 hover:text-white transition-colors"><RotateCcw size={16} /></button>
                              </div>
                           </div>

                           <div className="space-y-6 flex-grow pb-10">
                              <div className="space-y-1">
                                 <span className="text-[6px] font-black text-brand-primary uppercase tracking-[0.4em]">Specimen_ID_#2045</span>
                                 <h3 className="text-2xl font-serif font-bold leading-tight">{lastAnalysisResult.summary}</h3>
                              </div>

                              {lastAnalysisResult.warnings && lastAnalysisResult.warnings.length > 0 && (
                                <div className="space-y-3">
                                   <div className="flex items-center gap-2 text-white/40">
                                      <AlertTriangle size={12} />
                                      <span className="text-[7px] font-black uppercase tracking-widest">BIOMETRIC_ALERTS</span>
                                   </div>
                                   {lastAnalysisResult.warnings.map((w: any, i: number) => (
                                     <div key={i} className={`p-4 rounded-3xl border flex items-center gap-4 transition-all hover:scale-[1.02] ${getRiskColor(w.riskLevel)}`}>
                                        <div className="shrink-0">{getWarningIcon(w.type)}</div>
                                        <div className="flex-grow">
                                           <p className="text-[10px] font-bold italic leading-tight">{w.text}</p>
                                        </div>
                                        <div className="shrink-0 text-[6px] font-black uppercase tracking-widest opacity-60">
                                          {w.riskLevel}_risk
                                        </div>
                                     </div>
                                   ))}
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-2 opacity-30 mb-1"><Flame size={10} /><span className="text-[6px] font-black uppercase tracking-widest">Energy</span></div>
                                    <p className="text-xl font-serif font-bold">{lastAnalysisResult.totalCalories}<span className="text-[8px] ml-1 opacity-40">kcal</span></p>
                                 </div>
                                 <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-2 opacity-30 mb-1"><Activity size={10} /><span className="text-[6px] font-black uppercase tracking-widest">Vitality</span></div>
                                    <p className="text-xl font-serif font-bold text-brand-primary">{lastAnalysisResult.healthScore}%</p>
                                 </div>
                              </div>

                              <div className="bg-brand-primary/10 border-l-4 border-brand-primary p-5 rounded-r-3xl space-y-3">
                                 <div className="flex items-center gap-2 text-brand-primary opacity-60 mb-2">
                                    <Sparkles size={12} />
                                    <span className="text-[7px] font-black uppercase tracking-widest">PROTOCOL_ADVICE</span>
                                 </div>
                                 <ul className="space-y-2">
                                    {(Array.isArray(lastAnalysisResult.personalizedAdvice) ? lastAnalysisResult.personalizedAdvice : [lastAnalysisResult.personalizedAdvice]).map((adv: string, i: number) => (
                                      <li key={i} className="text-[11px] text-white/90 italic leading-relaxed flex items-start gap-2">
                                        <span className="text-brand-primary mt-1">•</span>
                                        {adv}
                                      </li>
                                    ))}
                                 </ul>
                              </div>

                              {lastAnalysisResult.scientificSource && (
                                <div className="flex items-center gap-3 pt-4 opacity-20 hover:opacity-100 transition-opacity">
                                   <BookOpen size={10} className="text-brand-primary" />
                                   <span className="text-[7px] font-black uppercase tracking-widest">{lastAnalysisResult.scientificSource}</span>
                                </div>
                              )}
                           </div>

                           <button onClick={() => scrollTo(SectionId.PHASE_03_SYNTHESIS)} className="w-full mt-4 py-5 bg-brand-primary text-brand-dark rounded-3xl text-[9px] font-black uppercase tracking-[0.4em] shadow-glow shrink-0 transition-transform active:scale-95 flex items-center justify-center gap-3">
                              Full Protocol Blueprint <ChevronRight size={14} />
                           </button>
                        </div>
                      )}

                      {status !== 'loading' && !lastAnalysisResult && (
                        <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-[6px] flex flex-col items-center justify-center p-10 text-center animate-fade-in text-white z-40">
                           <RefreshCcw size={48} className="text-brand-primary mb-6 animate-spin-slow opacity-60" />
                           <h4 className="text-3xl font-serif font-bold italic mb-4">
                              {isAr ? 'إعادة معايرة حيوية' : 'Bio-Recalibration'}
                           </h4>
                           <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] mb-10 leading-relaxed max-w-xs">
                              {isAr 
                                ? `بروتوكول [${currentPersona}] نشط حالياً. يرجى تفعيل المسح لمطابقة البيانات الحيوية الجديدة.` 
                                : `[${currentPersona}] Protocol active. Trigger re-scan to synchronize diagnostic data.`}
                           </p>
                           <button 
                             onClick={handleAnalyze} 
                             className="bg-brand-primary text-brand-dark px-12 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.5em] shadow-glow hover:scale-105 active:scale-95 transition-all"
                           >
                              {isAr ? 'تحديث التحليل' : 'SYNC DIAGNOSTICS'}
                           </button>
                           <button onClick={resetScanner} className="mt-6 text-white/20 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">
                              {isAr ? 'تجاهل العينة' : 'DISCARD SPECIMEN'}
                           </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-10 group/scanner">
                      <div className="relative mb-10">
                         <div className="absolute -inset-16 border border-brand-primary/5 rounded-full animate-pulse-slow group-hover/scanner:border-brand-primary/20 transition-colors" />
                         <div className="w-24 h-24 rounded-[40px] bg-brand-light dark:bg-brand-dark flex items-center justify-center border border-brand-dark/[0.04] dark:border-white/5 shadow-2xl group-hover/scanner:scale-110 transition-transform duration-700">
                          <Plus size={48} className="text-brand-primary" strokeWidth={1.5} />
                         </div>
                      </div>
                      <div className="text-center space-y-4">
                        <h4 className="text-3xl font-serif font-bold text-brand-dark/40 dark:text-white/20 tracking-tight italic group-hover/scanner:text-brand-primary/40 transition-colors">Load Specimen</h4>
                        <span className="text-[8px] font-black text-brand-dark/20 dark:text-white/10 uppercase tracking-[0.8em]">READY_FOR_{currentPersona}_INPUT</span>
                      </div>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>

               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 whitespace-nowrap opacity-40">
                  <div className="flex items-center gap-3">
                    <Microscope size={12} className="text-brand-primary" />
                    <span className="text-[8px] font-black text-brand-dark dark:text-white uppercase tracking-[0.4em]">Optical_Scan_Active</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-brand-primary" />
                  <div className="flex items-center gap-3">
                    <Binary size={12} className="text-brand-primary" />
                    <span className="text-[8px] font-black text-brand-dark dark:text-white uppercase tracking-[0.4em]">AI_Sync_Stable</span>
                  </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

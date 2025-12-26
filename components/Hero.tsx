
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Microscope, Fingerprint, CheckCircle2, RotateCcw, Flame, Activity, AlertTriangle, RefreshCcw, Baby, HeartPulse, Zap, Settings2, ShieldCheck, Binary, Share2, BookOpen, ExternalLink, Droplets, Info, Sparkles, ChevronRight, Loader2, UploadCloud, XCircle } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, scrollTo, lastAnalysisResult, currentPersona, setCurrentPersona, language } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const handlePersonaSelect = (id: BioPersona) => {
    setCurrentPersona(id);
    setStatus('idle');
    setErrorMessage('');
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
      });
      
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
      
      if (err.message === "QUOTA_EXCEEDED") {
        setErrorMessage(isAr ? "عذراً، وصل النظام إلى حده الأقصى حالياً. يرجى المحاولة لاحقاً." : "System limit reached. Please try again later.");
      } else {
        setErrorMessage(isAr ? "حدث خطأ غير متوقع في التشخيص." : "Unexpected diagnostic fault.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setStatus('error');
        setErrorMessage(isAr ? "يرجى اختيار صورة." : "Select an image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { 
        setImage(reader.result as string); 
        setStatus('idle'); 
        setProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
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
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (score >= 50) return 'bg-brand-primary shadow-[0_0_10px_rgba(194,163,107,0.5)]';
    return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
  };

  const getHealthScoreIconColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-brand-primary';
    return 'text-rose-500';
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light dark:bg-brand-dark pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">AI Diagnostic Unit</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-[0.9] tracking-tighter">
                Precision <br /><span className="text-brand-primary italic font-normal">Command.</span>
              </h1>
              <p className="text-brand-dark/50 dark:text-white/30 text-lg italic max-w-md">
                {isAr ? 'مسح بيومتري متطور لتحليل الوجبات بناءً على حالتك الصحية.' : 'Advanced bio-metric scanning for health-aware meal analysis.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              {(['GENERAL', 'PREGNANCY', 'DIABETIC', 'ATHLETE'] as BioPersona[]).map((id) => (
                <button
                  key={id}
                  onClick={() => handlePersonaSelect(id)}
                  className={`p-6 rounded-3xl border transition-all text-left group
                    ${currentPersona === id 
                      ? 'bg-brand-primary border-brand-primary text-white shadow-xl' 
                      : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40 hover:border-brand-primary/30'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-60">Protocol</span>
                  <span className="text-sm font-bold">{id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-[440px] aspect-[3/4] rounded-[60px] bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-4xl overflow-hidden group">
              
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-10"
                >
                  <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-8 animate-pulse">
                    <Plus size={48} />
                  </div>
                  <h4 className="text-2xl font-serif font-bold italic text-brand-dark/40 dark:text-white/20">
                    {isAr ? 'تحميل العينة' : 'Load Specimen'}
                  </h4>
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
                           <div className="absolute inset-0 flex items-center justify-center font-bold">{progress}%</div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">{loadingStep}</p>
                      </div>
                    </div>
                  )}

                  {status === 'success' && lastAnalysisResult && (
                    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl z-50 p-8 text-white overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-center mb-8">
                        <div className="bg-brand-primary/20 px-4 py-1.5 rounded-full border border-brand-primary/30 text-brand-primary text-[8px] font-black tracking-widest">
                          BIO_READY
                        </div>
                        <button onClick={resetScanner} className="p-2 text-white/40 hover:text-white"><RotateCcw size={20} /></button>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-2xl font-serif font-bold italic leading-tight">{lastAnalysisResult.summary}</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 opacity-30 mb-1">
                              <Flame size={12} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Energy</span>
                            </div>
                            <p className="text-xl font-serif font-bold">{lastAnalysisResult.totalCalories} <span className="text-[10px] opacity-40">kcal</span></p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 opacity-30">
                                <Activity size={12} className={getHealthScoreIconColor(lastAnalysisResult.healthScore)} />
                                <span className="text-[8px] font-black uppercase tracking-widest">Vitality</span>
                              </div>
                              <span className={`text-sm font-serif font-bold ${getHealthScoreIconColor(lastAnalysisResult.healthScore)}`}>{lastAnalysisResult.healthScore}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ease-out ${getHealthScoreColor(lastAnalysisResult.healthScore)}`}
                                style={{ width: `${lastAnalysisResult.healthScore}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {lastAnalysisResult.warnings?.length > 0 && (
                          <div className="space-y-2">
                             {lastAnalysisResult.warnings.map((w: any, idx: number) => (
                               <div key={idx} className={`p-4 rounded-2xl border flex items-center gap-4 text-xs font-bold italic ${getRiskColor(w.riskLevel)}`}>
                                 {getWarningIcon(w.type)}
                                 <span>{w.text}</span>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => scrollTo(SectionId.PHASE_03_SYNTHESIS)} 
                        className="w-full mt-8 py-5 bg-brand-primary text-brand-dark rounded-3xl text-[9px] font-black uppercase tracking-[0.4em] shadow-glow active:scale-95 transition-transform"
                      >
                        Generate Full Protocol
                      </button>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center text-white z-50">
                      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <XCircle size={40} className="text-red-500" />
                      </div>
                      <h4 className="text-2xl font-serif font-bold italic mb-4">{isAr ? 'فشل التحليل' : 'Analysis Failed'}</h4>
                      <p className="text-sm text-white/50 mb-10 leading-relaxed">{errorMessage}</p>
                      <button onClick={handleAnalyze} className="w-full bg-white text-brand-dark py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-primary transition-colors">
                        <RefreshCcw size={14} /> {isAr ? 'إعادة المحاولة' : 'Retry'}
                      </button>
                    </div>
                  )}

                  {status === 'idle' && (
                    <div className="absolute bottom-10 left-10 right-10 z-40">
                      <button 
                        onClick={handleAnalyze} 
                        className="w-full py-6 bg-brand-primary text-brand-dark rounded-3xl font-black text-[10px] uppercase tracking-[0.5em] shadow-glow transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 hover:brightness-110 hover:shadow-[0_20px_40px_rgba(194,163,107,0.3)] active:scale-95 active:bg-gradient-to-r active:from-[#C2A36B] active:to-[#10B981] active:text-white"
                      >
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

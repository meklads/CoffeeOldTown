
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Microscope, Fingerprint, CheckCircle2, RotateCcw, Database, Sparkles, Flame, Activity, AlertTriangle, RefreshCcw } from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, scrollTo, lastAnalysisResult, currentPersona, language } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [archiveIdx, setArchiveIdx] = useState(0);
  const [isArchiveVisible, setIsArchiveVisible] = useState(true);
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const archiveSamples = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80"
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 1024) {
        setMousePos({
          x: (e.clientX / window.innerWidth - 0.5) * 15,
          y: (e.clientY / window.innerHeight - 0.5) * 15
        });
      }
    };
    
    const archiveTimer = setInterval(() => {
      setIsArchiveVisible(false);
      setTimeout(() => {
        setArchiveIdx(prev => (prev + 1) % archiveSamples.length);
        setIsArchiveVisible(true);
      }, 500); 
    }, 6000);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(archiveTimer);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

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

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen lg:h-screen bg-brand-light dark:bg-brand-dark flex items-center overflow-hidden pt-24 pb-12 lg:py-0 transition-colors duration-1000">
      <div className="absolute inset-0 pointer-events-none opacity-[0.012] z-0" style={{ backgroundImage: 'radial-gradient(#C2A36B 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl w-full mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <div className="flex justify-center lg:justify-end items-center order-1 lg:order-2">
             <div 
               className="relative w-full max-w-full md:max-w-[430px] transition-transform duration-1000"
               style={{ transform: window.innerWidth > 1024 ? `translate(${mousePos.x}px, ${mousePos.y}px)` : 'none' }}
             >
               <div className="relative aspect-[3/4] rounded-[50px] md:rounded-[70px] border border-brand-dark/[0.08] dark:border-white/5 bg-white dark:bg-zinc-900/40 overflow-hidden shadow-4xl z-20 group">
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
                           <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.6em] animate-pulse">EXTRACTING_DATA_PATH_{currentPersona}</span>
                        </div>
                      )}

                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl flex flex-col p-8 z-50 animate-fade-in text-white overflow-y-auto custom-scrollbar">
                           <div className="flex justify-between items-start mb-6 shrink-0">
                              <div className="bg-brand-primary/20 p-2.5 rounded-2xl border border-brand-primary/30 text-brand-primary flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                <span className="text-[8px] font-black uppercase tracking-widest">{currentPersona} OK</span>
                              </div>
                              <button onClick={resetScanner} className="p-2 text-white/20 hover:text-white transition-colors"><RotateCcw size={18} /></button>
                           </div>

                           <div className="space-y-6">
                              <div className="space-y-1">
                                 <span className="text-[7px] font-black text-brand-primary uppercase tracking-[0.4em]">Specimen_ID_#2045</span>
                                 <h3 className="text-xl font-serif font-bold leading-tight">{lastAnalysisResult.summary}</h3>
                              </div>

                              {lastAnalysisResult.warnings && lastAnalysisResult.warnings.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl space-y-2">
                                   <div className="flex items-center gap-2 text-red-400">
                                      <AlertTriangle size={14} />
                                      <span className="text-[8px] font-black uppercase tracking-widest">Bio-Hazard / Risk</span>
                                   </div>
                                   {lastAnalysisResult.warnings.map((w, i) => (
                                     <p key={i} className="text-[10px] text-white/80 font-medium italic">• {w}</p>
                                   ))}
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 opacity-30 mb-1"><Flame size={10} /><span className="text-[7px] font-black uppercase">Energy</span></div>
                                    <p className="text-xl font-serif font-bold">{lastAnalysisResult.totalCalories}<span className="text-[9px] ml-1 opacity-40">kcal</span></p>
                                 </div>
                                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 opacity-30 mb-1"><Activity size={10} /><span className="text-[7px] font-black uppercase">Score</span></div>
                                    <p className="text-xl font-serif font-bold text-brand-primary">{lastAnalysisResult.healthScore}%</p>
                                 </div>
                              </div>

                              <div className="bg-brand-primary/10 border-l-2 border-brand-primary p-4 rounded-r-2xl">
                                 <p className="text-[11px] text-white/70 italic leading-relaxed">"{lastAnalysisResult.personalizedAdvice}"</p>
                              </div>
                           </div>

                           <button onClick={() => scrollTo(SectionId.PHASE_03_SYNTHESIS)} className="w-full mt-8 py-5 bg-brand-primary text-brand-dark rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] shadow-glow shrink-0">View Personalized Blueprint</button>
                        </div>
                      )}

                      {/* NEW LOGIC: If image exists but NO result, it means persona was changed */}
                      {status !== 'loading' && !lastAnalysisResult && (
                        <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-[4px] flex flex-col items-center justify-center p-8 text-center animate-fade-in text-white z-40">
                           <RefreshCcw size={48} className="text-brand-primary mb-6 animate-spin-slow opacity-40" />
                           <h4 className="text-2xl font-serif font-bold italic mb-4">
                              {isAr ? 'تحديث المعايرة المطلوبة' : 'Recalibration Required'}
                           </h4>
                           <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] mb-8 leading-relaxed">
                              {isAr 
                                ? `تم اكتشاف تغيير في البروتوكول إلى [${currentPersona}]. يرجى إعادة التشغيل لمطابقة المعايير الحيوية الجديدة.` 
                                : `Protocol changed to [${currentPersona}]. Please re-run to match new bio-parameters.`}
                           </p>
                           <button 
                             onClick={handleAnalyze} 
                             className="bg-brand-primary text-brand-dark px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] shadow-glow hover:scale-105 active:scale-95 transition-all"
                           >
                              {isAr ? 'إعادة تحليل العينة' : 'RE-ANALYZE SPECIMEN'}
                           </button>
                           <button onClick={resetScanner} className="mt-4 text-white/20 text-[8px] font-black uppercase tracking-widest hover:text-white transition-colors">
                              {isAr ? 'إلغاء العينة الحالية' : 'DISCARD SAMPLE'}
                           </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-8">
                      <div className="relative mb-8">
                         <div className="absolute -inset-12 border border-brand-primary/5 rounded-full animate-pulse-slow" />
                         <div className="w-20 h-20 rounded-[35px] bg-brand-light dark:bg-brand-dark flex items-center justify-center border border-brand-dark/[0.04] dark:border-white/5 shadow-sm">
                          <Plus size={40} className="text-brand-primary" strokeWidth={1.5} />
                         </div>
                      </div>
                      <div className="text-center space-y-3">
                        <h4 className="text-2xl font-serif font-bold text-brand-dark/40 dark:text-white/20 tracking-tight italic">Insert Sample</h4>
                        <span className="text-[7px] font-black text-brand-dark/20 dark:text-white/10 uppercase tracking-[0.8em]">PATHWAY_{currentPersona}_READY</span>
                      </div>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
               <div className="absolute -bottom-10 right-10 flex items-center gap-3 opacity-10">
                  <Fingerprint size={14} /><p className="text-[7px] font-black uppercase tracking-[0.6em]">X_DIAGNOSTIC_CORE</p>
               </div>
             </div>
          </div>

          <div className="flex flex-col space-y-12 animate-fade-in order-2 lg:order-1 text-center lg:text-left px-4 lg:px-0">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white dark:bg-white/5 border border-brand-dark/[0.05] dark:border-white/5 rounded-full shadow-sm mx-auto lg:mx-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[7px] font-black uppercase tracking-[0.4em] text-brand-dark/40 dark:text-white/40 italic">PATH: {currentPersona}</span>
               </div>
               <div className="space-y-6">
                  <h1 className="text-5xl md:text-8xl lg:text-[105px] font-serif font-bold text-brand-dark dark:text-white leading-[0.8] tracking-tighter">
                    Precision <br /><span className="text-brand-primary italic font-normal">Nutrition.</span>
                  </h1>
                  <p className="text-brand-dark/40 dark:text-white/30 text-[10px] md:text-[11px] font-bold tracking-[0.2em] max-w-sm mx-auto lg:mx-0 uppercase leading-relaxed">
                    SPECIALIZED BIO-ANALYSIS FOR MATERNAL, DIABETIC, AND ATHLETIC PERFORMANCE TRACKING.
                  </p>
               </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-lg aspect-video overflow-hidden rounded-[50px] bg-white dark:bg-zinc-900 border border-brand-dark/[0.06] dark:border-white/5 shadow-3xl group/archive">
               <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isArchiveVisible ? 'opacity-100' : 'opacity-0'}`}>
                  <img 
                    src={archiveSamples[archiveIdx]} 
                    className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-[12s] group-hover/archive:scale-110" 
                    alt="Specimen Record" 
                  />
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
               <div className="absolute bottom-8 left-8 flex items-center gap-4">
                  <div className="p-3 bg-brand-dark/95 rounded-2xl text-brand-primary shadow-2xl border border-white/5"><Database size={16} /></div>
                  <div className="flex flex-col text-left">
                     <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.5em]">ACTIVE_PERSONA</span>
                     <span className="text-sm font-serif font-bold text-white italic tracking-tight">{currentPersona} MODE</span>
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

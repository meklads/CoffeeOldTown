
import React, { useState, useRef, useEffect } from 'react';
import { Zap, Image as ImageIcon, RefreshCw, AlertCircle, Activity, Fingerprint, Plus } from 'lucide-react';
import { SectionId } from '../types.ts';
import { analyzeMealImage } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../translations.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, language } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language].hero;

  useEffect(() => {
    let interval: any;
    if (status === 'loading') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => (p >= 98 ? p : p + (p < 85 ? 12 : 1)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 512; 
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    setErrorMessage('');
    setLastAnalysisResult(null);
    try {
      const compressedImage = await compressImage(image);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 25000));
      const resultPromise = analyzeMealImage(compressedImage, { chronicDiseases: '', dietProgram: '', activityLevel: 'moderate' });
      const result: any = await Promise.race([resultPromise, timeoutPromise]);
      if (result) {
        const enriched = { ...result, timestamp: new Date().toLocaleString(), imageUrl: compressedImage };
        setProgress(100);
        setTimeout(() => {
          setLastAnalysisResult(enriched);
          incrementScans(enriched);
          setStatus('idle');
        }, 800);
      } else { throw new Error("EMPTY"); }
    } catch (err: any) {
      setErrorMessage(language === 'ar' ? 'فشل الاتصال: يرجى المحاولة لاحقاً.' : 'Sync Failed: Please retry.');
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
        setLastAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light dark:bg-brand-dark pt-24 pb-16 flex items-center transition-colors duration-500 overflow-hidden">
      
      {/* Bio-Digital Background Grid */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #C2A36B 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Desktop Left Content */}
          <div className="hidden lg:block lg:col-span-5 space-y-8 animate-fade-in">
             <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-primary/10 text-brand-primary rounded-full border border-brand-primary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.5em]">{t.badge}</span>
             </div>
             <div className="space-y-6">
                <h1 className="text-6xl xl:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-[0.9] tracking-tighter">
                   {t.title} <br />
                   <span className="text-brand-primary italic font-normal">{t.subtitle}</span>
                </h1>
                <p className="text-brand-dark/40 dark:text-white/30 text-xl font-medium italic max-w-md leading-relaxed border-l-2 border-brand-primary/20 pl-8">
                   {t.desc}
                </p>
             </div>
             {image && (
                <button 
                  onClick={handleAnalyze}
                  className="px-14 py-6 bg-brand-dark text-white rounded-full font-black text-[11px] uppercase tracking-[0.6em] hover:bg-brand-primary transition-all flex items-center gap-4"
                >
                  INITIALIZE SCAN <Zap size={18} />
                </button>
             )}
          </div>

          {/* Scanner Area - Unified & No Shadows */}
          <div className="w-full lg:col-span-7">
            <div className="relative aspect-[4/5.5] md:aspect-[1.2/1] bg-white dark:bg-zinc-950 border border-brand-dark/5 dark:border-white/5 rounded-[48px] lg:rounded-[64px] overflow-hidden flex flex-col">
                
                {/* Precision Corner Brackets (Gold L-shapes) */}
                <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-brand-primary/60 rounded-tl-lg z-20" />
                <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-brand-primary/60 rounded-tr-lg z-20" />
                <div className="absolute bottom-16 left-8 w-6 h-6 border-b-2 border-l-2 border-brand-primary/60 rounded-bl-lg z-20" />
                <div className="absolute bottom-16 right-8 w-6 h-6 border-b-2 border-r-2 border-brand-primary/60 rounded-br-lg z-20" />

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                {status === 'loading' ? (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-8 animate-fade-in p-10">
                    <div className="relative">
                       <div className="w-24 h-24 rounded-full border border-brand-primary/10 border-t-brand-primary animate-spin" />
                       <Fingerprint size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary animate-pulse" />
                    </div>
                    <div className="w-full max-w-xs space-y-4 text-center">
                       <h3 className="text-lg font-black uppercase tracking-[0.5em] text-brand-primary">{language === 'ar' ? 'جاري التحليل' : 'SYNCHRONIZING'}</h3>
                       <div className="h-0.5 bg-brand-dark/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                       </div>
                    </div>
                  </div>
                ) : status === 'error' ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-10 space-y-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/10">
                       <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-brand-dark dark:text-white uppercase tracking-tight">{language === 'ar' ? 'فشل الاتصال' : 'CONNECTION FAILED'}</h3>
                    <button onClick={() => setStatus('idle')} className="px-10 py-5 bg-brand-dark text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-brand-primary transition-all">
                       {language === 'ar' ? 'إعادة المحاولة' : 'RETRY LINK'}
                    </button>
                  </div>
                ) : lastAnalysisResult ? (
                  <div className="flex-grow flex flex-col animate-fade-in bg-white dark:bg-zinc-950 overflow-hidden">
                    <div className="p-6 border-b border-brand-dark/5 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                       <h3 className="text-xs font-serif font-bold uppercase text-brand-dark dark:text-white tracking-tight truncate max-w-[200px]">{lastAnalysisResult.summary}</h3>
                       <button onClick={() => { setImage(null); setLastAnalysisResult(null); }} className="p-2.5 bg-brand-dark/5 dark:bg-white/5 rounded-xl hover:text-brand-primary transition-all">
                          <RefreshCw size={14} />
                       </button>
                    </div>
                    <div className="flex-grow flex flex-col p-8 gap-8 overflow-y-auto no-scrollbar">
                       <div className="w-full relative aspect-square rounded-[40px] overflow-hidden border border-brand-dark/5 dark:border-white/5">
                          <img src={lastAnalysisResult.imageUrl} className="w-full h-full object-cover" alt="Scan" />
                       </div>
                       <div className="w-full space-y-8 flex flex-col justify-center">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10">
                                <span className="text-[7px] font-black uppercase tracking-widest block opacity-40 mb-2 text-brand-dark dark:text-white">SCORE</span>
                                <span className="text-3xl font-serif font-bold text-brand-primary">{lastAnalysisResult.healthScore}%</span>
                             </div>
                             <div className="p-6 bg-brand-dark/5 dark:bg-white/5 rounded-3xl border border-brand-dark/5 dark:border-white/5">
                                <span className="text-[7px] font-black uppercase tracking-widest block opacity-40 mb-2">KCAL</span>
                                <span className="text-3xl font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.totalCalories}</span>
                             </div>
                          </div>
                          <p className="p-8 rounded-[40px] border border-brand-primary/10 bg-brand-primary/[0.02] italic text-sm leading-relaxed text-brand-dark/60 dark:text-white/50">
                             "{lastAnalysisResult.personalizedAdvice}"
                          </p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col h-full bg-white dark:bg-zinc-950">
                     
                     {/* The Scanner Space - Mobile Mockup Replication */}
                     <div className="flex-grow flex flex-col items-center justify-center px-10 pt-16 pb-8">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative w-full aspect-[4/3] flex flex-col items-center justify-center cursor-pointer group transition-all duration-700`}
                        >
                           {/* Dashed Inner Frame */}
                           <div className="absolute inset-2 md:inset-4 border border-dashed border-brand-dark/10 dark:border-white/20 rounded-[40px] pointer-events-none" />
                           
                           {image ? (
                              <div className="absolute inset-4 rounded-[32px] overflow-hidden">
                                 <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                 <div className="absolute inset-0 bg-brand-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} className="p-5 bg-brand-primary text-white rounded-full">
                                       <Zap size={24} className="animate-pulse" />
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <div className="flex flex-col items-center gap-6 opacity-30 group-hover:opacity-100 transition-all duration-700">
                                 <div className="w-20 h-20 rounded-full border border-brand-dark/5 dark:border-white/5 flex items-center justify-center">
                                    <Plus size={32} strokeWidth={1} />
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-dark dark:text-white">
                                    {language === 'ar' ? 'رفع الإشارة الحيوية' : 'UPLOAD BIOMETRIC'}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Bottom Area - Clean Minimalist (No Title/Desc) */}
                     <div className="px-10 pb-8 text-center">
                        {image && (
                           <button 
                             onClick={handleAnalyze}
                             className="w-full py-5 bg-brand-dark text-white rounded-full font-black text-[9px] uppercase tracking-[0.4em] hover:bg-brand-primary transition-all animate-fade-in"
                           >
                              {language === 'ar' ? 'بدء التحليل' : 'INITIALIZE SYNC'}
                           </button>
                        )}
                     </div>

                     {/* Node Protocol Footer Line */}
                     <div className="pb-10 flex items-center justify-center gap-6">
                        <div className="h-px w-10 md:w-16 bg-brand-dark/5 dark:bg-white/5" />
                        <span className="text-[7px] font-black text-brand-dark/15 dark:text-white/10 uppercase tracking-[0.4em]">Node Protocol 4.0</span>
                        <div className="h-px w-10 md:w-16 bg-brand-dark/5 dark:bg-white/5" />
                     </div>

                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Static Background Accents - No Glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-20 pointer-events-none" />
    </section>
  );
};

export default Hero;

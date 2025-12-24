
import React, { useState, useRef, useEffect } from 'react';
import { Zap, Image as ImageIcon, RefreshCw, AlertCircle, Activity } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState(10); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language].hero;

  useEffect(() => {
    let interval: any;
    if (status === 'loading') {
      setProgress(0);
      setTimeLeft(10);
      interval = setInterval(() => {
        setProgress(p => (p >= 98 ? p : p + (p < 80 ? 12 : 1)));
        setTimeLeft(t => (t > 1 ? t - 1 : 1));
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
        // Small 512px limit ensures tiny payload and lightning fast AI processing
        const MAX_SIZE = 512; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Low quality 0.4 reduces image size from MBs to few KBs
        resolve(canvas.toDataURL('image/jpeg', 0.4));
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

      // Tighten the UI timeout to match Vercel's 10s limit + some network overhead
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection Interrupted. Please try a simpler photo.')), 15000)
      );

      const resultPromise = analyzeMealImage(compressedImage, { chronicDiseases: '', dietProgram: '', activityLevel: 'moderate' });
      
      const result: any = await Promise.race([resultPromise, timeoutPromise]);
      
      if (result) {
        const enriched = { 
          ...result, 
          timestamp: new Date().toLocaleString(), 
          imageUrl: compressedImage 
        };
        setProgress(100);
        setTimeout(() => {
          setLastAnalysisResult(enriched);
          incrementScans(enriched);
          setStatus('idle');
        }, 800);
      } else {
        throw new Error("No response from analytical node.");
      }
    } catch (err: any) {
      console.error("Scanner Error:", err);
      let msg = err.message || 'Transmission Interrupted';
      if (msg.includes('504') || msg.includes('502') || msg.includes('timeout')) {
        msg = 'Vercel 10s Timeout. The cloud took too long to process.';
      }
      setErrorMessage(msg);
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
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-[85vh] bg-brand-light dark:bg-brand-dark pt-24 pb-12 flex items-center transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-brand-primary">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-[0.4em]">{t.badge}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-dark dark:text-white leading-[0.9] tracking-tighter">
                {language === 'ar' ? 'التشخيص' : 'Metabolic'} <span className="text-brand-primary italic">{language === 'ar' ? 'الأيضي' : 'Diagnostic.'}</span>
              </h1>
              <p className="text-brand-dark/40 dark:text-white/30 text-[10px] font-medium max-w-sm mx-auto lg:mx-0 leading-relaxed border-l border-brand-primary/20 pl-4 text-balance">
                {t.desc}
              </p>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={status === 'loading'}
              className="group relative px-10 py-5 bg-brand-dark text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] transition-all duration-300 hover:bg-brand-primary hover:scale-105 active:scale-95 disabled:opacity-50 overflow-hidden"
            >
              <span className="relative z-10">{t.cta}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-success opacity-0 group-active:opacity-100 transition-opacity" />
            </button>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 w-full">
            <div className="relative aspect-[16/10] bg-white dark:bg-zinc-950 border border-brand-dark/[0.08] dark:border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                {status === 'loading' && (
                  <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-6 p-8 text-white">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full border-2 border-brand-primary/10 border-t-brand-primary animate-spin" />
                      <Activity size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary animate-pulse" />
                    </div>
                    <div className="w-full max-w-xs space-y-3 text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary">
                        {language === 'ar' ? `المتبقي التقريبي ~${timeLeft} ثانية` : `TRANSMITTING: ~${timeLeft}S`}
                      </p>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest">{language === 'ar' ? 'معالجة الإشارة عبر الربط فائق السرعة...' : 'HIGH-SPEED CLOUD SCANNING...'}</p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="absolute inset-0 z-50 bg-brand-dark/98 flex flex-col items-center justify-center space-y-6 p-8 text-white text-center animate-fade-in">
                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                      <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">{language === 'ar' ? 'عقدة الاتصال مشغولة' : 'LINK CONGESTION'}</h3>
                      <p className="text-xs text-brand-primary font-bold px-4">{errorMessage}</p>
                      <p className="text-[10px] text-white/30 max-w-xs mx-auto italic">{language === 'ar' ? 'يرجى المحاولة بصورة أصغر أو إضاءة أفضل.' : 'Ensure strong connection and clear lighting.'}</p>
                    </div>
                    <button 
                      onClick={() => { setStatus('idle'); handleAnalyze(); }} 
                      className="px-10 py-4 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all border border-white/5"
                    >
                      {language === 'ar' ? 'إعادة المحاولة' : 'RETRY PROTOCOL'}
                    </button>
                    <button onClick={() => setStatus('idle')} className="text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100">{language === 'ar' ? 'إلغاء' : 'CANCEL'}</button>
                  </div>
                )}

                {lastAnalysisResult ? (
                  <div className="absolute inset-0 flex flex-col animate-fade-in bg-white dark:bg-zinc-950">
                    <div className="p-5 border-b border-brand-dark/[0.04] dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                       <h3 className="text-[11px] font-serif font-bold uppercase truncate pr-4 text-brand-dark dark:text-white tracking-tight">{lastAnalysisResult.summary}</h3>
                       <button onClick={() => { setImage(null); setLastAnalysisResult(null); setStatus('idle'); }} className="p-2 opacity-30 hover:opacity-100 transition-opacity">
                        <RefreshCw size={14} />
                       </button>
                    </div>
                    <div className="flex-grow flex flex-col md:flex-row p-8 gap-8 overflow-y-auto no-scrollbar">
                       <div className="md:w-1/2 rounded-3xl overflow-hidden h-48 md:h-auto border border-black/5 dark:border-white/5 shadow-2xl relative">
                          <img src={lastAnalysisResult.imageUrl} className="w-full h-full object-cover" alt="Meal" />
                       </div>
                       <div className="md:w-1/2 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                                <span className="text-[7px] font-black uppercase block opacity-40 mb-1 tracking-widest">HEALTH SCORE</span>
                                <span className="text-3xl font-serif font-bold text-brand-primary">{lastAnalysisResult.healthScore}</span>
                             </div>
                             <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5">
                                <span className="text-[7px] font-black uppercase block opacity-40 mb-1 tracking-widest">CALORIES</span>
                                <span className="text-3xl font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.totalCalories}</span>
                             </div>
                          </div>
                          <div className="p-5 rounded-2xl border border-brand-primary/10 bg-brand-primary/[0.02] dark:bg-brand-dark/30 italic text-[12px] leading-relaxed text-brand-dark/70 dark:text-white/60">
                            "{lastAnalysisResult.personalizedAdvice}"
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  status !== 'error' && (
                    <div onClick={() => status === 'idle' && fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 dark:bg-zinc-900/20 group/upload transition-all">
                      {image ? (
                        <div className="absolute inset-0">
                           <img src={image} className="w-full h-full object-cover opacity-30 blur-[4px] transition-all duration-700 group-hover/upload:blur-0 group-hover/upload:opacity-50" alt="Preview" />
                           <div className="absolute inset-0 flex items-center justify-center">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} 
                                className="px-12 py-5 bg-brand-dark text-white rounded-full font-black text-[11px] uppercase tracking-[0.6em] border border-white/10 transition-all duration-500 shadow-3xl scale-100 hover:scale-110 hover:bg-brand-primary active:scale-95 active:bg-gradient-to-r active:from-brand-primary active:to-brand-success"
                              >
                                <Zap size={18} className="inline mr-3 text-brand-primary animate-pulse" /> START DIAGNOSTIC
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-6 opacity-20 group-hover/upload:opacity-60 transition-all duration-500 scale-90 group-hover/upload:scale-100">
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-brand-dark dark:border-white flex items-center justify-center">
                            <ImageIcon size={40} strokeWidth={1} />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.6em] text-center">{language === 'ar' ? 'انقر لرفع الإشارة الحيوية' : 'CLICK TO UPLOAD BIOMETRIC'}</span>
                        </div>
                      )}
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

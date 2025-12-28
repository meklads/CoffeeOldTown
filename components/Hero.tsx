
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Baby, HeartPulse, Zap, Camera, Utensils, ShieldAlert, Terminal, ArrowRight, RefreshCw, UploadCloud, Check, AlertCircle, Scan, BrainCircuit } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language } = useApp();
  const [image, setImage] = useState<string | null>(lastAnalysisResult?.imageUrl || null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [loadingStep, setLoadingStep] = useState('');
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, accent: string, color: string }> = {
    GENERAL: { label: isAr ? 'بروتوكول عام' : 'GENERAL PROTOCOL', icon: <Utensils size={20} />, accent: 'text-[#C2A36B]', color: 'bg-[#C2A36B]' },
    ATHLETE: { label: isAr ? 'الرياضي' : 'ATHLETE MODE', icon: <Zap size={20} />, accent: 'text-orange-500', color: 'bg-orange-500' },
    DIABETIC: { label: isAr ? 'السكري' : 'DIABETIC CARE', icon: <HeartPulse size={20} />, accent: 'text-blue-500', color: 'bg-blue-500' },
    PREGNANCY: { label: isAr ? 'الحامل' : 'PREGNANCY SAFE', icon: <Baby size={20} />, accent: 'text-pink-500', color: 'bg-pink-500' }
  };

  const currentConf = personaConfigs[currentPersona];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    
    setStatus('loading');
    setLoadingStep(isAr ? 'بدء التحليل الحيوي...' : 'Starting Bio-Analysis...');

    try {
      // تأخير بسيط لإظهار الأنيميشن
      await new Promise(r => setTimeout(r, 800));
      setLoadingStep(isAr ? 'فك شفرة المكونات...' : 'Decoding Nutrients...');
      
      const result = await analyzeMealImage(image, { chronicDiseases: "none", dietProgram: "general", activityLevel: "moderate", persona: currentPersona }, language);
      
      if (result) {
        setLastAnalysisResult(result);
        incrementScans(result);
        setStatus('success');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen pt-32 pb-20 bg-brand-light dark:bg-brand-dark transition-all duration-1000">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-white/5">
                <ShieldAlert size={14} className="animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'نظام التشخيص الفوري' : 'INSTANT DIAGNOSTIC SYSTEM'}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Metabolic <br /> <span className={`${currentConf.accent} italic`}>{isAr ? 'التشخيص.' : 'Diagnostics.'}</span>
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(personaConfigs) as BioPersona[]).map((key) => {
                const conf = personaConfigs[key];
                const isActive = currentPersona === key;
                return (
                  <button key={key} onClick={() => { setCurrentPersona(key); setStatus('idle'); }}
                    className={`p-6 rounded-[35px] border transition-all h-[110px] flex flex-col justify-between text-left
                      ${isActive ? `${conf.color} text-white shadow-xl` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40'}`}
                  >
                    <div className="flex justify-between">{conf.icon} {isActive && <Check size={14} />}</div>
                    <span className="text-sm font-serif font-bold">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center">
             <div className={`relative w-full max-w-[500px] aspect-[4/5] bg-white dark:bg-zinc-900 rounded-[60px] border-2 transition-all duration-700 border-brand-primary/20 shadow-4xl overflow-hidden`}>
                
                {image ? (
                   <div className="relative h-full w-full">
                      <img src={image} className={`w-full h-full object-cover transition-all duration-700 ${status === 'loading' ? 'scale-110 blur-sm' : ''}`} alt="Meal" />
                      
                      {status === 'loading' && (
                        <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center text-white z-50">
                           <div className="relative mb-8">
                              <Scan size={60} className={`${currentConf.accent} animate-pulse`} />
                              <div className="absolute inset-0 border-t-2 border-brand-primary animate-scan opacity-50" />
                           </div>
                           <h3 className="text-2xl font-serif font-bold mb-2 animate-pulse">{loadingStep}</h3>
                           <p className="text-[10px] font-black tracking-widest text-brand-primary uppercase">Neural Processing...</p>
                        </div>
                      )}

                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-x-6 bottom-6 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-2xl rounded-[45px] p-8 border border-brand-primary/20 shadow-glow animate-fade-in-up z-50">
                           <div className="flex justify-between items-center mb-6">
                              <h4 className="text-2xl font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.summary}</h4>
                              <div className="bg-brand-primary text-white px-4 py-1.5 rounded-xl font-bold text-sm">
                                {lastAnalysisResult.totalCalories} KCAL
                              </div>
                           </div>
                           <button onClick={() => { setImage(null); setStatus('idle'); fileInputRef.current?.click(); }} className="w-full py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all">
                              {isAr ? 'عينة جديدة' : 'NEW SPECIMEN'}
                           </button>
                        </div>
                      )}

                      {status === 'idle' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/40 backdrop-blur-[2px] z-40">
                            <button onClick={handleAnalyze} className={`w-24 h-24 rounded-full flex items-center justify-center ${currentConf.color} text-white shadow-glow hover:scale-110 transition-transform group`}>
                               <BrainCircuit size={40} className="group-hover:rotate-12 transition-transform" />
                            </button>
                            <h4 className="text-xl font-serif font-bold text-white mt-6 italic drop-shadow-lg">{isAr ? 'اضغط للتحليل' : 'Analyze Now'}</h4>
                         </div>
                      )}

                      {status === 'error' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md z-40 text-center p-10 text-white">
                            <AlertCircle size={48} className="mb-6" />
                            <h4 className="text-xl font-serif font-bold mb-6">{isAr ? 'فشل الاتصال بالمختبر' : 'Lab Connection Failed'}</h4>
                            <button onClick={handleAnalyze} className="px-10 py-4 bg-white text-brand-dark rounded-2xl font-black text-[10px] tracking-widest">RETRY</button>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                      <div className={`w-32 h-32 rounded-[45px] border-2 border-dashed border-brand-primary/20 text-brand-primary/40 group-hover:text-brand-primary group-hover:border-brand-primary transition-all flex items-center justify-center mb-8`}>
                         <UploadCloud size={48} />
                      </div>
                      <h4 className="text-2xl font-serif font-bold text-brand-dark/30 dark:text-white/30">{isAr ? 'ارفع صورة الوجبة' : 'Upload Meal Image'}</h4>
                      <p className="text-[10px] font-black tracking-widest text-brand-primary opacity-40 mt-4 uppercase">Specimen Ready for Scan</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </section>
  );
};

export default Hero;

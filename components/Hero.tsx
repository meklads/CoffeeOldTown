
import React, { useState, useRef, useEffect } from 'react';
import { Utensils, Zap, HeartPulse, Baby, ShieldAlert, Check, BrainCircuit, RefreshCcw, UploadCloud, AlertCircle, Sparkles, Radio, Cpu, Settings2, Camera, Search } from 'lucide-react';
import { SectionId, BioPersona } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, currentPersona, setCurrentPersona, language, isApiKeyLinked, setIsApiKeyLinked } = useApp();
  const [image, setImage] = useState<string | null>(lastAnalysisResult?.imageUrl || null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>(lastAnalysisResult ? 'success' : 'idle');
  const [errorDetails, setErrorDetails] = useState<{title: string, msg: string}>({title: '', msg: ''});
  const [scanProgress, setScanProgress] = useState(0);
  
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STABILITY FIX: Auto-reset when persona changes from anywhere (Nexus or local buttons)
  useEffect(() => {
    if (status !== 'loading') {
      setStatus('idle');
      setScanProgress(0);
      setLastAnalysisResult(null);
      setErrorDetails({title: '', msg: ''});
    }
  }, [currentPersona]);

  // Sync with AI Studio Key Manager
  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        const linked = await window.aistudio.hasSelectedApiKey();
        setIsApiKeyLinked(linked);
      }
    };
    checkKey();
  }, [setIsApiKeyLinked]);

  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, accent: string, color: string }> = {
    GENERAL: { label: isAr ? 'بروتوكول عام' : 'GENERAL PROTOCOL', icon: <Utensils size={20} />, accent: 'text-[#C2A36B]', color: 'bg-[#C2A36B]' },
    ATHLETE: { label: isAr ? 'الرياضي' : 'ATHLETE MODE', icon: <Zap size={20} />, accent: 'text-orange-500', color: 'bg-orange-500' },
    DIABETIC: { label: isAr ? 'السكري' : 'DIABETIC CARE', icon: <HeartPulse size={20} />, accent: 'text-blue-500', color: 'bg-blue-500' },
    PREGNANCY: { label: isAr ? 'الحامل' : 'PREGNANCY SAFE', icon: <Baby size={20} />, accent: 'text-pink-500', color: 'bg-pink-500' }
  };

  const handleLinkKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setIsApiKeyLinked(true);
        return true;
      } catch (e) { return false; }
    }
    return false;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStatus('idle');
        setLastAnalysisResult(null);
        setErrorDetails({title: '', msg: ''});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;

    setStatus('loading');
    setScanProgress(10);
    
    try {
      const result = await analyzeMealImage(image, { 
        chronicDiseases: "none", 
        dietProgram: "general", 
        activityLevel: "moderate", 
        persona: currentPersona 
      }, language);
      
      setScanProgress(100);
      if (result) {
        setLastAnalysisResult(result);
        incrementScans(result);
        setStatus('success');
      }
    } catch (err: any) {
      setStatus('error');
      setScanProgress(0);
      if (err.message === "KEY_REBIND_REQUIRED") {
        setErrorDetails({
          title: isAr ? 'مطلوب ربط الحساب' : 'Key Link Required',
          msg: isAr ? 'يرجى اختيار مفتاح API مفعل به الدفع للاستمرار.' : 'Please select a billing-enabled API key to continue.'
        });
        await handleLinkKey();
      } else {
        setErrorDetails({
          title: isAr ? 'عطل في الشبكة' : 'Neural Link Failure',
          msg: isAr ? 'فشل الاتصال بخادم التحليل.' : 'Could not reach analysis node.'
        });
      }
    }
  };

  const resetScanner = () => {
    setImage(null);
    setStatus('idle');
    setLastAnalysisResult(null);
    setScanProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen pt-24 pb-20 bg-brand-light dark:bg-brand-dark overflow-hidden flex flex-col justify-center">
      <div className="absolute top-0 right-0 w-full lg:w-2/3 h-1/2 bg-brand-primary/[0.02] blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-10 animate-fade-in order-2 lg:order-1">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                 <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-white/5 shadow-2xl">
                    <ShieldAlert size={14} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'نظام النبض 5.0' : 'PULSE SYSTEM 5.0'}</span>
                 </div>
                 <button onClick={handleLinkKey} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isApiKeyLinked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary animate-pulse'}`}>
                    <Radio size={12} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isApiKeyLinked ? (isAr ? 'رابط نشط' : 'LINK ACTIVE') : (isAr ? 'غير مرتبط' : 'LINK KEY')}</span>
                 </button>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                Bio-Metric <br /> <span className={`${personaConfigs[currentPersona].accent} italic`}>{isAr ? 'التشخيص.' : 'Diagnostics.'}</span>
              </h1>
              
              <p className="text-sm md:text-base text-brand-dark/50 dark:text-white/40 italic font-medium max-w-sm leading-relaxed">
                {isAr ? 'حلل السعرات والتركيبة الغذائية فورياً باستخدام معالجة عصبية سحابية.' : 'Decode caloric density and macro signatures instantly using cloud-neural processing.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {(Object.keys(personaConfigs) as BioPersona[]).map((key) => (
                <button key={key} onClick={() => setCurrentPersona(key)}
                  className={`p-5 md:p-6 rounded-[35px] border transition-all h-[110px] md:h-[120px] flex flex-col justify-between text-left relative overflow-hidden group
                    ${currentPersona === key ? `${personaConfigs[key].color} text-white shadow-2xl scale-[1.03]` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40 hover:border-brand-primary/20'}`}
                >
                  <div className="flex justify-between relative z-10">
                    <div className={`${currentPersona === key ? 'text-white' : 'text-brand-primary'}`}>{personaConfigs[key].icon}</div>
                    {currentPersona === key && <Check size={14} className="animate-in fade-in" />}
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10">{personaConfigs[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center order-1 lg:order-2 w-full">
             <div className={`relative w-full max-w-[520px] aspect-[4/5] bg-white dark:bg-[#0D0D0D] rounded-[60px] md:rounded-[70px] border-2 transition-all duration-700 ${status === 'loading' ? 'border-brand-primary shadow-glow' : 'border-brand-dark/5 dark:border-white/10'} shadow-4xl overflow-hidden`}>
                {image ? (
                   <div className="relative h-full w-full">
                      <img src={image} className="w-full h-full object-cover" alt="Meal Specimen" />
                      {status === 'loading' && (
                        <div className="absolute inset-0 bg-brand-dark/85 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-white z-50">
                           <Cpu size={70} className="text-brand-primary animate-spin-slow mb-6" />
                           <h3 className="text-2xl font-serif font-bold italic tracking-widest mb-4">{isAr ? 'جاري فك التشفير...' : 'Decoding Metabolism...'}</h3>
                           <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-primary shadow-glow transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                           </div>
                        </div>
                      )}
                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-8 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-2xl rounded-[40px] p-8 md:p-10 border border-brand-primary/20 shadow-2xl animate-fade-in-up z-50">
                           <div className="flex justify-between items-start mb-6">
                              <div className="space-y-1">
                                <h4 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark dark:text-white leading-tight">{lastAnalysisResult.summary}</h4>
                                <div className="flex items-center gap-2">
                                  <Sparkles size={12} className="text-brand-primary" />
                                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{lastAnalysisResult.healthScore}% VITALITY</span>
                                </div>
                              </div>
                              <button onClick={resetScanner} className="p-3 bg-brand-dark/5 dark:bg-white/5 text-brand-primary rounded-2xl hover:bg-brand-primary hover:text-white transition-all"><RefreshCcw size={18} /></button>
                           </div>
                           <button onClick={resetScanner} className="w-full py-5 bg-brand-dark text-white rounded-[25px] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-brand-primary transition-all shadow-xl">{isAr ? 'عينة جديدة' : 'NEW SPECIMEN'}</button>
                        </div>
                      )}
                      {status === 'error' && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center text-white z-50">
                           <AlertCircle size={48} className="text-red-500 animate-pulse mb-6" />
                           <h3 className="text-xl md:text-2xl font-serif font-bold mb-3">{errorDetails.title}</h3>
                           <p className="text-sm text-white/50 mb-10 italic max-w-xs leading-relaxed">{errorDetails.msg}</p>
                           <button onClick={handleAnalyze} className="w-full max-w-[200px] py-4 bg-brand-primary text-white rounded-[25px] text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">RETRY_SCAN</button>
                        </div>
                      )}
                      {status === 'idle' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/20 backdrop-blur-[1px] z-40">
                            <button onClick={handleAnalyze} className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 ${personaConfigs[currentPersona].color} shadow-glow`}>
                               <BrainCircuit size={48} />
                            </button>
                            <span className="mt-8 text-[10px] font-black text-white uppercase tracking-[0.6em] animate-pulse">{isAr ? 'انقر للتشخيص' : 'TAP TO ANALYZE'}</span>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center cursor-pointer group/upload relative bg-brand-cream/50 dark:bg-white/[0.02]" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud size={60} className="text-brand-primary opacity-30 group-hover/upload:opacity-100 transition-all duration-700 mb-8" />
                      <h4 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">{isAr ? 'ارفع العينة' : 'Input Specimen.'}</h4>
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

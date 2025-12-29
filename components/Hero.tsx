
import React, { useState, useRef, useEffect } from 'react';
import { Utensils, Zap, HeartPulse, Baby, ShieldAlert, Check, BrainCircuit, RefreshCcw, UploadCloud, AlertCircle, Sparkles, Radio, Cpu, Settings2, Camera, Search, ChevronRight, Activity, ThermometerSun, Droplets } from 'lucide-react';
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

  useEffect(() => {
    if (status !== 'loading') {
      setStatus('idle');
      setScanProgress(0);
      setLastAnalysisResult(null);
      setErrorDetails({title: '', msg: ''});
    }
  }, [currentPersona]);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        const linked = await window.aistudio.hasSelectedApiKey();
        setIsApiKeyLinked(linked);
      }
    };
    checkKey();
  }, [setIsApiKeyLinked]);

  const personaConfigs: Record<BioPersona, { label: string, icon: React.ReactNode, accent: string, color: string, ring: string }> = {
    GENERAL: { label: isAr ? 'بروتوكول عام' : 'GENERAL PROTOCOL', icon: <Utensils size={20} />, accent: 'text-[#C2A36B]', color: 'bg-[#C2A36B]', ring: 'ring-[#C2A36B]/20' },
    ATHLETE: { label: isAr ? 'الرياضي' : 'ATHLETE MODE', icon: <Zap size={20} />, accent: 'text-orange-500', color: 'bg-orange-500', ring: 'ring-orange-500/20' },
    DIABETIC: { label: isAr ? 'السكري' : 'DIABETIC CARE', icon: <HeartPulse size={20} />, accent: 'text-blue-500', color: 'bg-blue-500', ring: 'ring-blue-500/20' },
    PREGNANCY: { label: isAr ? 'الحامل' : 'PREGNANCY SAFE', icon: <Baby size={20} />, accent: 'text-pink-500', color: 'bg-pink-500', ring: 'ring-pink-500/20' }
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
    setScanProgress(5);
    try {
      const timer = setInterval(() => setScanProgress(p => p >= 90 ? 90 : p + 2), 200);
      const result = await analyzeMealImage(image, { 
        chronicDiseases: "none", 
        dietProgram: "general", 
        activityLevel: "moderate", 
        persona: currentPersona 
      }, language);
      clearInterval(timer);
      setScanProgress(100);
      if (result) {
        setLastAnalysisResult(result);
        incrementScans(result);
        setStatus('success');
      }
    } catch (err: any) {
      setStatus('error');
      setScanProgress(0);
      setErrorDetails({
        title: isAr ? 'عطل في المعالجة' : 'Analysis Failed',
        msg: isAr ? 'تحقق من المفتاح أو الاتصال.' : 'Check API key or link.'
      });
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
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          <div className="lg:col-span-5 space-y-10 animate-fade-in order-2 lg:order-1 lg:sticky lg:top-32">
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
             <div className={`relative w-full max-w-[580px] bg-white dark:bg-[#0D0D0D] rounded-[60px] md:rounded-[80px] border-2 transition-all duration-700 ${status === 'loading' ? 'border-brand-primary shadow-glow' : 'border-brand-dark/5 dark:border-white/10'} shadow-4xl overflow-hidden min-h-[500px]`}>
                
                {image ? (
                   <div className="relative w-full h-full flex flex-col">
                      <div className={`relative w-full transition-all duration-700 ${status === 'success' ? 'h-48 md:h-64' : 'h-[500px]'}`}>
                        <img src={image} className="w-full h-full object-cover" alt="Meal Specimen" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {status === 'loading' && (
                          <div className="absolute inset-0 bg-brand-dark/85 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-white z-50">
                             <Cpu size={70} className="text-brand-primary animate-spin-slow mb-6" />
                             <h3 className="text-2xl font-serif font-bold italic tracking-widest mb-4">{isAr ? 'جاري فك التشفير...' : 'Decoding Metabolism...'}</h3>
                             <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary shadow-glow transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                             </div>
                          </div>
                        )}
                      </div>

                      {status === 'success' && lastAnalysisResult && (
                        <div className="flex-grow bg-white dark:bg-[#0D0D0D] p-8 md:p-12 animate-fade-in-up space-y-10 overflow-y-auto no-scrollbar">
                           <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-brand-dark/5 dark:border-white/5 pb-8">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                   <Activity size={18} className={personaConfigs[currentPersona].accent} />
                                   <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{isAr ? 'تم التحقق من العينة' : 'SPECIMEN VERIFIED'}</span>
                                </div>
                                <h4 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark dark:text-white leading-tight tracking-tighter">{lastAnalysisResult.summary}</h4>
                              </div>
                              <div className={`flex items-center gap-6 p-6 rounded-[35px] border border-brand-dark/5 dark:border-white/10 ${personaConfigs[currentPersona].ring} ring-4`}>
                                 <div className="text-center">
                                    <span className={`text-4xl font-serif font-bold ${personaConfigs[currentPersona].accent}`}>{lastAnalysisResult.healthScore}</span>
                                    <span className="block text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">VITALITY</span>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-6">
                              {[
                                { l: isAr ? 'بروتين' : 'PRO', v: lastAnalysisResult.macros.protein, i: <Zap size={14} />, c: 'bg-orange-500' },
                                { l: isAr ? 'كربوهيدرات' : 'CARB', v: lastAnalysisResult.macros.carbs, i: <ThermometerSun size={14} />, c: 'bg-blue-500' },
                                { l: isAr ? 'دهون' : 'FAT', v: lastAnalysisResult.macros.fat, i: <Droplets size={14} />, c: 'bg-emerald-500' }
                              ].map((m, i) => (
                                <div key={i} className="space-y-3">
                                   <div className="flex justify-between items-center px-1">
                                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">{m.i} {m.l}</span>
                                      <span className="text-xs font-bold text-brand-dark dark:text-white">{m.v}g</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-brand-dark/5 dark:bg-white/5 rounded-full overflow-hidden">
                                      <div className={`h-full ${m.c} transition-all duration-1000 delay-300`} style={{ width: `${Math.min(100, m.v * 2)}%` }} />
                                   </div>
                                </div>
                              ))}
                           </div>

                           <div className="space-y-6">
                              <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">{isAr ? 'المكونات المكتشفة' : 'DETECTED SUBSTRATES'}</span>
                              <div className="flex flex-wrap gap-2">
                                 {lastAnalysisResult.ingredients.map((ing, i) => (
                                   <div key={i} className="px-4 py-2 bg-brand-dark/5 dark:bg-white/5 border border-brand-dark/5 dark:border-white/10 rounded-xl text-[10px] font-bold text-brand-dark dark:text-white/80">
                                      {ing.name} <span className="opacity-40 ml-1">({ing.calories} kcal)</span>
                                   </div>
                                 ))}
                              </div>
                           </div>

                           <div className={`p-8 rounded-[40px] border border-brand-primary/10 relative overflow-hidden group/advice ${personaConfigs[currentPersona].color}/5`}>
                              <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={40} className={personaConfigs[currentPersona].accent} /></div>
                              <div className="relative z-10 space-y-3">
                                 <span className={`text-[9px] font-black uppercase tracking-widest ${personaConfigs[currentPersona].accent}`}>{isAr ? 'نصيحة البروتوكول' : 'PROTOCOL ADVICE'}</span>
                                 <p className="text-lg font-serif italic text-brand-dark dark:text-white/90 leading-relaxed">
                                    "{lastAnalysisResult.personalizedAdvice}"
                                 </p>
                              </div>
                           </div>

                           <div className="flex flex-col sm:flex-row gap-4 pt-4">
                              <button onClick={resetScanner} className="flex-grow py-5 bg-brand-dark text-white rounded-[25px] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-brand-primary transition-all flex items-center justify-center gap-3">
                                 <RefreshCcw size={14} /> {isAr ? 'عينة جديدة' : 'NEW SPECIMEN'}
                              </button>
                              <button onClick={() => window.print()} className="px-10 py-5 border-2 border-brand-dark/5 dark:border-white/10 rounded-[25px] text-[10px] font-black uppercase tracking-widest hover:border-brand-primary transition-all text-brand-dark dark:text-white">
                                 {isAr ? 'تصدير التقرير' : 'EXPORT REPORT'}
                              </button>
                           </div>
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
                   <div className="h-[600px] w-full flex flex-col items-center justify-center p-12 text-center cursor-pointer group/upload relative bg-brand-cream/50 dark:bg-white/[0.02]" onClick={() => fileInputRef.current?.click()}>
                      <div className="absolute inset-8 border-2 border-dashed border-brand-primary/10 rounded-[60px] group-hover/upload:border-brand-primary transition-all duration-700" />
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

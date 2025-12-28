
import React, { useState, useRef, useEffect } from 'react';
import { Utensils, Zap, HeartPulse, Baby, ShieldAlert, Check, BrainCircuit, RefreshCcw, UploadCloud, AlertCircle, Sparkles, Key, Radio, Cpu, Settings2, Camera, Info, Search } from 'lucide-react';
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

  // Sync key state with window.aistudio helper if available
  useEffect(() => {
    const checkKeyStatus = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        const linked = await window.aistudio.hasSelectedApiKey();
        setIsApiKeyLinked(linked);
      }
    };
    checkKeyStatus();
  }, [status, setIsApiKeyLinked]);

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
        setStatus('idle');
      } catch (e) {
        console.error("Key selection interrupted", e);
      }
    }
  };

  const resizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400; 
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; } }
        else { if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); 
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resized = await resizeImage(reader.result as string);
        setImage(resized);
        setStatus('idle');
        setScanProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;

    if (!isApiKeyLinked) {
      handleLinkKey();
      return;
    }

    setStatus('loading');
    setScanProgress(10);
    
    try {
      // Smooth progress simulation
      const progressTimer = setInterval(() => {
        setScanProgress(prev => Math.min(prev + (Math.random() * 10), 92));
      }, 400);

      const result = await analyzeMealImage(image, { chronicDiseases: "none", dietProgram: "general", activityLevel: "moderate", persona: currentPersona }, language);
      
      clearInterval(progressTimer);
      setScanProgress(100);

      if (result) {
        setLastAnalysisResult(result);
        incrementScans(result);
        setStatus('success');
      }
    } catch (err: any) {
      console.error("Scan Error:", err);
      setStatus('error');
      if (err.message === "API_KEY_MISSING" || err.message === "KEY_REBIND_REQUIRED") {
        setErrorDetails({
          title: isAr ? 'رابط API مطلوب' : 'API Link Required',
          msg: isAr ? 'يجب اختيار مفتاح API صالح من Google AI Studio للاتصال بخدمات التشخيص.' : 'A valid API key from Google AI Studio must be linked to access diagnostic nodes.'
        });
      } else {
        setErrorDetails({
          title: isAr ? 'عطل في المعالجة' : 'Processing Failure',
          msg: isAr ? 'لم نتمكن من تحليل العينة حالياً. يرجى المحاولة مرة أخرى.' : 'Unable to analyze the current specimen. Please attempt another scan.'
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

  const currentConf = personaConfigs[currentPersona];

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen pt-32 pb-20 bg-brand-light dark:bg-brand-dark overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-0 w-2/3 h-1/2 bg-brand-primary/[0.03] blur-[140px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-12 animate-fade-in">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                 <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-white/5 shadow-2xl">
                    <ShieldAlert size={14} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'نظام النبض 5.0' : 'PULSE SYSTEM 5.0'}</span>
                 </div>
                 <button onClick={handleLinkKey} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isApiKeyLinked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary animate-pulse'}`}>
                    <Radio size={12} className={isApiKeyLinked ? 'animate-pulse' : ''} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isApiKeyLinked ? (isAr ? 'مباشر' : 'LINK ACTIVE') : (isAr ? 'غير متصل' : 'OFFLINE')}</span>
                 </button>
              </div>

              <h1 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-[0.85]">
                Metabolic <br /> <span className={`${currentConf.accent} italic`}>{isAr ? 'التشخيص.' : 'Diagnostics.'}</span>
              </h1>
              
              <p className="text-base md:text-lg text-brand-dark/50 dark:text-white/40 italic font-medium max-w-sm leading-relaxed">
                {isAr ? 'حلل السعرات والتركيبة الغذائية فورياً باستخدام معالجة عصبية سحابية.' : 'Decode caloric density and macro signatures instantly using cloud-neural processing.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(personaConfigs) as BioPersona[]).map((key) => (
                <button key={key} onClick={() => setCurrentPersona(key)}
                  className={`p-6 rounded-[35px] border transition-all h-[120px] flex flex-col justify-between text-left relative overflow-hidden group
                    ${currentPersona === key ? `${personaConfigs[key].color} text-white shadow-2xl scale-105 z-10` : 'bg-white dark:bg-white/5 border-brand-dark/5 dark:border-white/5 text-brand-dark dark:text-white/40 hover:border-brand-primary/20'}`}
                >
                  <div className="flex justify-between relative z-10">
                    <div className={`${currentPersona === key ? 'text-white' : 'text-brand-primary'} transition-colors`}>{personaConfigs[key].icon}</div>
                    {currentPersona === key && <Check size={14} className="animate-in fade-in" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest relative z-10">{personaConfigs[key].label}</span>
                  {currentPersona !== key && (
                    <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4 p-5 bg-brand-dark/5 dark:bg-white/5 rounded-3xl border border-brand-dark/5 dark:border-white/5">
                <Info size={18} className="text-brand-primary shrink-0" />
                <p className="text-[10px] font-bold text-brand-dark/40 dark:text-white/30 uppercase tracking-[0.3em]">
                  {isAr ? 'اضبط ملفك الشخصي قبل البدء بالمسح الضوئي للعينات' : 'CALIBRATE BIO-PROFILE BEFORE INITIALIZING SPECIMEN ANALYSIS'}
                </p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center">
             <div className={`relative w-full max-w-[540px] aspect-[4/5] bg-white dark:bg-[#111111] rounded-[70px] border-2 transition-all duration-700 ${status === 'loading' ? 'border-brand-primary shadow-glow' : 'border-brand-dark/5 dark:border-white/10'} shadow-4xl overflow-hidden group/scanner`}>
                
                {image ? (
                   <div className="relative h-full w-full">
                      <img src={image} className="w-full h-full object-cover" alt="Meal Specimen" />
                      
                      {/* Analysis Loading UI */}
                      {status === 'loading' && (
                        <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center text-white z-50">
                           <div className="relative mb-10 group">
                              <div className="absolute -inset-8 border border-brand-primary/20 rounded-full animate-ping opacity-20" />
                              <Cpu size={80} className="text-brand-primary animate-spin-slow" />
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-primary">
                                {Math.round(scanProgress)}%
                              </div>
                           </div>
                           <h3 className="text-2xl font-serif font-bold italic tracking-widest mb-4">{isAr ? 'جاري فك التشفير الأيضي...' : 'Decoding Metabolism...'}</h3>
                           
                           <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
                              <div className="h-full bg-brand-primary shadow-[0_0_10px_#C2A36B] transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                           </div>
                           
                           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-brand-primary/60">ESTABLISHING DIRECT NEURAL LINK</p>
                           <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-primary/30 animate-scan" />
                        </div>
                      )}

                      {/* Success Results Card */}
                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-x-8 bottom-8 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-2xl rounded-[50px] p-10 border border-brand-primary/20 shadow-glow animate-fade-in-up z-50">
                           <div className="flex justify-between items-start mb-6">
                              <div className="space-y-2">
                                <h4 className="text-3xl font-serif font-bold text-brand-dark dark:text-white leading-tight">{lastAnalysisResult.summary}</h4>
                                <div className="flex items-center gap-4">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                                    <Sparkles size={12} className="text-brand-primary animate-pulse" />
                                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{isAr ? 'درجة الصحة' : 'HEALTH'}: {lastAnalysisResult.healthScore}%</span>
                                  </div>
                                  <span className="text-[10px] font-black text-brand-dark/30 dark:text-white/30 uppercase tracking-[0.2em]">{lastAnalysisResult.totalCalories} KCAL</span>
                                </div>
                              </div>
                              <button onClick={resetScanner} className="p-3 bg-brand-dark/5 dark:bg-white/5 text-brand-primary rounded-2xl hover:bg-brand-primary hover:text-white transition-all"><RefreshCcw size={18} /></button>
                           </div>
                           <div className="grid grid-cols-3 gap-4 mb-8">
                              <div className="bg-brand-dark/5 dark:bg-white/5 p-4 rounded-3xl text-center border border-transparent hover:border-brand-primary/10 transition-colors">
                                 <span className="text-[7px] font-black uppercase text-brand-dark/40 dark:text-white/40 block mb-1 tracking-widest">PROTEIN</span>
                                 <span className="text-xl font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.macros.protein}g</span>
                              </div>
                              <div className="bg-brand-dark/5 dark:bg-white/5 p-4 rounded-3xl text-center border border-transparent hover:border-brand-primary/10 transition-colors">
                                 <span className="text-[7px] font-black uppercase text-brand-dark/40 dark:text-white/40 block mb-1 tracking-widest">CARBS</span>
                                 <span className="text-xl font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.macros.carbs}g</span>
                              </div>
                              <div className="bg-brand-dark/5 dark:bg-white/5 p-4 rounded-3xl text-center border border-transparent hover:border-brand-primary/10 transition-colors">
                                 <span className="text-[7px] font-black uppercase text-brand-dark/40 dark:text-white/40 block mb-1 tracking-widest">FAT</span>
                                 <span className="text-xl font-serif font-bold text-brand-dark dark:text-white">{lastAnalysisResult.macros.fat}g</span>
                              </div>
                           </div>
                           <button onClick={resetScanner} className="w-full py-5 bg-brand-dark text-white rounded-[25px] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-brand-primary transition-all shadow-xl">{isAr ? 'عينة جديدة' : 'NEW SPECIMEN'}</button>
                        </div>
                      )}

                      {/* Advanced Error Display */}
                      {status === 'error' && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center text-white z-50">
                           <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                             <AlertCircle size={48} className="text-red-500 animate-pulse" />
                           </div>
                           <h3 className="text-2xl font-serif font-bold mb-4">{errorDetails.title}</h3>
                           <p className="text-sm text-white/50 mb-12 italic max-w-xs leading-relaxed">{errorDetails.msg}</p>
                           <div className="flex flex-col w-full gap-4 max-w-sm">
                              <button onClick={handleLinkKey} className="w-full py-5 bg-brand-primary text-white rounded-[25px] text-[10px] font-black uppercase tracking-[0.5em] shadow-glow flex items-center justify-center gap-3 active:scale-95 transition-all">
                                 <Settings2 size={16} /> {isAr ? 'إعدادات المفتاح' : 'ADJUST KEY SETTINGS'}
                              </button>
                              <button onClick={handleAnalyze} className="w-full py-4 border border-white/10 text-white/60 rounded-[25px] text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">RETRY_SCAN</button>
                           </div>
                        </div>
                      )}

                      {/* Interactive Idle Scan Button */}
                      {status === 'idle' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/30 backdrop-blur-[2px] z-40">
                            <button 
                              onClick={handleAnalyze} 
                              className={`group/scan-btn w-32 h-32 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-brand-primary/40 hover:scale-105 active:scale-95 transition-all duration-500 relative overflow-hidden ${personaConfigs[currentPersona].color} hover:rotate-6 active:rotate-0`}
                            >
                               {/* Gradient Change on Click/Active: Brand Primary (#C2A36B) to Brand Emerald (#2ECC71) */}
                               <div className="absolute inset-0 bg-gradient-to-br from-[#C2A36B] to-[#2ECC71] opacity-0 group-active/scan-btn:opacity-100 transition-opacity duration-300" />
                               
                               <div className="relative z-10 flex flex-col items-center gap-1">
                                  <BrainCircuit size={48} className="group-hover/scan-btn:scale-110 transition-transform duration-500" />
                                  <span className="text-[7px] font-black uppercase tracking-widest opacity-60">SCAN</span>
                               </div>
                               
                               <div className="absolute -inset-4 border-2 border-white/20 rounded-full animate-ping opacity-20 pointer-events-none" />
                            </button>
                            <span className="mt-8 text-[10px] font-black text-white uppercase tracking-[0.6em] drop-shadow-xl animate-pulse">{isAr ? 'انقر للتشخيص' : 'INITIALIZE NEURAL SCAN'}</span>
                            
                            <button onClick={resetScanner} className="absolute top-10 right-10 p-4 bg-white/10 backdrop-blur-xl text-white rounded-3xl border border-white/5 hover:bg-red-500 transition-all">
                              <RefreshCcw size={18} />
                            </button>
                         </div>
                      )}
                   </div>
                ) : (
                   /* Prominent Upload / Capture Area */
                   <div 
                    className="h-full w-full flex flex-col items-center justify-center p-12 text-center cursor-pointer group/upload relative bg-brand-cream/50 dark:bg-brand-dark/30" 
                    onClick={() => fileInputRef.current?.click()}
                   >
                      <div className="absolute inset-10 border-2 border-dashed border-brand-primary/10 rounded-[60px] group-hover/upload:border-brand-primary/40 group-hover/upload:inset-8 transition-all duration-700" />
                      
                      <div className="relative mb-8 transform group-hover/upload:scale-110 group-hover/upload:-rotate-3 transition-all duration-1000">
                        <div className="w-36 h-36 bg-white dark:bg-[#151515] rounded-[45px] flex items-center justify-center border border-brand-primary/10 group-hover/upload:border-brand-primary/40 shadow-2xl transition-all">
                          <UploadCloud size={64} className="text-brand-primary opacity-30 group-hover/upload:opacity-100 transition-all duration-700" />
                        </div>
                        <div className="absolute -inset-6 border border-brand-primary/5 rounded-[50px] animate-spin-slow opacity-20" />
                      </div>

                      <div className="space-y-4 relative z-10">
                        <h4 className="text-4xl font-serif font-bold text-brand-dark dark:text-white tracking-tight leading-none group-hover/upload:text-brand-primary transition-colors">
                          {isAr ? 'ارفع العينة الحيوية' : 'Input Specimen.'}
                        </h4>
                        <p className="text-sm text-brand-dark/40 dark:text-white/30 font-medium italic max-w-[280px] mx-auto leading-relaxed">
                          {isAr ? 'التقط صورة للوجبة أو ارفع ملفاً لبدء التحليل العصبي الشامل.' : 'Capture or upload a visual sample to begin comprehensive neural diagnostics.'}
                        </p>
                      </div>

                      <div className="mt-12 flex items-center gap-8 relative z-10">
                        <div className="flex flex-col items-center gap-3">
                           <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-dark/20 dark:text-white/20 group-hover/upload:text-brand-primary group-hover/upload:bg-brand-primary/5 transition-all">
                              <Camera size={24} />
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-brand-dark/20 dark:text-white/20">LIVE_CAM</span>
                        </div>
                        <div className="w-px h-10 bg-brand-dark/5 dark:bg-white/10" />
                        <div className="flex flex-col items-center gap-3">
                           <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-dark/20 dark:text-white/20 group-hover/upload:text-brand-primary group-hover/upload:bg-brand-primary/5 transition-all">
                              <Search size={24} />
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-brand-dark/20 dark:text-white/20">FILE_BROWSE</span>
                        </div>
                      </div>

                      <div className="absolute bottom-12 text-[9px] font-black text-brand-primary/20 uppercase tracking-[0.5em] animate-pulse">
                        {isAr ? 'معالجة مشفرة بالكامل' : 'END-TO-END ENCRYPTED SCANNER'}
                      </div>
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

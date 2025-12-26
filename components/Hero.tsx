
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Microscope, Fingerprint, AlertCircle, CheckCircle2, RotateCcw, Database, Sparkles, Flame, Activity } from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { analyzeMealImage } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, scrollTo, lastAnalysisResult } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [archiveIdx, setArchiveIdx] = useState(0);
  const [isArchiveVisible, setIsArchiveVisible] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Ultra-stable food imagery links to prevent "missing image" distortions
  const archiveSamples = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000&q=80",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1000&q=80",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1000&q=80"
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
    }, 5000);

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
      setProgress(prev => (prev >= 95 ? 95 : prev + Math.floor(Math.random() * 5) + 2));
    }, 150);

    try {
      const result = await analyzeMealImage(image, {
        chronicDiseases: "none",
        dietProgram: "general",
        activityLevel: "moderate"
      });
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      if (result && result.totalCalories) {
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: image });
        incrementScans(result);
        setStatus('success');
      } else { throw new Error("Diagnostic data extraction failed."); }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
      setErrorMessage(err.message || "Connection to diagnostic core lost.");
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
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative h-screen lg:h-screen min-h-[700px] bg-brand-light flex items-center overflow-hidden pt-20 lg:pt-0">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0" style={{ backgroundImage: 'radial-gradient(#0A0A0A 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl w-full mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          
          {/* Right Column (Scanner) - Order 1 on Mobile for full focus */}
          <div className="flex justify-center lg:justify-end items-center order-1 lg:order-2">
             <div 
               className="relative w-full max-w-full md:max-w-[420px] transition-transform duration-1000"
               style={{ transform: window.innerWidth > 1024 ? `translate(${mousePos.x}px, ${mousePos.y}px)` : 'none' }}
             >
               <div className="relative aspect-[3/4] rounded-[40px] md:rounded-[70px] border border-brand-dark/[0.08] bg-white overflow-hidden shadow-4xl z-20 group">
                  {image ? (
                    <div className="absolute inset-0">
                      <img src={image} className="w-full h-full object-cover" alt="Specimen" />
                      {status === 'loading' && (
                        <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
                           <div className="relative w-24 h-24 mb-6">
                              <svg className="w-full h-full -rotate-90">
                                <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                                <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                  strokeDasharray={427} strokeDashoffset={427 - (427 * progress) / 100}
                                  className="text-brand-primary transition-all duration-300" 
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-serif font-bold text-white">{progress}%</span>
                              </div>
                           </div>
                           <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.5em] animate-pulse">ANALYZING_BIO_LOAD</span>
                        </div>
                      )}

                      {status === 'success' && lastAnalysisResult && (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl flex flex-col p-8 z-50 animate-fade-in">
                           <div className="flex justify-between items-start mb-6">
                              <div className="bg-brand-primary/20 p-2 rounded-xl border border-brand-primary/30 text-brand-primary">
                                 <CheckCircle2 size={18} />
                              </div>
                              <button onClick={resetScanner} className="p-2 text-white/20 hover:text-white transition-colors"><RotateCcw size={18} /></button>
                           </div>
                           <div className="space-y-1 mb-6">
                              <span className="text-[7px] font-black text-brand-primary uppercase tracking-[0.4em]">Report_Output</span>
                              <h3 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight">{lastAnalysisResult.summary}</h3>
                           </div>
                           <div className="grid grid-cols-2 gap-3 mb-8">
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                 <div className="flex items-center gap-2 opacity-30 mb-1"><Flame size={10} /><span className="text-[7px] font-black uppercase">Energy</span></div>
                                 <p className="text-lg font-serif font-bold text-white">{lastAnalysisResult.totalCalories}<span className="text-[8px] ml-1 opacity-40">kcal</span></p>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                 <div className="flex items-center gap-2 opacity-30 mb-1"><Activity size={10} /><span className="text-[7px] font-black uppercase">Health</span></div>
                                 <p className="text-lg font-serif font-bold text-brand-primary">{lastAnalysisResult.healthScore}%</p>
                              </div>
                           </div>
                           <button onClick={() => scrollTo(SectionId.PHASE_03_SYNTHESIS)} className="w-full mt-auto py-5 bg-brand-primary text-brand-dark rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] shadow-glow">SYNC PROTOCOL</button>
                        </div>
                      )}

                      {status === 'idle' && (
                        <div className="absolute inset-0 bg-brand-dark/30 lg:opacity-0 lg:group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4 z-40 backdrop-blur-[2px]">
                           <button onClick={handleAnalyze} className="bg-brand-primary text-brand-dark p-6 rounded-full shadow-glow hover:scale-110 active:scale-95 transition-all"><Microscope size={28} /></button>
                           <span className="text-[8px] font-black text-white uppercase tracking-[0.5em]">Start_Diagnostic</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-6">
                      <div className="relative mb-6">
                         <div className="absolute -inset-10 border border-brand-primary/5 rounded-full animate-pulse-slow" />
                         <div className="w-16 h-16 rounded-[25px] bg-brand-light flex items-center justify-center border border-brand-dark/[0.04] shadow-sm">
                          <Plus size={32} className="text-brand-primary" />
                         </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h4 className="text-lg font-serif font-bold text-brand-dark/40 tracking-tight italic">Insert Specimen</h4>
                        <span className="text-[6px] font-black text-brand-dark/20 uppercase tracking-[0.6em]">SCAN_PORT_READY</span>
                      </div>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
               <div className="absolute -bottom-8 right-8 flex items-center gap-3 opacity-10">
                  <Fingerprint size={12} /><p className="text-[6px] font-black uppercase tracking-[0.5em]">SCAN_UNIT_6.1</p>
               </div>
             </div>
          </div>

          {/* Left Column (Content Block) - One unified mass */}
          <div className="flex flex-col space-y-8 animate-fade-in order-2 lg:order-1 text-center lg:text-left">
            {/* Title Block */}
            <div className="space-y-6">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-brand-dark/[0.05] rounded-full shadow-sm mx-auto lg:mx-0">
                  <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[7px] font-black uppercase tracking-[0.4em] text-brand-dark/40">BIO_DIAGNOSTIC_STABLE</span>
               </div>
               <div className="space-y-4">
                  <h1 className="text-5xl md:text-8xl lg:text-[100px] font-serif font-bold text-brand-dark leading-[0.8] tracking-tighter">
                    Metabolic <br /><span className="text-brand-primary italic font-normal">Diagnostic.</span>
                  </h1>
                  <p className="text-brand-dark/40 text-[9px] font-bold tracking-[0.2em] max-w-sm mx-auto lg:mx-0 uppercase leading-relaxed">
                    PRECISION INSTRUMENTATION FOR REAL-TIME MOLECULAR ANALYSIS.
                  </p>
               </div>
            </div>

            {/* Archive Visual Block - Fixed Transition */}
            <div className="hidden lg:block relative w-full max-w-md aspect-video overflow-hidden rounded-[40px] bg-white border border-brand-dark/[0.05] shadow-2xl group/archive">
               <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isArchiveVisible ? 'opacity-100' : 'opacity-0'}`}>
                  <img 
                    src={archiveSamples[archiveIdx]} 
                    className="w-full h-full object-cover grayscale-[0.3] transition-transform duration-[10s] group-hover/archive:scale-110" 
                    alt="Specimen Record" 
                  />
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
               <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="p-2.5 bg-brand-dark/90 rounded-xl text-brand-primary shadow-2xl border border-white/5"><Database size={14} /></div>
                  <div className="flex flex-col">
                     <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.4em]">ARCHIVE_SPECIMEN</span>
                     <span className="text-xs font-serif font-bold text-white italic tracking-tight">Record #{archiveIdx + 7045}</span>
                  </div>
               </div>
               <div className="absolute top-6 right-6 px-3 py-1.5 bg-brand-primary/90 backdrop-blur-md rounded-full shadow-lg border border-white/10 flex items-center gap-2">
                  <Sparkles size={8} className="text-brand-dark" />
                  <span className="text-[7px] font-black text-brand-dark uppercase tracking-widest">HIGH_RES_CORE</span>
               </div>
            </div>

            {/* Subtle branding/footer hint within hero */}
            <div className="pt-4 opacity-10 hidden lg:block">
               <div className="w-12 h-[1px] bg-brand-dark mb-2" />
               <span className="text-[6px] font-black uppercase tracking-[0.8em]">SYSTEM_READY_FOR_INPUT</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

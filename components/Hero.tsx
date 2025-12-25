
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Microscope, Fingerprint, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SectionId } from '../types.ts';
import { analyzeMealImage } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, language, scrollTo } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const galleryItems = [
    { img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1000&q=80", label: "Biological Specimen", sub: "NODE_01_ALPHA" },
    { img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80", label: "Cognitive Substrate", sub: "NODE_02_BETA" },
    { img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=80", label: "Cellular Integrity", sub: "NODE_03_GAMMA" },
    { img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1000&q=80", label: "Kinetic Velocity", sub: "NODE_04_DELTA" }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    const galleryTimer = setInterval(() => setCurrentGalleryIdx((prev) => (prev + 1) % galleryItems.length), 7000);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(galleryTimer);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    
    setStatus('loading');
    setProgress(0);

    // Simulated progress logic for smooth percentage animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 94) {
          clearInterval(progressInterval);
          return 94;
        }
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 250);

    try {
      const result: any = await analyzeMealImage(image, { chronicDiseases: '', dietProgram: '', activityLevel: 'moderate' });
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result) {
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: image });
        incrementScans(result);
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          scrollTo(SectionId.PHASE_03_SYNTHESIS);
        }, 800);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setStatus('error');
      console.error("Scanner Error:", err);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setImage(reader.result as string); 
        setStatus('idle'); 
        setProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light flex items-center overflow-hidden select-none pt-24 pb-12">
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.012] z-0" style={{ backgroundImage: 'radial-gradient(#0A0A0A 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl w-full mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-end">
          
          {/* LEFT: TEXT & ARCHIVE */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-brand-dark/[0.03] rounded-full shadow-sm">
                  <div className={`w-1.5 h-1.5 rounded-full ${status === 'loading' ? 'bg-orange-400 animate-spin' : 'bg-brand-primary animate-pulse'}`} />
                  <span className="text-[7px] font-black uppercase tracking-[0.4em] text-brand-dark/40">
                    {status === 'loading' ? 'ANALYSIS_IN_PROGRESS' : 'SYSTEM_READY_FOR_INPUT'}
                  </span>
               </div>
               
               <div className="text-left">
                 <h1 className="text-6xl md:text-8xl lg:text-[110px] font-serif font-bold text-brand-dark leading-[0.75] tracking-tighter">
                   Metabolic <br /><span className="text-brand-primary italic font-normal">Diagnostic.</span>
                 </h1>
                 <p className="text-brand-dark/30 text-[10px] md:text-[11px] font-bold tracking-tight mt-6 ml-1 max-w-sm">
                    PRECISION INSTRUMENTATION FOR CELLULAR DATA EXTRACTION.
                 </p>
               </div>
            </div>

            <div className="relative group w-full aspect-[16/9] overflow-hidden rounded-[48px] bg-brand-sand/5 border border-brand-dark/[0.04] shadow-sm">
               {galleryItems.map((item, idx) => (
                 <div key={idx} className={`absolute inset-0 transition-all duration-[2400ms] ${currentGalleryIdx === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                   <img src={item.img} className="w-full h-full object-cover saturate-[0.2] contrast-[1.1] opacity-60" alt="Archive" />
                   <div className="absolute bottom-8 left-8 space-y-1">
                      <span className="block text-[6px] font-black text-white/40 uppercase tracking-[0.4em]">{item.sub}</span>
                      <h4 className="text-2xl font-serif font-bold text-white tracking-tight">{item.label}</h4>
                   </div>
                 </div>
               ))}
               <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* RIGHT: THE SCANNER */}
          <div className="flex justify-center lg:justify-end items-end relative">
             <div 
               className="relative w-full max-w-[340px] md:max-w-[420px] transition-all duration-1000 z-20"
               style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
             >
               <div className="absolute -top-12 right-10 flex items-center gap-3 opacity-30">
                  <Fingerprint size={14} className="text-brand-primary" />
                  <span className="text-[7px] font-black uppercase tracking-widest">ENCRYPTED_AUTH_OK</span>
               </div>

               {/* Scanner Body */}
               <div className="relative aspect-[3/4.2] rounded-[72px] border border-brand-dark/[0.08] bg-white overflow-hidden shadow-2xl z-20 transition-all group">
                  
                  {/* Digital Frames */}
                  <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-brand-primary/10 rounded-tl-[72px] pointer-events-none z-30" />
                  <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-brand-primary/10 rounded-br-[72px] pointer-events-none z-30" />

                  {image ? (
                    <div className="absolute inset-0 group">
                      <img src={image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Specimen" />
                      
                      {/* Analysis Overlay (Percentage) */}
                      {status === 'loading' ? (
                        <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                           <div className="relative w-32 h-32 mb-6">
                              <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                  strokeDasharray={364} 
                                  strokeDashoffset={364 - (364 * progress) / 100}
                                  className="text-brand-primary transition-all duration-300 ease-out" 
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-serif font-bold text-white">{progress}%</span>
                              </div>
                           </div>
                           <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.6em] animate-pulse">Processing_Matrix</span>
                        </div>
                      ) : status === 'error' ? (
                        <div className="absolute inset-0 bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white">
                           <AlertCircle size={48} className="mb-4 animate-bounce" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Protocol_Fault</span>
                           <p className="text-[9px] opacity-60 mt-2">Check Connection / Image Size</p>
                        </div>
                      ) : status === 'success' ? (
                        <div className="absolute inset-0 bg-brand-primary/90 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white">
                           <CheckCircle2 size={48} className="mb-4 scale-110" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Analysis_Complete</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-6 z-40">
                           <button 
                             onClick={handleAnalyze} 
                             className="bg-brand-primary text-white p-7 rounded-full shadow-3xl hover:scale-110 transition-transform flex items-center justify-center"
                           >
                              <Microscope size={28} />
                           </button>
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="text-white/60 text-[8px] font-black uppercase tracking-widest hover:text-white transition-colors"
                           >
                             Replace Specimen
                           </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-light transition-colors"
                    >
                      <div className="relative mb-8">
                         <div className="absolute -inset-8 border border-brand-primary/5 rounded-full animate-pulse-slow" />
                         <div className="w-20 h-20 rounded-[34px] bg-brand-light flex items-center justify-center border border-brand-dark/[0.02]">
                          <Plus size={32} strokeWidth={1} className="text-brand-primary" />
                         </div>
                      </div>
                      <div className="text-center space-y-2">
                        <span className="block text-[6px] font-black text-brand-dark/20 uppercase tracking-[0.6em]">SCANNER_STANDBY</span>
                        <span className="block text-[15px] font-bold text-brand-dark/40 uppercase tracking-tight font-serif italic">Insert Specimen</span>
                      </div>
                    </div>
                  )}

                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>

               <div className="absolute -bottom-10 right-12 opacity-10 hidden lg:block">
                  <p className="text-[6px] font-black uppercase tracking-[0.6em]">OPTICAL_SENSOR_V4_CALIBRATED</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

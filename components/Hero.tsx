
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Cpu, Microscope, Terminal, Fingerprint } from 'lucide-react';
import { SectionId } from '../types.ts';
import { analyzeMealImage } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../translations.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, language } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [telemetry, setTelemetry] = useState({ temp: 36.7, load: 15, latency: 4 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const galleryItems = [
    { img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1000&q=80", tag: "BIO", label: "Biological Specimen", sub: "NODE_01_ALPHA" },
    { img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80", tag: "NEURO", label: "Cognitive Substrate", sub: "NODE_02_BETA" },
    { img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=80", tag: "CELL", label: "Cellular Integrity", sub: "NODE_03_GAMMA" },
    { img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1000&q=80", tag: "KINETIC", label: "Kinetic Velocity", sub: "NODE_04_DELTA" }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 8,
        y: (e.clientY / window.innerHeight - 0.5) * 8
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const telemetryInterval = setInterval(() => {
      setTelemetry({
        temp: +(36.5 + Math.random() * 0.4).toFixed(1),
        load: Math.floor(12 + Math.random() * 8),
        latency: Math.floor(3 + Math.random() * 4)
      });
    }, 4000);

    const galleryTimer = setInterval(() => setCurrentGalleryIdx((prev) => (prev + 1) % galleryItems.length), 7000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(telemetryInterval);
      clearInterval(galleryTimer);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    try {
      const result: any = await analyzeMealImage(image, { chronicDiseases: '', dietProgram: '', activityLevel: 'moderate' });
      if (result) {
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: image });
        incrementScans(result);
        setStatus('idle');
      }
    } catch (err: any) { setStatus('error'); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result as string); setStatus('idle'); };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light flex items-center overflow-hidden select-none pt-20">
      
      {/* HUD Background Layer - Added pointer-events-none to fix click issue */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.012] z-0" style={{ backgroundImage: 'radial-gradient(#0A0A0A 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(194,163,107,0.04)_0%,_transparent_80%)] pointer-events-none z-0" />

      <div className="max-w-7xl w-full mx-auto px-6 z-10 py-12">
        
        {/* Balanced Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col space-y-4 lg:space-y-6">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-brand-dark/[0.03] rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[7px] font-black uppercase tracking-[0.4em] text-brand-dark/40">DIAGNOSTIC CORE ACTIVE</span>
               </div>
               
               <div className="text-left">
                 <h1 className="text-6xl md:text-8xl lg:text-[110px] font-serif font-bold text-brand-dark leading-[0.75] tracking-tighter">
                   Metabolic <br /><span className="text-brand-primary italic font-normal">Diagnostic.</span>
                 </h1>
                 <p className="text-brand-dark/30 text-[10px] md:text-[11px] font-bold tracking-tight mt-4 ml-1 max-w-sm">
                    Precision instrumentation for metabolic optimization.
                 </p>
               </div>
            </div>

            <div className="relative group w-full aspect-[16/9] overflow-hidden rounded-[40px] bg-brand-sand/5 border border-brand-dark/[0.04] shadow-sm mt-2">
               <div className="absolute top-6 left-6 flex gap-6 z-20 opacity-30">
                  <div className="flex flex-col">
                     <span className="text-[5px] font-black tracking-widest text-brand-dark uppercase">CORE_T</span>
                     <span className="text-[10px] font-bold text-brand-dark tracking-tight">{telemetry.temp}°C</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[5px] font-black tracking-widest text-brand-dark uppercase">SYS_LOAD</span>
                     <span className="text-[10px] font-bold text-brand-dark tracking-tight">{telemetry.load}%</span>
                  </div>
               </div>

               {galleryItems.map((item, idx) => (
                 <div 
                   key={idx}
                   className={`absolute inset-0 transition-all duration-[2400ms] ease-in-out ${currentGalleryIdx === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
                 >
                   <img src={item.img} className="w-full h-full object-cover saturate-[0.4] contrast-[1.1]" alt="Archive Specimen" />
                   <div className="absolute bottom-8 left-8 space-y-1">
                      <span className="block text-[6px] font-black text-white/40 uppercase tracking-[0.4em]">{item.sub}</span>
                      <h4 className="text-2xl font-serif font-bold text-white tracking-tight">{item.label}</h4>
                   </div>
                 </div>
               ))}
               <div className="absolute bottom-6 right-8 opacity-20">
                  <p className="text-[6px] font-black uppercase tracking-[0.6em] text-white">ARCHIVE_NODE</p>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Scanner (Fixed Interaction) */}
          <div className="flex justify-center lg:justify-end items-center relative">
             <div 
               className="relative w-full max-w-[340px] md:max-w-[420px] transition-all duration-1000 z-20"
               style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
             >
               {/* Floating Auth Badge */}
               <div className="absolute -top-12 right-10 flex items-center gap-3 opacity-30">
                  <Fingerprint size={14} className="text-brand-primary" />
                  <span className="text-[7px] font-black uppercase tracking-widest">ENCRYPTED_AUTH_OK</span>
               </div>

               {/* Scanner Central Module (420x588 approx) */}
               <div 
                 onClick={triggerFileInput}
                 className="relative aspect-[3/4.2] rounded-[72px] border border-brand-dark/[0.08] bg-white overflow-hidden cursor-pointer flex flex-col items-center justify-center transition-all group shadow-sm hover:shadow-2xl z-20"
               >
                  {/* Digital Framing Elements */}
                  <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-brand-primary/10 rounded-tl-[72px] pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-brand-primary/10 rounded-br-[72px] pointer-events-none" />

                  {image ? (
                    <div className="absolute inset-0">
                      <img src={image} className="w-full h-full object-cover" alt="Specimen" />
                      <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-8">
                         <div className="relative">
                            <div className="absolute -inset-10 border border-brand-primary/10 rounded-full animate-ping" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} 
                              className="relative z-30 bg-brand-primary text-white p-7 rounded-full shadow-3xl hover:scale-110 transition-transform"
                            >
                              {status === 'loading' ? <div className="w-6 h-6 border-2 border-white/20 border-t-white animate-spin rounded-full" /> : <Microscope size={28} />}
                            </button>
                         </div>
                         <span className="text-[9px] font-black text-white tracking-[0.6em] animate-pulse uppercase">Execute_Diagnosis</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-10 group-hover:scale-105 transition-transform duration-700">
                      <div className="relative">
                         <div className="absolute -inset-10 border border-brand-primary/5 rounded-full animate-pulse-slow" />
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
                  
                  {/* Dynamic Laser Grid */}
                  <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-brand-primary/40 animate-scan z-40 opacity-40 shadow-[0_0_15px_#C2A36B] pointer-events-none" />
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
               </div>

               {/* Diagnostic Sub-label */}
               <div className="absolute -bottom-10 right-12 opacity-10 hidden lg:block">
                  <p className="text-[6px] font-black uppercase tracking-[0.6em]">INPUT_MODULE_SENSORS_OK</p>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

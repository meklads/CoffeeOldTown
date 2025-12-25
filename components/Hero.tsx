
import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint, Plus, Activity, Cpu, MoveVertical, Microscope, Info, Boxes, Terminal, Shield } from 'lucide-react';
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
  const t = translations[language].hero;

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

    const galleryTimer = setInterval(() => setCurrentGalleryIdx((prev) => (prev + 1) % galleryItems.length), 9000);

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

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light flex items-center justify-center overflow-hidden select-none pt-32 lg:pt-20">
      
      {/* Background Micro-Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(#0A0A0A 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(194,163,107,0.02)_100%)] pointer-events-none" />

      {/* Floating System Log (Desktop Only) */}
      <div className="absolute bottom-10 left-10 hidden xl:flex flex-col gap-2 opacity-10 hover:opacity-100 transition-opacity">
        <span className="text-[6px] font-black uppercase tracking-[0.4em] text-brand-dark/40">KERNEL_READY</span>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 h-full flex flex-col justify-center gap-12 lg:gap-20">
        
        {/* DESKTOP HEADER (Aligned with the screenshot provided) */}
        <div className="hidden lg:block space-y-4">
           <div className="flex items-center gap-6">
              <div className="inline-flex items-center gap-4 px-4 py-1.5 bg-white border border-brand-dark/[0.04] rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-[0.6em] text-brand-dark/40">Diagnostic Axis Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 border border-brand-primary/10 rounded-full">
                 <Terminal size={8} className="text-brand-primary" />
                 <span className="text-[7px] font-bold text-brand-primary uppercase tracking-widest">ENCRYPTED BRIDGE ACTIVE</span>
              </div>
           </div>
           <h1 className="text-6xl md:text-8xl lg:text-[110px] font-serif font-bold text-brand-dark leading-[0.8] tracking-tighter">
             Metabolic <br /><span className="text-brand-primary italic font-normal">Diagnostic.</span>
           </h1>
        </div>

        {/* MAIN INTERFACE GRID */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 w-full gap-16 lg:gap-0 items-start">
          
          {/* SCANNER POD (TOP ON MOBILE) */}
          <div className="order-1 lg:order-3 lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div 
              className="relative w-full max-w-[320px] md:max-w-[340px] lg:max-w-[400px] transition-all duration-700"
              style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
            >
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[3/4.2] rounded-[70px] border border-brand-dark/[0.06] bg-white overflow-hidden cursor-pointer flex flex-col items-center justify-center transition-all group shadow-none"
              >
                {/* Gold Circuit Corners */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-brand-primary/30 rounded-tl-[70px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-brand-primary/30 rounded-tr-[70px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-brand-primary/30 rounded-bl-[70px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-brand-primary/30 rounded-br-[70px] pointer-events-none" />

                {image ? (
                  <div className="absolute inset-0">
                    <img src={image} className="w-full h-full object-cover" alt="Selected" />
                    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-10">
                      <button onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} className="relative bg-brand-primary text-white p-7 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        {status === 'loading' ? <div className="w-8 h-8 border-2 border-white/20 border-t-white animate-spin rounded-full" /> : <Microscope size={30} />}
                      </button>
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.6em]">START_BIOMETRICS</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-12 group-hover:scale-105 transition-transform duration-1000">
                    <div className="relative">
                       <div className="absolute -inset-10 border border-brand-primary/5 rounded-full animate-pulse-slow" />
                       <div className="w-20 h-20 rounded-[36px] bg-brand-light flex items-center justify-center border border-brand-dark/[0.02]">
                        <Plus size={24} strokeWidth={1} className="text-brand-primary" />
                       </div>
                    </div>
                    <div className="text-center space-y-2">
                      <span className="block text-[7px] font-black text-brand-dark/20 uppercase tracking-[0.8em]">SCANNER_IDLE</span>
                      <span className="block text-xs font-bold text-brand-dark/40 uppercase tracking-[0.2em]">Awaiting Specimen</span>
                    </div>
                  </div>
                )}
                
                {/* Laser Scanning Line */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-primary/40 shadow-[0_0_20px_#C2A36B] animate-scan z-40 opacity-40" />
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              
              {/* External Floating Tags */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 w-full justify-center">
                 <div className="flex items-center gap-3 px-4 py-2 bg-brand-dark rounded-2xl border border-white/5 shadow-2xl">
                    <Fingerprint size={10} className="text-brand-primary" />
                    <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">AUTH: OK</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-2 bg-white border border-brand-dark/[0.06] rounded-2xl opacity-60">
                    <Boxes size={10} className="text-brand-dark/30" />
                    <span className="text-[7px] font-black text-brand-dark/30 uppercase tracking-[0.2em]">NODE_{telemetry.latency}MS</span>
                 </div>
              </div>
            </div>
          </div>

          {/* MOBILE HEADER (BETWEEN SCANNER AND ARCHIVE) */}
          <div className="lg:hidden order-2 flex flex-col items-center text-center space-y-4">
             <h1 className="text-5xl font-serif font-bold text-brand-dark leading-[0.9] tracking-tighter">
               Metabolic <br /><span className="text-brand-primary italic font-normal">Diagnostic.</span>
             </h1>
             <p className="text-brand-dark/30 text-[10px] font-black uppercase tracking-[0.5em]">Instrumentation Active</p>
          </div>

          {/* NEURAL AXIS (DESKTOP CONNECTOR) */}
          <div className="order-2 lg:col-span-2 hidden lg:flex flex-col items-center justify-start relative h-full pt-1">
            <div className="w-[1px] h-[380px] bg-gradient-to-b from-brand-dark/[0.08] via-brand-dark/[0.04] to-transparent relative">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-12">
                <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-brand-primary border border-white/5 shadow-2xl">
                  <Cpu size={14} className="animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[5px] font-black text-brand-primary tracking-widest rotate-90 uppercase">STREAMING</span>
                </div>
              </div>
            </div>
          </div>

          {/* ARCHIVE MODULE (BOTTOM ON MOBILE) */}
          <div className="order-3 lg:order-1 lg:col-span-5 flex flex-col items-start space-y-12 w-full">
            <div className="relative group w-full max-w-[440px] mx-auto lg:mx-0">
                {/* Telemetry Header */}
                <div className="flex gap-8 mb-6 opacity-30 group-hover:opacity-100 transition-opacity duration-700 px-2">
                   <div className="flex flex-col">
                      <span className="text-[5px] font-black tracking-widest text-brand-dark uppercase">CORE_T</span>
                      <span className="text-[8px] font-bold text-brand-dark tracking-tight">{telemetry.temp}°C</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[5px] font-black tracking-widest text-brand-dark uppercase">LOAD</span>
                      <span className="text-[8px] font-bold text-brand-dark tracking-tight">{telemetry.load}%</span>
                   </div>
                </div>

                {/* Gallery Container */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-[40px] bg-brand-sand/5 border border-brand-dark/[0.04] shadow-none">
                    {galleryItems.map((item, idx) => (
                      <div 
                        key={idx}
                        className={`absolute inset-0 transition-all duration-[2400ms] ease-in-out ${currentGalleryIdx === idx ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm pointer-events-none'}`}
                      >
                        <img src={item.img} className="w-full h-full object-cover saturate-[0.6] contrast-[1.1] hover:saturate-100 transition-all duration-1000" alt="Specimen" />
                        <div className="absolute bottom-10 left-10 space-y-1.5">
                           <span className="block text-[7px] font-black text-white/40 uppercase tracking-[0.5em]">{item.sub}</span>
                           <h4 className="text-2xl font-serif font-bold text-white tracking-tight">{item.label}</h4>
                        </div>
                      </div>
                    ))}
                    {/* Glass Shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2500ms] pointer-events-none" />
                </div>
                
                <p className="mt-8 text-brand-dark/30 text-[9px] font-black uppercase tracking-[0.6em] leading-relaxed max-w-sm hidden lg:block">
                  Archival data streams verified via neural link.
                </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

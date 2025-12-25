
import React, { useState, useRef, useEffect } from 'react';
import { Zap, Fingerprint, Plus, Activity, Crosshair, Cpu, Share2, Shield } from 'lucide-react';
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
  const [counters, setCounters] = useState({ bio: 98.2, neuro: 442 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language].hero;

  const galleryItems = [
    { img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1000&q=80", label: "PURE BIO" },
    { img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80", label: "NEURAL SYNC" },
    { img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=80", label: "VITAL EDGE" },
    { img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1000&q=80", label: "CORE DATA" }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const interval = setInterval(() => {
      setCounters({
        bio: +(98.2 + Math.random() * 0.5).toFixed(1),
        neuro: Math.floor(440 + Math.random() * 10)
      });
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGalleryIdx((prev) => (prev + 1) % galleryItems.length);
    }, 4500);
    return () => clearInterval(timer);
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
    } catch (err: any) {
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
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-[100vh] bg-brand-light flex items-center overflow-hidden py-24 md:py-0">
      
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-sand/10 skew-x-12 translate-x-1/2" />
        <div className="absolute bottom-0 left-10 vertical-text text-[10px] font-black text-brand-dark/5 tracking-[1em] select-none uppercase">
          L_SYSTEM_v4.2.0_STABLE_LINK
        </div>
        
        {/* Dynamic Data Particles in Gap Area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.03] rotate-45 border border-brand-dark/10" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-0 items-center relative z-10">
        
        {/* Left: Content (5 Columns) */}
        <div 
          className="lg:col-span-5 space-y-12 order-2 lg:order-1"
          style={{ transform: `translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)` }}
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-4 px-5 py-2 bg-white text-brand-primary rounded-full border border-brand-primary/20 shadow-sm">
              <Activity size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">{t.badge}</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark leading-[0.8] tracking-tighter">
                Metabolic <br /> 
                <span className="relative inline-block">
                  <span className="text-brand-primary italic font-normal">Diagnostic.</span>
                  <div className="absolute -right-16 top-0 text-[9px] font-black text-brand-primary/40 uppercase tracking-widest hidden md:block">
                    [SYS_001]
                  </div>
                </span>
              </h1>
              <p className="text-brand-dark/50 text-xl font-medium italic max-w-sm leading-relaxed border-l-2 border-brand-primary/40 pl-8">
                Unlocking human potential through <br /> high-fidelity metabolic decryption.
              </p>
            </div>
          </div>

          {/* The Bio-Pod Scanner */}
          <div className="relative group w-full max-w-[340px]">
            <div className="absolute -inset-1 bg-gradient-to-br from-brand-primary/20 to-transparent rounded-[52px] blur-sm opacity-50" />
            <div className="relative bg-white border border-brand-dark/5 rounded-[48px] p-2 overflow-hidden shadow-2xl transition-all duration-700 group-hover:border-brand-primary/30">
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="relative aspect-[4/4.8] rounded-[40px] border border-dashed border-brand-dark/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-brand-light/40 hover:bg-white"
               >
                  {image ? (
                     <div className="absolute inset-0">
                        <img src={image} className="w-full h-full object-cover" alt="Biometric Subject" />
                        <div className="absolute inset-0 bg-brand-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                           <button onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} className="relative bg-brand-primary text-white p-6 rounded-full shadow-2xl scale-110 active:scale-95 transition-transform">
                              <Zap size={28} />
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center gap-6 group-hover:scale-105 transition-transform duration-700">
                        <div className="p-8 rounded-full border border-brand-dark/5 bg-white shadow-sm">
                           <Plus size={32} strokeWidth={1} className="text-brand-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-dark/30">UPLOAD SPECIMEN</span>
                     </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
            </div>
          </div>
        </div>

        {/* The Data Bridge (1 Column) - FILLING THE GAP */}
        <div className="hidden lg:flex lg:col-span-2 h-full flex-col items-center justify-center relative overflow-hidden">
           {/* Vertical Connector Line */}
           <div className="w-[1px] h-[300px] bg-gradient-to-b from-transparent via-brand-dark/10 to-transparent relative">
              {/* Pulsing Nodes */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full animate-ping" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full animate-ping delay-300" />
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full animate-ping delay-700" />
           </div>
           
           {/* Technical Widgets in Gap */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-12 w-full flex flex-col items-center">
              <div className="text-center group cursor-crosshair">
                 <div className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mb-1">BIO_SYNC</div>
                 <div className="text-xl font-serif font-bold text-brand-dark">{counters.bio}%</div>
              </div>
              
              <div className="p-3 bg-brand-dark text-brand-primary rounded-full shadow-xl animate-spin-slow">
                 <Cpu size={14} />
              </div>

              <div className="text-center">
                 <div className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mb-1">NEURAL_HZ</div>
                 <div className="text-xl font-serif font-bold text-brand-dark">{counters.neuro}</div>
              </div>
           </div>
           
           {/* Horizontal Pulse Lines */}
           <div className="absolute inset-0 flex flex-col justify-around py-20 pointer-events-none opacity-20">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-pulse" />
              <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-pulse delay-500" />
           </div>
        </div>

        {/* Right: Immersive Lens (5 Columns) */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end perspective-1000">
           <div 
             className="relative w-full max-w-[480px] aspect-square flex items-center justify-center"
             style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px) rotateY(${mousePos.x * 0.1}deg) rotateX(${mousePos.y * -0.1}deg)` }}
           >
              {/* The Master Lens */}
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_80px_150px_-40px_rgba(194,163,107,0.4)] bg-brand-dark border-[10px] border-white ring-1 ring-brand-dark/5 group">
                 {galleryItems.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`absolute inset-0 transition-all duration-[2500ms] ease-in-out ${currentGalleryIdx === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                    >
                      <img src={item.img} className="w-full h-full object-cover saturate-[0.8]" alt="Specimen" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark/60 via-brand-dark/20 to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center">
                         <div className={`transition-all duration-1000 transform ${currentGalleryIdx === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                           <h3 className="text-5xl md:text-6xl font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl">
                             {item.label}
                           </h3>
                         </div>
                      </div>
                    </div>
                 ))}
                 
                 {/* Glass Highlight */}
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-20" />
                 
                 {/* Scanning Line */}
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-primary/40 shadow-[0_0_20px_#C2A36B] animate-scan z-30 opacity-50" />
              </div>
              
              {/* Floating Meta Status */}
              <div className="absolute -bottom-8 right-0 bg-brand-dark text-white px-8 py-5 rounded-[30px] shadow-3xl flex items-center gap-6 z-40 border border-white/10">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest">PRECISION</span>
                    <span className="text-2xl font-serif font-bold italic tracking-tighter">99.82%</span>
                 </div>
                 <div className="w-10 h-10 rounded-full border border-brand-primary/20 flex items-center justify-center">
                    <Fingerprint size={20} className="text-brand-primary" />
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;

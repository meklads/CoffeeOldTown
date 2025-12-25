
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
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-[100vh] bg-brand-light flex flex-col items-center overflow-hidden pt-40 pb-20 md:pt-48">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-sand/5 skew-x-12 translate-x-1/2" />
        <div className="absolute bottom-10 left-10 vertical-text text-[10px] font-black text-brand-dark/5 tracking-[1em] select-none uppercase">
          L_SYSTEM_CENTRAL_CORE
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        
        {/* Step 1: Centered Grand Header */}
        <div className="text-center mb-24 space-y-6" style={{ transform: `translateY(${mousePos.y * -0.1}px)` }}>
           <div className="inline-flex items-center gap-4 px-5 py-2 bg-white text-brand-primary rounded-full border border-brand-primary/10 shadow-sm mx-auto">
              <Activity size={12} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.6em]">{t.badge}</span>
           </div>
           
           <h1 className="text-6xl md:text-[110px] font-serif font-bold text-brand-dark leading-[0.8] tracking-tighter">
             Metabolic <span className="text-brand-primary italic font-normal">Diagnostic.</span>
           </h1>
           
           <p className="text-brand-dark/40 text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
             Unlocking human potential through high-fidelity metabolic decryption.
           </p>
        </div>

        {/* Step 2: Symmetrical Interaction Grid */}
        <div className="grid lg:grid-cols-11 gap-0 items-center">
          
          {/* Left: Scanner Pod (4 Columns) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
             <div className="relative group w-full max-w-[340px]">
                <div className="relative bg-white border border-brand-dark/10 rounded-[48px] p-2 overflow-hidden transition-all duration-700 group-hover:border-brand-primary/40">
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="relative aspect-[4/4.8] rounded-[40px] border border-dashed border-brand-dark/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-brand-light/20 hover:bg-white"
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
                            <div className="p-8 rounded-full border border-brand-dark/5 bg-white">
                               <Plus size={32} strokeWidth={1} className="text-brand-primary" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-brand-dark/20">UPLOAD SPECIMEN</span>
                         </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                   </div>
                </div>
             </div>
          </div>

          {/* Center: The Neural Data Bridge (3 Columns) */}
          <div className="lg:col-span-3 h-full flex flex-col items-center justify-center relative py-12 lg:py-0">
             {/* Main Vertical Axis */}
             <div className="w-[1px] h-[350px] bg-gradient-to-b from-transparent via-brand-dark/10 to-transparent relative">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping delay-300" />
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping delay-700" />
             </div>
             
             {/* Central Floating Modules */}
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-16">
                <div className="bg-white border border-brand-dark/5 px-6 py-4 rounded-3xl shadow-sm text-center backdrop-blur-md">
                   <div className="text-[8px] font-black text-brand-primary uppercase tracking-widest mb-1">BIO_SYNC</div>
                   <div className="text-2xl font-serif font-bold text-brand-dark">{counters.bio}%</div>
                </div>
                
                <div className="w-12 h-12 bg-brand-dark text-brand-primary rounded-full flex items-center justify-center shadow-xl animate-spin-slow border border-white/10">
                   <Cpu size={18} />
                </div>

                <div className="bg-white border border-brand-dark/5 px-6 py-4 rounded-3xl shadow-sm text-center backdrop-blur-md">
                   <div className="text-[8px] font-black text-brand-primary uppercase tracking-widest mb-1">NEURAL_HZ</div>
                   <div className="text-2xl font-serif font-bold text-brand-dark">{counters.neuro}</div>
                </div>
             </div>
             
             {/* Horizontal Flow Lines */}
             <div className="absolute inset-0 flex flex-col justify-around py-32 pointer-events-none opacity-20">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-pulse" />
                <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-pulse delay-500" />
             </div>
          </div>

          {/* Right: The High-Fidelity Lens (4 Columns) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
             <div 
               className="relative w-full max-w-[420px] aspect-square flex items-center justify-center perspective-1000"
               style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
             >
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-4xl bg-brand-dark border-[12px] border-white ring-1 ring-brand-dark/5 group">
                   {galleryItems.map((item, idx) => (
                      <div 
                        key={idx}
                        className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${currentGalleryIdx === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                      >
                        <img src={item.img} className="w-full h-full object-cover saturate-[0.7]" alt="Specimen" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark/70 via-brand-dark/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                           <div className={`transition-all duration-1000 transform ${currentGalleryIdx === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                             <h3 className="text-4xl md:text-5xl font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl">
                               {item.label}
                             </h3>
                           </div>
                        </div>
                      </div>
                   ))}
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-20" />
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-primary/40 shadow-[0_0_20px_#C2A36B] animate-scan z-30 opacity-40" />
                </div>
                
                {/* Micro-Status Badge */}
                <div className="absolute -bottom-6 right-0 bg-brand-dark text-white px-6 py-4 rounded-[24px] shadow-3xl flex items-center gap-4 z-40 border border-white/10">
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-brand-primary uppercase tracking-widest">PRECISION</span>
                      <span className="text-xl font-serif font-bold italic">99.82%</span>
                   </div>
                   <Fingerprint size={16} className="text-brand-primary" />
                </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;

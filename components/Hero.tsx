
import React, { useState, useRef, useEffect } from 'react';
import { Zap, Fingerprint, Plus, Activity, Cpu, MoveVertical, Target, Microscope } from 'lucide-react';
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
  const [pulseData, setPulseData] = useState(98.6);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language].hero;

  const galleryItems = [
    { img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1000&q=80", tag: "BIO", label: "Substrate", sub: "PHASE_01" },
    { img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80", tag: "NEURO", label: "Cognition", sub: "PHASE_02" },
    { img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=80", tag: "CELL", label: "Integrity", sub: "PHASE_03" },
    { img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1000&q=80", tag: "KINETIC", label: "Velocity", sub: "PHASE_04" }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 4,
        y: (e.clientY / window.innerHeight - 0.5) * 4
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    const interval = setInterval(() => setPulseData(+(98.4 + Math.random() * 0.4).toFixed(1)), 2500);
    const galleryTimer = setInterval(() => setCurrentGalleryIdx((prev) => (prev + 1) % galleryItems.length), 6000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
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
    <section id={SectionId.PHASE_01_SCAN} className="relative h-screen bg-brand-light flex items-center justify-center overflow-hidden pt-20 lg:pt-24">
      
      {/* Background Micro-Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.012]" style={{ backgroundImage: 'radial-gradient(#0A0A0A 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl w-full mx-auto px-6 h-full flex items-center">
        <div className="flex flex-col lg:grid lg:grid-cols-12 w-full gap-8 lg:gap-0 items-center">
          
          {/* LEFT COLUMN: TITLE & FADED GALLERY */}
          <div className="order-1 lg:col-span-5 flex flex-col items-start space-y-10 w-full">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-brand-dark/5 rounded-full shadow-sm">
                <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-[0.5em] text-brand-dark/40">NODE_01_SYNTHESIS</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-[76px] font-serif font-bold text-brand-dark leading-[0.85] tracking-tighter">
                Metabolic <br /><span className="text-brand-primary italic font-normal">Diagnostic.</span>
              </h1>
              <p className="text-brand-dark/30 text-[9px] font-black uppercase tracking-[0.4em] border-l border-brand-primary/20 pl-6 max-w-[280px] leading-relaxed">
                Precision decryption of biological integrity.
              </p>
            </div>

            {/* Gallery moved here - Smaller and Atmospheric */}
            <div className="relative w-full max-w-[360px] aspect-[16/10] overflow-hidden group">
               <div className="absolute inset-0" style={{ maskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)', WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)' }}>
                  {galleryItems.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`absolute inset-0 transition-all duration-[2400ms] ${currentGalleryIdx === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                    >
                      <img src={item.img} className="w-full h-full object-cover saturate-[0.6] opacity-40 group-hover:opacity-60 transition-all duration-[3s]" alt="Specimen" />
                      
                      {/* Typographic Depth */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <span className={`text-[60px] font-black text-brand-primary/10 uppercase tracking-tighter transition-all duration-[4000ms] ${currentGalleryIdx === idx ? 'translate-x-0' : '-translate-x-8'}`}>
                          {item.tag}
                        </span>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-px bg-brand-primary/40" />
                           <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.6em]">{item.label}</span>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* CENTER COLUMN: THE NEURAL BRIDGE */}
          <div className="order-2 lg:col-span-2 flex flex-col items-center justify-center relative h-full">
            <div className="w-px h-[60px] lg:h-[320px] bg-gradient-to-b from-transparent via-brand-primary/20 to-transparent relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-12">
                <div className="bg-white px-2 py-0.5 rounded-full border border-brand-dark/5 shadow-sm">
                  <span className="text-[6px] font-black text-brand-primary tracking-widest uppercase">{pulseData}%</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center text-brand-primary shadow-2xl">
                  <Cpu size={12} className="animate-pulse" />
                </div>
                <Target size={12} className="text-brand-primary/20 animate-spin-slow" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SCANNER POD (Primary CTA) */}
          <div className="order-3 lg:col-span-5 flex justify-end w-full">
            <div 
              className="relative w-full max-w-[320px] lg:max-w-[360px] p-1.5 transition-all duration-700"
              style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
            >
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[3/4.2] rounded-[60px] border border-brand-dark/5 bg-white overflow-hidden cursor-pointer flex flex-col items-center justify-center transition-all hover:shadow-4xl hover:border-brand-primary/20 shadow-xl group"
              >
                {image ? (
                  <div className="absolute inset-0">
                    <img src={image} className="w-full h-full object-cover" alt="Specimen" />
                    <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-6">
                      <div className="relative">
                        <div className="absolute -inset-4 border border-brand-primary/20 rounded-full animate-ping" />
                        <button onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} className="relative bg-brand-primary text-white p-5 rounded-full shadow-2xl transform transition-all active:scale-90">
                          {status === 'loading' ? <div className="w-6 h-6 border-2 border-white/20 border-t-white animate-spin rounded-full" /> : <Microscope size={22} />}
                        </button>
                      </div>
                      <div className="text-center space-y-1">
                        <span className="block text-[8px] font-black text-white uppercase tracking-[0.5em]">INITIALIZE ANALYSIS</span>
                        <span className="block text-[6px] font-black text-brand-primary uppercase tracking-[0.8em]">NODE SECURED</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8 group-hover:scale-110 transition-transform duration-700">
                    <div className="relative">
                       <div className="absolute -inset-6 border border-brand-primary/5 rounded-full animate-pulse-slow" />
                       <div className="w-20 h-20 rounded-[32px] bg-brand-light flex items-center justify-center shadow-lg border border-brand-dark/[0.03]">
                        <Plus size={24} strokeWidth={1} className="text-brand-primary" />
                       </div>
                    </div>
                    <div className="text-center space-y-2">
                      <span className="block text-[7px] font-black text-brand-dark/20 uppercase tracking-[0.6em]">SPECIMEN INPUT</span>
                      <span className="block text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">DRAG & DROP DATA</span>
                    </div>
                  </div>
                )}
                
                {/* Visual Glass Reflection */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                
                {/* Biometric Laser */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-primary/40 shadow-[0_0_20px_#C2A36B] animate-scan z-40 opacity-40" />
                
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              
              {/* External Metadata Tag */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-max">
                 <div className="flex items-center gap-3 px-4 py-2 bg-brand-dark rounded-xl shadow-2xl">
                    <Fingerprint size={12} className="text-brand-primary" />
                    <span className="text-[7px] font-black text-white/60 uppercase tracking-[0.4em]">ENCRYPTED PORTAL ACTIVE</span>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

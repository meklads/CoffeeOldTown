
import React, { useState, useRef, useEffect } from 'react';
import { Zap, RefreshCw, AlertCircle, Fingerprint, Plus, Key } from 'lucide-react';
import { SectionId } from '../types.ts';
import { analyzeMealImage } from '../services/geminiService.ts';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../translations.ts';

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, lastAnalysisResult, language } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language].hero;

  const galleryImages = [
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1200&q=80"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGalleryIdx((prev) => (prev + 1) % galleryImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: any;
    if (status === 'loading') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => (p >= 98 ? p : p + (p < 85 ? 12 : 1)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 512; 
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;
    setStatus('loading');
    try {
      const compressedImage = await compressImage(image);
      const result: any = await analyzeMealImage(compressedImage, { chronicDiseases: '', dietProgram: '', activityLevel: 'moderate' });
      if (result) {
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: compressedImage });
        incrementScans(result);
        setStatus('idle');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('CONNECTION ERROR');
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
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light flex items-center overflow-hidden py-32 md:py-0">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        
        {/* Left: Text & Scanner Input */}
        <div className="space-y-12 order-2 lg:order-1">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-sand/50 text-brand-primary rounded-full border border-brand-primary/10">
              <Fingerprint size={14} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">{t.badge}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif font-bold text-brand-dark leading-[0.9] tracking-tighter">
              Metabolic <br /> <span className="text-brand-primary italic font-normal">Diagnostic.</span>
            </h1>
            <p className="text-brand-dark/40 text-xl font-medium italic max-w-lg leading-relaxed border-l-2 border-brand-primary/20 pl-8">
              Engineer your vitality through precision bio-imaging. Decrypt metabolic signatures in real-time.
            </p>
          </div>

          <div className="w-full max-w-md bg-white border border-brand-dark/5 rounded-[40px] p-2 shadow-2xl overflow-hidden group">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="relative aspect-video rounded-[32px] border border-dashed border-brand-dark/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group-hover:border-brand-primary/40"
             >
                {image ? (
                   <div className="absolute inset-0">
                      <img src={image} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-brand-dark/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} className="bg-brand-primary text-white p-4 rounded-full shadow-2xl">
                            <Zap size={24} className="animate-pulse" />
                         </button>
                      </div>
                   </div>
                ) : (
                   <div className="flex flex-col items-center gap-4 opacity-30 group-hover:opacity-60 transition-all">
                      <Plus size={32} strokeWidth={1} />
                      <span className="text-[9px] font-black uppercase tracking-[0.5em]">{language === 'ar' ? 'رفع الإشارة الحيوية' : 'UPLOAD BIOMETRIC'}</span>
                   </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
             </div>
             {image && status === 'idle' && (
               <div className="p-4">
                  <button onClick={handleAnalyze} className="w-full py-5 bg-brand-dark text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.5em] hover:bg-brand-primary transition-all">
                    {language === 'ar' ? 'بدء التحليل' : 'INITIALIZE SCAN'}
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* Right: Engineered Frame Gallery */}
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end h-full">
           <div className="relative w-full max-w-[540px] aspect-[4/5] bg-brand-sand/20 rounded-[56px] p-6 border border-brand-dark/5 shadow-inner">
              <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl">
                 {galleryImages.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${currentGalleryIdx === idx ? 'opacity-100' : 'opacity-0'}`}
                      alt="Gallery"
                    />
                 ))}
                 <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
                 
                 {/* Precision Indicators */}
                 <div className="absolute bottom-10 left-10 flex gap-2">
                    {galleryImages.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-700 ${currentGalleryIdx === i ? 'w-10 bg-brand-primary' : 'w-2 bg-white/30'}`} />
                    ))}
                 </div>
              </div>
              
              {/* Luxury Badge floating on frame */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center p-4 border border-brand-dark/5">
                 <div className="w-full h-full rounded-full border-2 border-dashed border-brand-primary/20 flex items-center justify-center text-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-brand-dark/40 leading-tight">PRECISION <br /> GRADE</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;

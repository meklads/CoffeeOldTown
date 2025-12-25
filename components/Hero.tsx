
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Microscope, Fingerprint, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { GoogleGenAI } from "@google/genai";

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, scrollTo } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;

    setStatus('loading');
    setProgress(0);
    setErrorMessage('');

    // Start Smooth Progress Simulation
    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => (prev >= 92 ? 92 : prev + Math.floor(Math.random() * 4) + 1));
    }, 250);

    try {
      // Use the injected API_KEY directly without forcing the 'Paid Key' dialog
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY_NOT_CONFIGURED");

      const ai = new GoogleGenAI({ apiKey });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: "Analyze this meal. Provide: ingredients (array of {name, calories}), totalCalories (number), healthScore (number 0-100), macros ({protein, carbs, fat}), summary (string), and personalizedAdvice (string). Return ONLY JSON." }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);

      const result = JSON.parse(response.text || '{}');
      
      if (result && result.totalCalories) {
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: image });
        incrementScans(result);
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          scrollTo(SectionId.PHASE_03_SYNTHESIS);
        }, 1200);
      } else {
        throw new Error("MALFORMED_RESPONSE");
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setStatus('error');
      console.error("Scanner Error:", err);
      
      // Handle specific "Paid Key" or Tier errors gracefully
      if (err.message?.includes("403") || err.message?.includes("permission")) {
        setErrorMessage("Access Denied: This model may require a different API tier.");
      } else if (err.message?.includes("404")) {
        setErrorMessage("Model Unavailable: System is updating protocols.");
      } else {
        setErrorMessage(err.message || "Diagnostic connection failure.");
      }
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
    <section id={SectionId.PHASE_01_SCAN} className="relative min-h-screen bg-brand-light flex items-center overflow-hidden pt-24 pb-12">
      <div className="absolute inset-0 pointer-events-none opacity-[0.012] z-0" style={{ backgroundImage: 'radial-gradient(#0A0A0A 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl w-full mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-end">
          
          <div className="flex flex-col space-y-8 animate-fade-in">
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
               <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1000&q=80" className="w-full h-full object-cover saturate-[0.2] contrast-[1.1] opacity-60" alt="Archive" />
               <div className="absolute bottom-8 left-8 space-y-1">
                  <span className="block text-[6px] font-black text-white/40 uppercase tracking-[0.4em]">NODE_ARCHIVE_BETA</span>
                  <h4 className="text-2xl font-serif font-bold text-white tracking-tight">System Records</h4>
               </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end items-end relative">
             <div 
               className="relative w-full max-w-[340px] md:max-w-[420px] transition-all duration-1000 z-20"
               style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
             >
               <div className="absolute -top-12 right-10 flex items-center gap-3 opacity-30">
                  <Fingerprint size={14} className="text-brand-primary" />
                  <span className="text-[7px] font-black uppercase tracking-widest">SECURE_SYNC_OK</span>
               </div>

               <div className="relative aspect-[3/4.2] rounded-[72px] border border-brand-dark/[0.08] bg-white overflow-hidden shadow-2xl z-20 group">
                  
                  {image ? (
                    <div className="absolute inset-0">
                      <img src={image} className="w-full h-full object-cover" alt="Specimen" />
                      
                      {status === 'loading' ? (
                        <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
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
                           <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.6em] animate-pulse">Extracting_Data</span>
                        </div>
                      ) : status === 'error' ? (
                        <div className="absolute inset-0 bg-red-950/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 text-white p-8 text-center animate-fade-in">
                           <AlertCircle size={48} className="mb-4 text-red-500" />
                           <span className="text-[12px] font-black uppercase tracking-widest mb-2 text-red-400">Analysis Failed</span>
                           <p className="text-[10px] opacity-70 leading-relaxed mb-8">{errorMessage}</p>
                           <button 
                             onClick={() => setStatus('idle')}
                             className="flex items-center gap-2 px-8 py-3 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                           >
                             <RefreshCw size={12} /> Retry Scanner
                           </button>
                        </div>
                      ) : status === 'success' ? (
                        <div className="absolute inset-0 bg-brand-primary/95 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white animate-fade-in">
                           <CheckCircle2 size={56} className="mb-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">SUCCESS_READY</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-6 z-40">
                           <button 
                             onClick={handleAnalyze} 
                             className="bg-brand-primary text-white p-8 rounded-full shadow-3xl hover:scale-110 active:scale-95 transition-all"
                           >
                              <Microscope size={32} />
                           </button>
                           <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Run_Diagnostic</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-sand/5 transition-all"
                    >
                      <div className="relative mb-8">
                         <div className="absolute -inset-10 border border-brand-primary/5 rounded-full animate-pulse-slow" />
                         <div className="w-20 h-20 rounded-[34px] bg-brand-light flex items-center justify-center border border-brand-dark/[0.02]">
                          <Plus size={32} strokeWidth={1} className="text-brand-primary" />
                         </div>
                      </div>
                      <div className="text-center space-y-2">
                        <span className="block text-[15px] font-bold text-brand-dark/40 uppercase tracking-tight font-serif italic">Insert Specimen</span>
                        <span className="block text-[6px] font-black text-brand-dark/20 uppercase tracking-[0.6em]">AWAITING_INPUT</span>
                      </div>
                    </div>
                  )}

                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>

               <div className="absolute -bottom-10 right-12 opacity-10">
                  <p className="text-[6px] font-black uppercase tracking-[0.6em]">BIO_OPTIC_V4_STABLE</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

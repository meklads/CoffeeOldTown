
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Microscope, Fingerprint, AlertCircle, CheckCircle2, RefreshCw, X, Flame, Activity, Zap, ShieldAlert, Link as LinkIcon } from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { GoogleGenAI } from "@google/genai";

// Fix: Resolved TypeScript errors regarding the 'aistudio' property on the global window object.
// The errors "All declarations must have identical modifiers" and "Subsequent property declarations must have the same type" 
// are addressed by using the expected 'AIStudio' type name and applying the 'readonly' modifier common in host environments.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    readonly aistudio: AIStudio;
  }
}

const Hero: React.FC = () => {
  const { incrementScans, setLastAnalysisResult, scrollTo, lastAnalysisResult } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success' | 'key_missing'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showResultCard, setShowResultCard] = useState(false);
  
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

  // Fix: Implemented key selection flow according to Google GenAI guidelines.
  // We assume the key selection was successful after triggering openSelectKey() due to potential race conditions.
  const handleEstablishLink = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume the key selection was successful after triggering openSelectKey() and proceed to the app.
      setStatus('idle');
      if (image) handleAnalyze();
    } catch (err) {
      console.error("Key Selection Error:", err);
    }
  };

  const handleAnalyze = async () => {
    if (!image || status === 'loading') return;

    // Fix: Using window.aistudio.hasSelectedApiKey() to verify key presence before initiating analysis.
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey && !process.env.API_KEY) {
      setStatus('key_missing');
      return;
    }

    setStatus('loading');
    setProgress(0);
    setErrorMessage('');
    setShowResultCard(false);

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => (prev >= 95 ? 95 : prev + Math.floor(Math.random() * 3) + 1));
    }, 150);

    try {
      // Fix: Always create a new GoogleGenAI instance right before making an API call to ensure 
      // the most up-to-date API key (e.g., from the selection dialog) is used.
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY_NOT_FOUND");
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const mimeType = image.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: "Analyze this meal strictly. Return ONLY a JSON object: {ingredients: [{name, calories}], totalCalories: number, healthScore: number, macros: {protein, carbs, fat}, summary: string, personalizedAdvice: string}. Accurate data only." }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);

      // Fix: Accessing .text property directly (not calling as a function) per latest SDK rules.
      const result = JSON.parse(response.text || '{}');
      
      if (result && result.totalCalories) {
        setLastAnalysisResult({ ...result, timestamp: new Date().toLocaleString(), imageUrl: image });
        incrementScans(result);
        setStatus('success');
        setTimeout(() => setShowResultCard(true), 800);
      } else {
        throw new Error("MALFORMED_DATA_RECEPTION");
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      console.error("Scanner Fault:", err);

      // Fix: If the request fails with "Requested entity was not found.", 
      // reset key state and prompt user to select a key again via openSelectKey().
      if (err.message?.includes("not found") || err.message?.includes("key") || err.message?.includes("API_KEY_NOT_FOUND")) {
        setStatus('key_missing');
      } else {
        setStatus('error');
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
        setShowResultCard(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setStatus('idle');
    setProgress(0);
    setShowResultCard(false);
    setErrorMessage('');
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

            {showResultCard && lastAnalysisResult && (
              <div className="bg-white rounded-[40px] border border-brand-primary/20 p-10 shadow-3xl animate-fade-in-up relative overflow-hidden group/card">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
                <button onClick={() => setShowResultCard(false)} className="absolute top-6 right-6 text-brand-dark/20 hover:text-brand-dark transition-colors">
                  <X size={20} />
                </button>
                
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.5em]">Current_Sample</span>
                      <h3 className="text-3xl font-serif font-bold text-brand-dark">{lastAnalysisResult.summary}</h3>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-brand-dark/30 uppercase tracking-widest block mb-1">HEALTH_SCORE</span>
                       <span className="text-4xl font-serif font-bold text-brand-primary">{lastAnalysisResult.healthScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-1 text-center">
                        <Flame size={12} className="mx-auto text-brand-primary mb-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest block text-brand-dark/40">Calories</span>
                        <p className="text-xl font-serif font-bold">{lastAnalysisResult.totalCalories}</p>
                     </div>
                     <div className="space-y-1 text-center">
                        <Activity size={12} className="mx-auto text-brand-primary mb-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest block text-brand-dark/40">Protein</span>
                        <p className="text-xl font-serif font-bold">{lastAnalysisResult.macros.protein}g</p>
                     </div>
                     <div className="space-y-1 text-center">
                        <Zap size={12} className="mx-auto text-brand-primary mb-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest block text-brand-dark/40">Carbs</span>
                        <p className="text-xl font-serif font-bold">{lastAnalysisResult.macros.carbs}g</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => scrollTo(SectionId.PHASE_03_SYNTHESIS)}
                    className="w-full py-5 bg-brand-dark text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-brand-primary transition-all"
                  >
                    SYNC PROTOCOL <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            )}

            {!showResultCard && (
              <div className="relative group w-full aspect-[16/9] overflow-hidden rounded-[48px] bg-brand-sand/5 border border-brand-dark/[0.04] shadow-sm">
                <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1000&q=80" className="w-full h-full object-cover saturate-[0.2] contrast-[1.1] opacity-60" alt="Archive" />
                <div className="absolute bottom-8 left-8 space-y-1">
                    <span className="block text-[6px] font-black text-white/40 uppercase tracking-[0.4em]">NODE_ARCHIVE_BETA</span>
                    <h4 className="text-2xl font-serif font-bold text-white tracking-tight">System Records</h4>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center lg:justify-end items-end relative">
             <div 
               className="relative w-full max-w-[340px] md:max-w-[420px] transition-all duration-1000 z-20"
               style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
             >
               <div className="absolute -top-12 right-10 flex items-center gap-3 opacity-30">
                  <Fingerprint size={14} className="text-brand-primary" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-brand-dark">SECURE_SYNC_OK</span>
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
                      ) : status === 'key_missing' ? (
                        <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 text-white p-10 text-center animate-fade-in">
                           <ShieldAlert size={48} className="mb-6 text-brand-primary" />
                           <span className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 text-brand-primary">Security Bridge Required</span>
                           <p className="text-[10px] opacity-60 leading-relaxed mb-10">To initialize the diagnostic scanner, you must establish a secure link with your System API Key. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline ml-1">Learn more about billing.</a></p>
                           <button 
                             onClick={handleEstablishLink}
                             className="flex items-center justify-center gap-3 w-full py-5 bg-brand-primary text-brand-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-glow"
                           >
                             <LinkIcon size={14} /> Establish System Link
                           </button>
                           <button onClick={resetScanner} className="mt-6 text-[8px] opacity-30 uppercase tracking-widest hover:opacity-100">Cancel Diagnostic</button>
                        </div>
                      ) : status === 'error' ? (
                        <div className="absolute inset-0 bg-red-950/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 text-white p-8 text-center animate-fade-in">
                           <AlertCircle size={48} className="mb-4 text-red-500" />
                           <span className="text-[12px] font-black uppercase tracking-widest mb-2 text-red-400">Analysis Failed</span>
                           <p className="text-[10px] opacity-70 leading-relaxed mb-8">{errorMessage}</p>
                           <div className="flex flex-col w-full gap-3">
                              <button onClick={handleAnalyze} className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all">
                                <RefreshCw size={12} /> Force Retry
                              </button>
                              <button onClick={resetScanner} className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Clear Specimen</button>
                           </div>
                        </div>
                      ) : status === 'success' ? (
                        <div className="absolute inset-0 bg-brand-primary/95 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white animate-fade-in">
                           <CheckCircle2 size={56} className="mb-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">DIAGNOSTIC_COMPLETE</span>
                           <button onClick={() => setShowResultCard(true)} className="mt-6 text-[9px] font-black uppercase tracking-widest border-b border-white/20 pb-1">Review Ledger</button>
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
                  <p className="text-[6px] font-black uppercase tracking-[0.6em]">BIO_OPTIC_V5_SECURE</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

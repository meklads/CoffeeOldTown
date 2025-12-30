
import React, { useRef, useState } from 'react';
import { 
  History as HistoryIcon, 
  Download, 
  Trash, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ArrowUpRight,
  Database,
  Layers,
  Fingerprint,
  Cpu,
  ShieldCheck,
  AlertCircle,
  Activity,
  Maximize2,
  FileJson,
  FlaskConical,
  Beaker
} from 'lucide-react';
import { SectionId, MealAnalysisResult } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

const MealScanner: React.FC = () => {
  const { history, clearHistory, language, setView, scrollTo } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Filter and limit history for the dashboard view
  const validHistory = history
    .filter(item => item.imageUrl && item.imageUrl.startsWith('data:image'))
    .slice(0, 15);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollToPos = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({ left: scrollToPos, behavior: 'smooth' });
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `metabolic_archive_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const isAr = language === 'ar';

  return (
    <section id={SectionId.PHASE_04_ARCHIVE} className="py-32 md:py-48 bg-brand-light dark:bg-[#0A0A0A] transition-colors duration-1000 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-primary/[0.02] rounded-full blur-[160px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Cinematic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-10">
           <div className="space-y-8 max-w-2xl">
              <div className="flex flex-wrap gap-4">
                 <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-brand-primary/20 shadow-2xl backdrop-blur-xl">
                    <Database size={16} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">{isAr ? 'سجل البيانات الأيضية' : 'METABOLIC DATA LEDGER'}</span>
                 </div>
                 {history.length > 0 && (
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                      <ShieldCheck size={12} />
                      {history.length} {isAr ? 'عينة مسجلة' : 'SAMPLES RECORDED'}
                   </div>
                 )}
              </div>
              <div className="space-y-4">
                 <h2 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-[0.8] tracking-tighter">
                    Specimen <br /> <span className="text-brand-primary italic font-normal">{isAr ? 'الأرشيف.' : 'Archive.'}</span>
                 </h2>
                 <p className="text-brand-dark/40 dark:text-white/20 text-lg font-medium italic max-w-lg border-l-2 border-brand-primary/30 pl-8">
                    {isAr ? 'تاريخ من التحليلات الجزيئية المخزنة في "خزنة البيانات" الآمنة.' : 'A chronicle of molecular analyses stored within your secure biometric data vault.'}
                 </p>
              </div>
           </div>

           {/* Precision Controls */}
           <div className="flex flex-col items-end gap-6 w-full md:w-auto">
              <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-[30px] border border-brand-dark/5 dark:border-white/10 shadow-3xl">
                 <button 
                  onClick={exportData} 
                  disabled={history.length === 0} 
                  className="p-5 text-brand-dark/40 dark:text-white/40 hover:text-brand-primary hover:bg-brand-primary/10 rounded-2xl transition-all relative group/btn"
                 >
                   <FileJson size={22} />
                   <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[8px] font-black px-3 py-1.5 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest">EXPORT LEDGER</span>
                 </button>
                 <div className="w-px h-10 bg-brand-dark/5 dark:border-white/5" />
                 <button 
                  onClick={clearHistory} 
                  disabled={history.length === 0} 
                  className="p-5 text-brand-dark/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all relative group/btn"
                 >
                   <Trash size={22} />
                   <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[8px] font-black px-3 py-1.5 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest">PURGE DATA</span>
                 </button>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => scroll('left')} className="p-6 bg-white dark:bg-white/5 hover:bg-brand-primary/10 border border-brand-dark/5 dark:border-white/10 rounded-[28px] transition-all text-brand-dark dark:text-white shadow-xl group/nav">
                    <ChevronLeft size={24} className="group-hover/nav:-translate-x-1 transition-transform" />
                 </button>
                 <button onClick={() => scroll('right')} className="p-6 bg-white dark:bg-white/5 hover:bg-brand-primary/10 border border-brand-dark/5 dark:border-white/10 rounded-[28px] transition-all text-brand-dark dark:text-white shadow-xl group/nav">
                    <ChevronRight size={24} className="group-hover/nav:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>

        {/* Specimen Ledger Stream */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-10 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-20 pt-4 px-2"
        >
          {validHistory.length > 0 ? (
            <>
              {validHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 w-[380px] snap-center"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                   <div className="bg-white dark:bg-[#0F0F0F] border border-brand-dark/[0.04] dark:border-white/5 rounded-[70px] p-10 hover:border-brand-primary/40 transition-all duration-1000 relative overflow-hidden h-full flex flex-col group/card shadow-2xl hover:shadow-glow">
                      
                      {/* Biometric Header */}
                      <div className="flex justify-between items-center mb-10">
                         <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse shadow-glow" />
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] font-mono">NODE_{idx + 101}</span>
                         </div>
                         <div className="flex items-center gap-2 opacity-30">
                            <Fingerprint size={14} className="text-brand-dark dark:text-white" />
                            <span className="text-[8px] font-black uppercase tracking-widest font-mono">METABOLIC_S_ID</span>
                         </div>
                      </div>

                      {/* Specimen Visual Capture */}
                      <div className="relative aspect-[4/5] rounded-[50px] overflow-hidden mb-10 bg-zinc-100 dark:bg-zinc-900 border border-brand-dark/5 dark:border-white/5 shadow-inner">
                         <img 
                          src={item.imageUrl} 
                          className="w-full h-full object-cover grayscale-[0.4] group-hover/card:grayscale-0 transition-all duration-[2.5s] group-hover/card:scale-110" 
                          alt="Specimen Image" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                         
                         {/* Dynamic HUD Overlay */}
                         <div className="absolute inset-x-8 bottom-8 flex justify-between items-end opacity-0 group-hover/card:opacity-100 transition-all duration-700 translate-y-4 group-hover/card:translate-y-0">
                            <div className="bg-brand-primary text-brand-dark px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl">
                               {item.healthScore}/100 VITALITY
                            </div>
                            <button className="w-14 h-14 bg-white text-brand-dark rounded-2xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all shadow-3xl">
                               <Maximize2 size={20} />
                            </button>
                         </div>
                      </div>

                      {/* Scientific Data Panel */}
                      <div className="space-y-8 flex-grow">
                         <div className="space-y-3">
                            <h4 className="text-3xl font-serif font-bold text-brand-dark dark:text-white leading-tight italic truncate">
                              {item.summary}
                            </h4>
                            <div className="flex items-center gap-4 text-[9px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-[0.3em]">
                               <Clock size={14} className="text-brand-primary" />
                               {item.timestamp?.split(',')[0]}
                               <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/30" />
                               {item.timestamp?.split(',')[1]}
                            </div>
                         </div>
                         
                         {/* Macro Distribution visualization */}
                         <div className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-dark/5 dark:border-white/5">
                            {[
                               { l: 'P', v: item.macros.protein, c: 'bg-orange-500' },
                               { l: 'C', v: item.macros.carbs, c: 'bg-blue-500' },
                               { l: 'F', v: item.macros.fat, c: 'bg-emerald-500' }
                            ].map((m, i) => (
                               <div key={i} className="space-y-3">
                                  <div className="flex justify-between items-center text-[9px] font-black opacity-30">
                                     <span>{m.l}</span>
                                     <span>{m.v}g</span>
                                  </div>
                                  <div className="h-1 w-full bg-brand-dark/5 dark:bg-white/5 rounded-full overflow-hidden">
                                     <div className={`h-full ${m.c} transition-all duration-1000 delay-300`} style={{ width: `${Math.min(100, m.v * 1.5)}%` }} />
                                  </div>
                               </div>
                            ))}
                         </div>

                         <div className="flex items-center justify-between pt-6 border-t border-brand-dark/5 dark:border-white/5">
                            <div className="space-y-1">
                               <span className="text-[8px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-[0.5em]">CALORIC MASS</span>
                               <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-serif font-bold text-brand-primary leading-none">{item.totalCalories}</span>
                                  <span className="text-[11px] font-bold text-brand-primary/40 tracking-tighter uppercase">KCAL</span>
                               </div>
                            </div>
                            <button className="group/btn2 relative px-8 py-5 border border-brand-dark/10 dark:border-white/10 rounded-2xl overflow-hidden transition-all hover:border-brand-primary/40">
                               <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover/btn2:translate-y-0 transition-transform duration-500" />
                               <span className="relative z-10 text-[9px] font-black text-brand-dark dark:text-white group-hover/btn2:text-brand-dark uppercase tracking-widest">{isAr ? 'التفاصيل' : 'DOSSIER'}</span>
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
              
              {/* Expansion Portal Card */}
              {history.length > 15 && (
                <div className="flex-shrink-0 w-[380px] snap-center h-full">
                  <div 
                    onClick={() => { setView('vaults'); window.scrollTo(0,0); }}
                    className="h-full bg-brand-primary/[0.03] border-2 border-dashed border-brand-primary/20 rounded-[70px] flex flex-col items-center justify-center p-16 text-center group cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary transition-all duration-1000 min-h-[650px] backdrop-blur-3xl"
                  >
                    <div className="w-28 h-28 bg-brand-dark dark:bg-zinc-900 border border-brand-primary/20 rounded-[40px] flex items-center justify-center text-brand-primary mb-10 shadow-4xl group-hover:scale-110 transition-all duration-700 rotate-6 group-hover:rotate-0">
                       <Layers size={42} />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-4xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter">
                         {isAr ? 'الأرشيف المركزي' : 'The Vault Access.'}
                       </h4>
                       <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] leading-relaxed max-w-[200px] mx-auto opacity-60">
                         {isAr ? `تصفح كامل السجل المكون من ${history.length} عينة جزيئية` : `BROWSE ENTIRE CHRONICLE OF ${history.length} MOLECULAR SAMPLES`}
                       </p>
                    </div>
                    <div className="mt-16 flex items-center gap-5 text-brand-dark dark:text-white font-black text-[11px] uppercase tracking-[0.5em] border-b border-brand-dark/10 dark:border-white/10 pb-3 group-hover:border-brand-primary group-hover:text-brand-primary transition-all">
                       {isAr ? 'دخول الخزانة' : 'ENTER CENTRAL VAULT'} <ArrowUpRight size={20} />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Immersive Laboratory Empty State */
            <div className="w-full min-h-[600px] flex flex-col items-center justify-center relative bg-brand-dark/[0.02] dark:bg-zinc-900/[0.1] rounded-[100px] border border-dashed border-brand-dark/10 dark:border-white/10 p-20 animate-fade-in group/empty shadow-inner">
               
               {/* Standby Pulse Visualization */}
               <div className="relative mb-16 scale-110">
                  <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-[100px] animate-pulse-slow scale-150" />
                  <div className="relative w-40 h-40 bg-white dark:bg-zinc-950 rounded-[50px] flex items-center justify-center shadow-4xl border border-brand-primary/20 overflow-hidden">
                     <div className="absolute inset-0 bg-scan-line opacity-[0.05] animate-scan" />
                     <FlaskConical size={64} className="text-brand-primary/30 animate-pulse" />
                     <div className="absolute -inset-8 border border-brand-primary/10 rounded-full animate-[spin_20s_linear_infinite]" />
                     <div className="absolute -inset-16 border-2 border-dashed border-brand-primary/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                  </div>
               </div>

               <div className="max-w-xl text-center space-y-10">
                  <div className="space-y-4">
                     <h4 className="text-5xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none">
                       Registry <span className="text-brand-primary italic font-normal">Standby.</span>
                     </h4>
                     <p className="text-xl text-brand-dark/40 dark:text-white/30 font-medium italic leading-relaxed max-w-md mx-auto">
                       {isAr ? 'بانتظار عينتك الأيضية الأولى لبدء السجل السريري وتفعيل بروتوكولات الأرشفة الجزيئية.' : 'Awaiting your first metabolic specimen to initialize the clinical registry and activate molecular archival protocols.'}
                     </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-8">
                     <button 
                      onClick={() => scrollTo(SectionId.PHASE_01_SCAN)}
                      className="px-16 py-7 bg-brand-dark text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.5em] hover:bg-brand-primary transition-all shadow-glow flex items-center gap-5 group/init"
                     >
                        <Beaker size={22} className="group-hover/init:rotate-12 transition-transform" /> {isAr ? 'بدء التحليل' : 'INITIALIZE ANALYSIS'}
                     </button>
                     <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                           <ShieldCheck size={14} className="text-brand-primary" />
                           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-dark/30 dark:text-white/20">BIO-SECURE NODES ACTIVE</span>
                        </div>
                        <div className="w-40 h-1 bg-brand-dark/5 dark:bg-white/5 rounded-full overflow-hidden">
                           <div className="w-1/3 h-full bg-brand-primary animate-[move_3s_linear_infinite]" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Keyframe additions for the new visuals */}
      <style>{`
        @keyframes move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default MealScanner;

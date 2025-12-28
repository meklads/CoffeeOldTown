
import React, { useRef } from 'react';
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
  Activity
} from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

const MealScanner: React.FC = () => {
  const { history, clearHistory, language, setView, scrollTo } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Take the most recent 12 active specimens
  const validHistory = history
    .filter(item => item.imageUrl && item.imageUrl.startsWith('data:image'))
    .slice(0, 12);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollToPos = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollContainerRef.current.scrollTo({ left: scrollToPos, behavior: 'smooth' });
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "metabolic_archive.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const isAr = language === 'ar';

  return (
    <section id={SectionId.PHASE_04_ARCHIVE} className="py-32 bg-brand-light dark:bg-[#0A0A0A] transition-colors duration-1000 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-brand-primary/20 shadow-xl backdrop-blur-md">
                 <Database size={14} className="animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'سجل البيانات الأيضية' : 'METABOLIC DATA LEDGER'}</span>
              </div>
              <div className="space-y-2">
                 <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark dark:text-white leading-none tracking-tighter">
                    Clinical <span className="text-brand-primary italic font-normal">{isAr ? 'السجل.' : 'Registry.'}</span>
                 </h2>
                 <p className="text-brand-dark/40 dark:text-white/20 text-sm font-medium italic">
                    {isAr ? 'أرشيف العينات التي تم تحليلها ومعايرتها حيوياً.' : 'The archive of analyzed and bio-calibrated specimens.'}
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex flex-1 md:flex-none bg-white dark:bg-brand-dark border border-brand-dark/5 dark:border-white/5 p-1.5 rounded-[24px] shadow-sm backdrop-blur-3xl">
                 <button 
                  onClick={exportData} 
                  title="Export Data" 
                  disabled={history.length === 0} 
                  className="flex-1 md:flex-none p-4 text-brand-dark/40 dark:text-white/40 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                 >
                   <Download size={20} />
                 </button>
                 <div className="w-px h-8 bg-brand-dark/5 dark:bg-white/5 self-center mx-1" />
                 <button 
                  onClick={clearHistory} 
                  title="Purge Records" 
                  disabled={history.length === 0} 
                  className="flex-1 md:flex-none p-4 text-brand-dark/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                 >
                   <Trash size={20} />
                 </button>
              </div>
              <div className="hidden md:flex gap-2">
                 <button onClick={() => scroll('left')} className="p-5 bg-white dark:bg-white/5 hover:bg-brand-primary/10 border border-brand-dark/5 dark:border-white/5 rounded-[24px] transition-all text-brand-dark dark:text-white">
                    <ChevronLeft size={20} />
                 </button>
                 <button onClick={() => scroll('right')} className="p-5 bg-white dark:bg-white/5 hover:bg-brand-primary/10 border border-brand-dark/5 dark:border-white/5 rounded-[24px] transition-all text-brand-dark dark:text-white">
                    <ChevronRight size={20} />
                 </button>
              </div>
           </div>
        </div>

        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 pt-4"
        >
          {validHistory.length > 0 ? (
            <>
              {validHistory.map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-[340px] snap-center group">
                   <div className="bg-white dark:bg-zinc-900/40 border border-brand-dark/[0.04] dark:border-white/5 rounded-[60px] p-8 hover:border-brand-primary/40 transition-all duration-1000 hover:shadow-glow relative overflow-hidden h-full flex flex-col group/card">
                      
                      {/* Specimen ID & Status */}
                      <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                            <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.3em]">SPECIMEN_{idx + 1}</span>
                         </div>
                         <span className="text-[7px] font-black text-brand-dark/20 dark:text-white/20 uppercase tracking-widest font-mono">NODE_ACTIVE</span>
                      </div>

                      {/* Image Preview */}
                      <div className="relative aspect-square rounded-[45px] overflow-hidden mb-8 bg-zinc-100 dark:bg-zinc-800 border border-brand-dark/5 dark:border-white/5">
                         <img 
                          src={item.imageUrl} 
                          className="w-full h-full object-cover grayscale-[0.3] group-hover/card:grayscale-0 transition-all duration-[2.5s] group-hover/card:scale-110" 
                          alt="Metabolic Sample" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                         
                         {/* Holographic Stats Overlay */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-700 pointer-events-none">
                            <div className="bg-brand-dark/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-brand-primary/20 flex flex-col items-center gap-1 scale-90 group-hover/card:scale-100 transition-transform">
                               <Fingerprint size={24} className="text-brand-primary mb-1" />
                               <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">VERIFIED BY GEMINI</span>
                            </div>
                         </div>
                      </div>

                      {/* Meta Data */}
                      <div className="space-y-6 flex-grow">
                         <div className="space-y-2">
                            <h4 className="text-2xl font-serif font-bold text-brand-dark dark:text-white leading-tight italic truncate">
                              {item.summary}
                            </h4>
                            <div className="flex items-center gap-3 text-[8px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-widest">
                               <Clock size={12} className="text-brand-primary" />
                               {item.timestamp?.split(',')[0]}
                            </div>
                         </div>
                         
                         <div className="flex items-center justify-between pt-6 border-t border-brand-dark/5 dark:border-white/10">
                            <div className="space-y-1">
                               <span className="text-[7px] font-black text-brand-dark/40 dark:text-white/20 uppercase tracking-[0.2em]">METABOLIC LOAD</span>
                               <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-serif font-bold text-brand-primary">{item.totalCalories}</span>
                                  <span className="text-[10px] font-bold text-brand-primary/40">KCAL</span>
                               </div>
                            </div>
                            <button className="w-14 h-14 bg-brand-dark text-white rounded-2xl flex items-center justify-center hover:bg-brand-primary transition-all duration-500 shadow-xl group-hover/card:rotate-12">
                               <ArrowUpRight size={22} />
                            </button>
                         </div>
                      </div>

                      {/* Micro Bar Chart */}
                      <div className="mt-6 flex gap-1 h-1 w-full bg-brand-dark/5 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500/50" style={{ width: `${item.macros.protein}%` }} />
                         <div className="h-full bg-orange-500/50" style={{ width: `${item.macros.carbs}%` }} />
                         <div className="h-full bg-emerald-500/50" style={{ width: `${item.macros.fat}%` }} />
                      </div>
                   </div>
                </div>
              ))}
              
              {/* "View More" CTA Card */}
              {history.length > 12 && (
                <div className="flex-shrink-0 w-[340px] snap-center h-full">
                  <div 
                    onClick={() => { setView('vaults'); window.scrollTo(0,0); }}
                    className="h-full bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 rounded-[60px] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:bg-brand-primary/10 hover:border-brand-primary transition-all duration-1000 min-h-[500px]"
                  >
                    <div className="w-24 h-24 bg-brand-primary rounded-[35px] flex items-center justify-center text-white mb-8 shadow-glow group-hover:scale-110 transition-all duration-700 rotate-3 group-hover:rotate-0">
                       <Layers size={36} />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-3xl font-serif font-bold text-brand-dark dark:text-white">
                         {isAr ? 'الأرشيف المركزي' : 'The Vault.'}
                       </h4>
                       <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] leading-relaxed">
                         {isAr ? `تصفح كامل السجل المكون من ${history.length} عينة` : `BROWSE ENTIRE ARCHIVE OF ${history.length} SPECIMENS`}
                       </p>
                    </div>
                    <div className="mt-12 flex items-center gap-4 text-brand-dark dark:text-white font-black text-[9px] uppercase tracking-[0.6em] border-b border-brand-dark/10 dark:border-white/10 pb-2 group-hover:border-brand-primary group-hover:text-brand-primary transition-all">
                       {isAr ? 'عرض الكل' : 'VIEW ALL RECORDS'} <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Immersive Empty State */
            <div className="w-full min-h-[450px] flex flex-col items-center justify-center relative bg-brand-dark/[0.02] dark:bg-white/[0.02] rounded-[80px] border border-dashed border-brand-dark/10 dark:border-white/10 p-20 animate-fade-in group/empty">
               
               {/* Standby Pulse Visualization */}
               <div className="relative mb-12">
                  <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-3xl animate-pulse-slow scale-150" />
                  <div className="relative w-32 h-32 bg-white dark:bg-zinc-900 rounded-[40px] flex items-center justify-center shadow-4xl border border-brand-primary/10">
                     <Cpu size={56} className="text-brand-primary/40 animate-pulse" />
                     <div className="absolute -inset-4 border border-brand-primary/5 rounded-[45px] animate-spin-slow" />
                  </div>
               </div>

               <div className="max-w-md text-center space-y-8">
                  <div className="space-y-3">
                     <h4 className="text-4xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter">
                       Registry <span className="text-brand-primary italic">Offline.</span>
                     </h4>
                     <p className="text-lg text-brand-dark/40 dark:text-white/30 font-medium italic leading-relaxed">
                       {isAr ? 'بانتظار عينتك الأيضية الأولى لبدء السجل السريري وتفعيل وحدة المعالجة.' : 'Awaiting your first metabolic sample to initialize the clinical registry and activate processing nodes.'}
                     </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6">
                     <button 
                      onClick={() => scrollTo(SectionId.PHASE_01_SCAN)}
                      className="px-12 py-6 bg-brand-dark text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-brand-primary transition-all shadow-glow flex items-center gap-4"
                     >
                        {isAr ? 'بدء المسح الضوئي' : 'INITIALIZE SCAN'} <Activity size={18} />
                     </button>
                     <div className="flex items-center gap-3">
                        <ShieldCheck size={12} className="text-brand-primary/40" />
                        <span className="text-[9px] font-black uppercase tracking-[0.6em] text-brand-dark/20 dark:text-white/10">SYSTEM STATUS: STANDBY_ACTIVE</span>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MealScanner;

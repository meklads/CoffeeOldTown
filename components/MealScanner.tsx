
import React, { useRef } from 'react';
import { 
  History, 
  Cloud, 
  Download, 
  Trash, 
  Activity, 
  Fingerprint, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Maximize2
} from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

export default function MealScanner() {
  const { history, clearHistory, isCloudConnected, scrollTo, language } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    downloadAnchorNode.setAttribute("download", "metabolic_archive_sync.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.healthScore, 0) / history.length) 
    : 0;

  return (
    <section id={SectionId.PHASE_04_ARCHIVE} className="py-32 bg-brand-light dark:bg-brand-dark transition-colors duration-1000 relative overflow-hidden border-t border-brand-dark/5 dark:border-white/5">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #C2A36B 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-10">
           <div className="space-y-6 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-dark dark:bg-brand-primary/10 text-brand-primary rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-lg">
                  <History size={12} />
                  <span>{language === 'ar' ? 'أرشيف التطور الأيضي' : 'METABOLIC EVOLUTION ARCHIVE'}</span>
                </div>
                {isCloudConnected && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/5 text-brand-primary rounded-full text-[8px] font-bold tracking-widest border border-brand-primary/10">
                    <Cloud size={10} className="animate-pulse" />
                    <span>SYNC ACTIVE</span>
                  </div>
                )}
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark dark:text-white leading-none tracking-tighter">
                Diagnostic <span className="text-brand-primary italic">Timeline.</span>
              </h2>
           </div>

           <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-6 text-right">
                 <span className="text-[8px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-[0.3em]">AVERAGE VITALITY</span>
                 <span className="text-3xl font-serif font-bold text-brand-primary">{avgScore}%</span>
              </div>
              <button 
                onClick={exportData}
                disabled={history.length === 0}
                className="p-4 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-2xl hover:bg-brand-primary hover:text-white transition-all disabled:opacity-20"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={clearHistory}
                disabled={history.length === 0}
                className="p-4 text-red-500/30 hover:text-red-500 transition-all disabled:opacity-20"
              >
                <Trash size={20} />
              </button>
           </div>
        </div>

        {/* Horizontal Experience Slider */}
        <div className="relative group">
          {history.length > 0 ? (
            <>
              {/* Custom Navigation Arrows */}
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-30 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => scroll('left')} className="p-5 bg-white dark:bg-brand-dark rounded-full shadow-2xl text-brand-primary hover:scale-110 transition-transform border border-brand-dark/5 dark:border-white/5">
                  <ChevronLeft size={24} />
                </button>
              </div>
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-30 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => scroll('right')} className="p-5 bg-white dark:bg-brand-dark rounded-full shadow-2xl text-brand-primary hover:scale-110 transition-transform border border-brand-dark/5 dark:border-white/5">
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Slider Container */}
              <div 
                ref={scrollContainerRef}
                className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 pt-4 px-4 -mx-4"
              >
                {history.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 w-[300px] md:w-[400px] snap-center snap-always group/card"
                  >
                    <div className="bg-white dark:bg-zinc-900/50 rounded-[48px] overflow-hidden border border-brand-dark/5 dark:border-white/5 transition-all duration-700 hover:shadow-[0_50px_80px_-20px_rgba(194,163,107,0.15)] hover:-translate-y-2 relative">
                      
                      {/* Health Score Float */}
                      <div className="absolute top-6 right-6 z-20">
                        <div className="w-14 h-14 rounded-2xl bg-brand-dark/90 backdrop-blur-xl border border-brand-primary/30 flex flex-col items-center justify-center text-brand-primary shadow-2xl group-hover/card:scale-110 transition-transform">
                          <span className="text-[7px] font-black opacity-40">SCORE</span>
                          <span className="text-xl font-serif font-bold">{item.healthScore}</span>
                        </div>
                      </div>

                      {/* Image Template */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            className="w-full h-full object-cover grayscale-[0.3] group-hover/card:grayscale-0 group-hover/card:scale-110 transition-all duration-[2s]" 
                            alt="Scan" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-10">
                            <Activity size={60} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity" />
                        
                        {/* Overlay Detail Label */}
                        <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
                          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] opacity-50">
                            <Clock size={10} />
                            <span>{item.timestamp?.split(',')[0]}</span>
                          </div>
                          <h4 className="text-2xl font-serif font-bold leading-none truncate pr-4">
                            {item.summary}
                          </h4>
                        </div>
                      </div>

                      {/* Bio-Metrics Footer */}
                      <div className="p-8 space-y-6">
                        <div className="grid grid-cols-3 gap-4 pb-6 border-b border-brand-dark/5 dark:border-white/5">
                           <div className="text-center">
                              <span className="text-[7px] font-black text-brand-dark/20 dark:text-white/20 uppercase block mb-1">PRO</span>
                              <p className="text-xs font-bold dark:text-white">{item.macros?.protein}g</p>
                           </div>
                           <div className="text-center border-x border-brand-dark/5 dark:border-white/5">
                              <span className="text-[7px] font-black text-brand-dark/20 dark:text-white/20 uppercase block mb-1">CARB</span>
                              <p className="text-xs font-bold dark:text-white">{item.macros?.carbs}g</p>
                           </div>
                           <div className="text-center">
                              <span className="text-[7px] font-black text-brand-dark/20 dark:text-white/20 uppercase block mb-1">FAT</span>
                              <p className="text-xs font-bold dark:text-white">{item.macros?.fat}g</p>
                           </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest">CALORIES</span>
                              <span className="text-2xl font-serif font-bold text-brand-dark dark:text-white leading-none mt-1">{item.totalCalories}</span>
                           </div>
                           <button className="p-3 rounded-full bg-brand-primary/10 text-brand-primary opacity-0 group-hover/card:opacity-100 transition-opacity translate-x-4 group-hover/card:translate-x-0">
                              <ArrowUpRight size={18} />
                           </button>
                        </div>

                        {/* Hover Tip (Personalized Advice Peek) */}
                        <div className="absolute inset-x-0 bottom-0 bg-brand-primary p-6 translate-y-full group-hover/card:translate-y-0 transition-transform duration-500 z-10">
                           <p className="text-white text-[10px] font-medium italic leading-relaxed">
                             "{item.personalizedAdvice}"
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Cinematic Empty State */
            <div className="w-full bg-zinc-50 dark:bg-zinc-900/30 rounded-[64px] border-2 border-dashed border-brand-dark/5 dark:border-white/5 p-20 flex flex-col items-center justify-center text-center space-y-10 group/empty">
               <div className="relative">
                  <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-2xl group-hover/empty:scale-150 transition-transform duration-1000" />
                  <div className="relative w-24 h-24 bg-white dark:bg-brand-dark rounded-full flex items-center justify-center text-brand-dark/10 dark:text-white/10 shadow-xl border border-brand-dark/5 dark:border-white/5">
                     <Fingerprint size={48} className="group-hover/empty:text-brand-primary/40 transition-colors duration-1000" />
                  </div>
               </div>
               <div className="space-y-4 max-w-sm">
                  <h4 className="text-2xl font-serif font-bold text-brand-dark dark:text-white tracking-tight">Timeline Inactive.</h4>
                  <p className="text-xs text-brand-dark/40 dark:text-white/30 font-medium italic">
                    {language === 'ar' ? 'بانتظار الإرسال الأول لبصمتك الأيضية لتفعيل الأرشيف.' : 'Awaiting the first transmission of your metabolic footprint to activate the archive.'}
                  </p>
               </div>
               <button 
                onClick={() => scrollTo(SectionId.PHASE_01_SCAN)}
                className="px-10 py-5 bg-brand-dark dark:bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
               >
                 {language === 'ar' ? 'بدء أول تشخيص' : 'START FIRST DIAGNOSTIC'}
               </button>
            </div>
          )}
        </div>
        
        {/* Footer Meta */}
        {history.length > 0 && (
          <div className="mt-12 flex justify-center items-center gap-6 opacity-20 text-brand-dark dark:text-white">
            <div className="h-px w-12 bg-current" />
            <span className="text-[8px] font-black uppercase tracking-[1em]">{language === 'ar' ? 'نهاية السجل' : 'END OF RECORD'}</span>
            <div className="h-px w-12 bg-current" />
          </div>
        )}
      </div>
    </section>
  );
}

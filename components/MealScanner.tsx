
import React, { useRef } from 'react';
import { 
  History as HistoryIcon, 
  Download, 
  Trash, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ArrowUpRight,
  Image as ImageIcon,
  Database,
  Layers
} from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

export default function MealScanner() {
  const { history, clearHistory, language, setView } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // نأخذ آخر 12 عينة فقط للعرض السريع في الصفحة الرئيسية (The Active Deck)
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
    <section className="py-32 bg-brand-light dark:bg-[#080808] transition-colors duration-1000 relative overflow-hidden">
      {/* Subtle Background Info */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-brand-primary/5 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-brand-dark dark:bg-brand-primary/10 rounded-2xl text-brand-primary shadow-xl border border-brand-primary/20">
                 <Layers size={24} />
              </div>
              <div className="space-y-1 text-left">
                 <h2 className="text-3xl font-serif font-bold text-brand-dark dark:text-white leading-none">
                    Diagnostic <span className="text-brand-primary italic">Ledger.</span>
                 </h2>
                 <p className="text-[10px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-[0.4em]">
                    {isAr ? 'آخر 12 عينة نشطة في المختبر' : 'RECENT 12 ACTIVE SPECIMENS'}
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex bg-white dark:bg-brand-dark border border-brand-dark/5 dark:border-white/5 p-1.5 rounded-2xl shadow-sm">
                 <button onClick={exportData} title="Export Data" disabled={history.length === 0} className="p-3 text-brand-dark/40 dark:text-white/40 hover:text-brand-primary transition-colors"><Download size={20} /></button>
                 <button onClick={clearHistory} title="Purge Records" disabled={history.length === 0} className="p-3 text-brand-dark/40 dark:text-white/40 hover:text-red-500 transition-colors"><Trash size={20} /></button>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => scroll('left')} className="p-4 bg-white dark:bg-white/5 hover:bg-brand-primary/10 border border-brand-dark/5 dark:border-white/5 rounded-2xl transition-all"><ChevronLeft size={20} /></button>
                 <button onClick={() => scroll('right')} className="p-4 bg-white dark:bg-white/5 hover:bg-brand-primary/10 border border-brand-dark/5 dark:border-white/5 rounded-2xl transition-all"><ChevronRight size={20} /></button>
              </div>
           </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-10"
        >
          {validHistory.length > 0 ? (
            <>
              {validHistory.map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-[320px] snap-center group">
                   <div className="bg-white dark:bg-zinc-900/40 border border-brand-dark/[0.04] dark:border-white/5 rounded-[50px] p-6 hover:border-brand-primary/40 transition-all duration-700 hover:shadow-glow relative overflow-hidden h-full flex flex-col">
                      
                      <div className="relative aspect-square rounded-[40px] overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-800">
                         <img src={item.imageUrl} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-110" alt="Specimen" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         
                         <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest bg-brand-primary px-3 py-1 rounded-full">
                               BIO_DATA_SYNCED
                            </span>
                         </div>
                      </div>

                      <div className="space-y-4 flex-grow">
                         <div className="flex justify-between items-center text-[8px] font-black text-brand-dark/20 dark:text-white/20 uppercase tracking-[0.3em]">
                            <span className="flex items-center gap-2"><Clock size={12} /> {item.timestamp?.split(',')[0]}</span>
                            <span className="text-brand-primary">ID: {idx + 1}</span>
                         </div>
                         <h4 className="text-2xl font-serif font-bold text-brand-dark dark:text-white leading-tight line-clamp-2 italic">{item.summary}</h4>
                         
                         <div className="flex justify-between items-center pt-6 mt-auto border-t border-brand-dark/5 dark:border-white/5">
                            <div className="flex flex-col">
                               <span className="text-[7px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-widest">ENERGY</span>
                               <span className="text-xl font-serif font-bold text-brand-primary">{item.totalCalories} <span className="text-[10px] opacity-40">KCAL</span></span>
                            </div>
                            <button className="w-12 h-12 bg-brand-dark text-white rounded-2xl flex items-center justify-center hover:bg-brand-primary transition-all group-hover:rotate-12">
                               <ArrowUpRight size={20} />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
              
              {/* بطاقة "عرض المزيد" في نهاية القائمة */}
              {history.length > 12 && (
                <div className="flex-shrink-0 w-[320px] snap-center">
                  <div 
                    onClick={() => { setView('vaults'); window.scrollTo(0,0); }}
                    className="h-full bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 rounded-[50px] flex flex-col items-center justify-center p-10 text-center group cursor-pointer hover:bg-brand-primary/10 transition-all duration-700"
                  >
                    <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-white mb-6 shadow-glow group-hover:scale-110 transition-transform">
                       <Database size={32} />
                    </div>
                    <h4 className="text-2xl font-serif font-bold text-brand-dark dark:text-white mb-2">
                      {isAr ? 'الأرشيف الكامل' : 'Full Archive'}
                    </h4>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-8 opacity-60">
                      {isAr ? `استعراض جميع العينات (${history.length})` : `EXPLORE ALL ${history.length} SPECIMENS`}
                    </p>
                    <div className="flex items-center gap-2 text-brand-dark/40 dark:text-white/40 font-black text-[9px] uppercase tracking-[0.4em]">
                       {isAr ? 'دخول الأرشيف' : 'ACCESS RECORDS'} <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-brand-dark/10 dark:border-white/10 rounded-[60px] space-y-6 bg-white/5">
               <div className="relative">
                  <ImageIcon size={48} className="text-brand-dark/10 dark:text-white/10" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-brand-primary/20 rounded-full animate-ping" />
               </div>
               <div className="space-y-2 text-center">
                  <p className="text-lg font-serif italic text-brand-dark/30 dark:text-white/30">
                    {isAr ? 'بانتظار عينتك الأيضية الأولى لبدء السجل.' : 'Awaiting your first metabolic sample to start the ledger.'}
                  </p>
                  <span className="text-[8px] font-black uppercase tracking-[0.5em] text-brand-primary/30">STATUS: STANDBY</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

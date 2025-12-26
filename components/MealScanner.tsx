
import React, { useRef } from 'react';
import { 
  History as HistoryIcon, 
  Download, 
  Trash, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ArrowUpRight,
  Fingerprint,
  Image as ImageIcon
} from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

export default function MealScanner() {
  const { history, clearHistory, language } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const validHistory = history.filter(item => item.imageUrl && item.imageUrl.startsWith('data:image'));

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

  return (
    <section className="py-24 bg-brand-light dark:bg-[#080808] transition-colors duration-1000">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-brand-dark dark:bg-brand-primary/10 rounded-2xl text-brand-primary shadow-xl">
                 <HistoryIcon size={24} />
              </div>
              <div className="space-y-1 text-left">
                 <h2 className="text-3xl font-serif font-bold text-brand-dark dark:text-white leading-none">Diagnostic <span className="text-brand-primary italic">Ledger.</span></h2>
                 <p className="text-[10px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-[0.4em]">Chronological Metabolic Archive</p>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex bg-white dark:bg-brand-dark border border-brand-dark/5 dark:border-white/5 p-1.5 rounded-2xl">
                 <button onClick={exportData} disabled={validHistory.length === 0} className="p-3 text-brand-dark/40 dark:text-white/40 hover:text-brand-primary transition-colors"><Download size={20} /></button>
                 <button onClick={clearHistory} disabled={validHistory.length === 0} className="p-3 text-brand-dark/40 dark:text-white/40 hover:text-red-500 transition-colors"><Trash size={20} /></button>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => scroll('left')} className="p-4 hover:bg-brand-primary/10 border border-brand-dark/5 dark:border-white/5 rounded-2xl transition-all"><ChevronLeft size={20} /></button>
                 <button onClick={() => scroll('right')} className="p-4 hover:bg-brand-primary/10 border border-brand-dark/5 dark:border-white/5 rounded-2xl transition-all"><ChevronRight size={20} /></button>
              </div>
           </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
        >
          {validHistory.length > 0 ? (
            validHistory.map((item, idx) => (
              <div key={idx} className="flex-shrink-0 w-[280px] snap-center">
                 <div className="group bg-white dark:bg-zinc-900/40 border border-brand-dark/5 dark:border-white/5 rounded-[45px] p-6 hover:border-brand-primary/30 transition-all duration-700 hover:shadow-4xl relative overflow-hidden">
                    <div className="absolute top-8 left-8 z-20 flex items-center gap-2 bg-brand-primary text-white px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">
                       Validated
                    </div>
                    <div className="aspect-square rounded-[35px] overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-800 relative">
                       <img src={item.imageUrl} className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-[1.5s]" alt="Meal Specimen" />
                       <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary shadow-glow animate-scan" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-[8px] font-black text-brand-dark/20 dark:text-white/20 uppercase tracking-widest">
                          <Clock size={12} /> {item.timestamp?.split(',')[0]}
                       </div>
                       <h4 className="text-xl font-serif font-bold text-brand-dark dark:text-white truncate leading-tight">{item.summary}</h4>
                       <div className="flex justify-between items-center pt-4 border-t border-brand-dark/5 dark:border-white/5">
                          <span className="text-sm font-serif font-bold text-brand-primary tracking-tight">{item.totalCalories} KCAL</span>
                          <button className="w-8 h-8 bg-brand-light dark:bg-brand-dark rounded-lg flex items-center justify-center text-brand-dark/20 dark:text-white/20 hover:text-brand-primary transition-all"><ArrowUpRight size={16} /></button>
                       </div>
                    </div>
                 </div>
              </div>
            ))
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-brand-dark/10 dark:border-white/10 rounded-[60px] space-y-6">
               <ImageIcon size={32} className="text-brand-dark/10 dark:text-white/10" />
               <p className="text-sm font-serif italic text-brand-dark/20 dark:text-white/20">Awaiting your first metabolic sample.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

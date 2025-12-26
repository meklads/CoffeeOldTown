
import React from 'react';
import { Clock, Flame, ChevronRight, Globe, ArrowUpRight } from 'lucide-react';
import { Recipe, SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

const TrendingRecipes: React.FC = () => {
  const { setView, scrollTo, setSelectedGoal, language } = useApp();
  
  const recipes = [
    {
      id: 1,
      title: 'Anti-Inflammatory Broth',
      category: 'RECOVERY',
      protocolMatch: language === 'ar' ? 'الاستشفاء الحيوي' : 'Bio-Recovery',
      time: '20 min',
      calories: 180,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071',
    },
    {
      id: 2,
      title: 'Ketogenic Lipid-Fuel',
      category: 'KETO-OS',
      protocolMatch: language === 'ar' ? 'التركيز الذهني' : 'Neural Focus',
      time: '15 min',
      calories: 420,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070',
    },
    {
      id: 3,
      title: 'Precision Grilled Salmon',
      category: 'PROTEIN+',
      protocolMatch: language === 'ar' ? 'تعزيز المناعة' : 'Immunity Boost',
      time: '25 min',
      calories: 320,
      image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=1964',
    }
  ];

  const handleCardClick = (protocolName: string) => {
    setSelectedGoal(protocolName);
    scrollTo(SectionId.PHASE_03_SYNTHESIS);
  };

  return (
    <section id={SectionId.PHASE_04_ARCHIVE} className="py-32 lg:py-48 bg-brand-light dark:bg-brand-dark relative overflow-hidden transition-colors duration-1000">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-dark dark:bg-brand-primary/10 text-brand-primary rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-lg border border-brand-primary/10">
                 <Globe size={14} className="animate-spin-slow" />
                 <span>GLOBAL SYNCHRONIZATION</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-[0.8] tracking-tighter">
                Trending <br /> <span className="text-brand-primary italic font-normal">Systems.</span>
              </h2>
           </div>
           <button 
             onClick={() => { setView('vaults'); window.scrollTo(0,0); }}
             className="group flex items-center gap-4 text-brand-dark/40 dark:text-white/40 hover:text-brand-primary transition-all text-[10px] font-black uppercase tracking-[0.4em] border-b border-brand-dark/5 pb-2"
           >
             View Complete Archive <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              onClick={() => handleCardClick(recipe.protocolMatch)}
              className="group cursor-pointer relative"
            >
               <div className="relative aspect-[3/4] rounded-[50px] overflow-hidden mb-8 bg-brand-sand/10 shadow-4xl transition-all duration-1000 group-hover:shadow-brand-primary/20">
                  <img src={recipe.image} className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-[2.5s] group-hover:scale-110" alt={recipe.title} />
                  
                  {/* Glass Card Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent opacity-80" />
                  
                  <div className="absolute inset-0 border-[0.5px] border-white/10 rounded-[50px] pointer-events-none" />

                  <div className="absolute bottom-10 left-10 right-10 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-6 h-[1px] bg-brand-primary group-hover:w-12 transition-all duration-700" />
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-brand-primary">{recipe.category}</span>
                     </div>
                     <h3 className="text-3xl font-serif font-bold text-white leading-[0.9] tracking-tight group-hover:text-brand-primary transition-colors duration-500">{recipe.title}</h3>
                  </div>

                  {/* Hover Quick Action */}
                  <div className="absolute top-10 right-10 w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-dark opacity-0 group-hover:opacity-100 transition-all duration-700 scale-75 group-hover:scale-100 shadow-glow">
                     <ArrowUpRight size={24} />
                  </div>
               </div>

               <div className="px-6 flex items-center justify-between">
                  <div className="flex gap-6 text-[10px] font-black text-brand-dark/30 dark:text-white/20 uppercase tracking-[0.3em]">
                     <span className="flex items-center gap-2"><Clock size={14} strokeWidth={1.5} /> {recipe.time}</span>
                     <span className="flex items-center gap-2"><Flame size={14} strokeWidth={1.5} /> {recipe.calories} kcal</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingRecipes;

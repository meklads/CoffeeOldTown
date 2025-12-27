
import React from 'react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { ArrowUpRight, Sparkles, BookOpen, Activity, Beaker, Zap } from 'lucide-react';

const Categories: React.FC = () => {
  const { language, setView } = useApp();

  const hubs = [
    {
      t: language === 'ar' ? 'أرشيف التغذية' : 'Metabolic Archive',
      d: language === 'ar' ? 'بروتوكولات سريرية متقدمة لرفع الأداء الحيوي.' : 'Advanced clinical nutrition protocols for metabolic peak performance.',
      icon: <Beaker size={24} />,
      id: '01'
    },
    {
      t: language === 'ar' ? 'تعزيز القدرات' : 'Cognitive Upgrade',
      d: language === 'ar' ? 'أنظمة تحسين الأداء الذهني والتركيز العصبي.' : 'Neuro-enhancement systems and focus optimization protocols.',
      icon: <Zap size={24} />,
      id: '02'
    },
    {
      t: language === 'ar' ? 'علوم القهوة' : 'Roast Dynamics',
      d: language === 'ar' ? 'كيمياء الاستخلاص وعلوم التحميص المتقدمة.' : 'The chemistry of extraction science and roasting dynamics.',
      icon: <Activity size={24} />,
      id: '03'
    }
  ];

  return (
    <section id={SectionId.PHASE_05_UPGRADE} className="bg-brand-light dark:bg-brand-dark py-32 overflow-hidden relative border-t border-brand-dark/[0.03] dark:border-white/5">
      
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/[0.015] -skew-x-12 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
         
         <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full text-[9px] font-black uppercase tracking-[0.5em] shadow-2xl">
                  <Sparkles size={12} className="animate-spin-slow" />
                  <span>KNOWLEDGE HUB</span>
               </div>
               <h2 className="text-5xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white tracking-tighter leading-none whitespace-nowrap overflow-hidden">
                 Learn & <span className="text-brand-primary italic font-normal">Upgrade.</span>
               </h2>
            </div>
            <p className="text-brand-dark/40 dark:text-white/30 text-lg md:text-xl font-medium max-w-sm italic leading-relaxed border-l-2 border-brand-primary/20 pl-8 shrink-0">
              {language === 'ar' 
                ? 'تعمق في البروتوكولات العلمية التي تطور أدائك الأيضي والذهني من خلال أرشيفنا.' 
                : 'Deepen your bio-optimization knowledge and upgrade your metabolic performance.'}
            </p>
         </div>

         <div className="grid lg:grid-cols-3 gap-8">
            {hubs.map((hub) => (
              <div 
                key={hub.id}
                onClick={() => { setView('vaults'); window.scrollTo(0,0); }}
                className="group relative bg-white dark:bg-zinc-900 border border-brand-dark/[0.04] dark:border-white/[0.03] p-12 rounded-[50px] hover:border-brand-primary/40 hover:shadow-4xl transition-all duration-700 cursor-pointer overflow-hidden flex flex-col min-h-[400px]"
              >
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/[0.03] rounded-full blur-[40px] group-hover:bg-brand-primary/[0.08] transition-colors" />
                 
                 <div className="mb-12 flex justify-between items-start">
                    <div className="w-16 h-16 bg-brand-light dark:bg-brand-dark rounded-2xl flex items-center justify-center text-brand-primary shadow-xl border border-brand-dark/[0.02] group-hover:scale-110 transition-transform duration-700">
                       {hub.icon}
                    </div>
                    <span className="text-brand-dark/10 dark:text-white/5 font-serif text-5xl font-bold italic">{hub.id}</span>
                 </div>

                 <div className="space-y-4 flex-grow text-left">
                    <h3 className="text-3xl font-serif font-bold text-brand-dark dark:text-white tracking-tight">{hub.t}</h3>
                    <p className="text-brand-dark/40 dark:text-white/20 text-sm font-medium italic leading-relaxed">
                       {hub.d}
                    </p>
                 </div>

                 <div className="pt-8 flex items-center gap-3 text-brand-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-700">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Establish Connection</span>
                    <ArrowUpRight size={18} />
                 </div>
              </div>
            ))}
         </div>

         <div className="mt-20 flex justify-center">
            <button 
              onClick={() => { setView('vaults'); window.scrollTo(0,0); }}
              className="group flex items-center gap-6 bg-brand-dark dark:bg-white/10 text-white px-12 py-7 rounded-full font-black text-[10px] uppercase tracking-[0.5em] hover:bg-brand-primary transition-all duration-700 shadow-4xl"
            >
               {language === 'ar' ? 'دخول الأرشيف المركزي' : 'ENTER THE CENTRAL VAULT'}
               <BookOpen size={20} />
            </button>
         </div>

      </div>
    </section>
  );
};

export default Categories;

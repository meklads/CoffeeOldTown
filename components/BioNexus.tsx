
import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, Zap, Baby, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { BioPersona, SectionId } from '../types.ts';

const BioNexus: React.FC = () => {
  const { language, scrollTo, currentPersona, setCurrentPersona } = useApp();
  const [isActivating, setIsActivating] = useState<BioPersona | null>(null);
  const isAr = language === 'ar';

  const paths = [
    {
      id: 'PREGNANCY' as BioPersona,
      title: isAr ? 'رعاية الأمومة' : 'Maternal Care',
      tag: 'MATERNAL_SAFE',
      desc: isAr ? 'تركيز على الفوليك، الحديد، وتجنب المحاذير الغذائية للجنين.' : 'Focus on Folic acid, Iron, and avoiding contraindicated foods.',
      icon: <Baby size={28} />,
      img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80',
    },
    {
      id: 'DIABETIC' as BioPersona,
      title: isAr ? 'إدارة الجلوكوز' : 'Glucose Control',
      tag: 'GLUCO_STABLE',
      desc: isAr ? 'تتبع الأحمال الجلايسيمية وتقديم بدائل ذكية ومنخفضة السكر.' : 'Glycemic load tracking with smart, low-sugar alternatives.',
      icon: <HeartPulse size={28} />,
      img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80',
    },
    {
      id: 'ATHLETE' as BioPersona,
      title: isAr ? 'أداء النخبة' : 'Elite Performance',
      tag: 'ATHLETE_VO2',
      desc: isAr ? 'تحسين البروتين، توقيت الكربوهيدرات، واستشفاء العضلات.' : 'Protein optimization, carb-timing, and muscle recovery.',
      icon: <Zap size={28} />,
      img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    }
  ];

  const handleSelect = (id: BioPersona) => {
    setIsActivating(id);
    setCurrentPersona(id);
    
    // Smooth delay to show "Activating" state before scrolling
    setTimeout(() => {
      scrollTo(SectionId.PHASE_01_SCAN);
      setIsActivating(null);
    }, 800);
  };

  return (
    <section id={SectionId.BIO_NEXUS} className="py-32 bg-brand-light dark:bg-brand-dark transition-colors duration-1000 overflow-hidden relative border-t border-brand-dark/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full border border-brand-primary/20 text-[9px] font-black uppercase tracking-[0.5em]">
              <ShieldCheck size={12} />
              <span>{isAr ? 'المسارات التخصصية نشطة' : 'SPECIALIZED_TRACKS_ACTIVE'}</span>
            </div>
            {/* Title fixed to one line */}
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-none tracking-tighter">
              Bio <span className="text-brand-primary italic font-normal">Nexus.</span>
            </h2>
          </div>
          <div className="max-w-md text-center md:text-right">
             <p className="text-brand-dark/40 dark:text-white/30 text-lg font-medium italic border-r-0 md:border-r-4 border-brand-primary md:pr-8 leading-relaxed">
               {isAr 
                 ? 'حدد حالتك الحيوية الآن للحصول على تحليل مخصص وعميق من الذكاء الاصطناعي.' 
                 : 'Define your bio-state now for deeply personalized AI diagnostic analysis.'}
             </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {paths.map((path) => (
            <div 
              key={path.id}
              onClick={() => handleSelect(path.id)}
              className={`group relative h-[500px] rounded-[60px] overflow-hidden cursor-pointer shadow-3xl border transition-all duration-700
                ${currentPersona === path.id 
                  ? 'border-brand-primary ring-4 ring-brand-primary/20 scale-[1.02]' 
                  : 'border-brand-dark/[0.05] dark:border-white/5 bg-white dark:bg-brand-surface opacity-60 hover:opacity-100 hover:scale-[1.01]'}`}
            >
               <div className="absolute inset-0">
                  <img src={path.img} className={`w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110 ${currentPersona === path.id ? 'grayscale-0' : 'grayscale'}`} alt={path.title} />
                  <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-700 ${currentPersona === path.id ? 'from-brand-primary/80 via-brand-dark/20' : 'from-brand-dark via-brand-dark/40'} to-transparent`} />
               </div>

               <div className="absolute top-10 right-10 flex flex-col items-end gap-3">
                  {currentPersona === path.id ? (
                    <div className="bg-white text-brand-dark px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-glow">
                       {isActivating === path.id ? <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" /> : <Check size={10} />}
                       {isAr ? 'المسار النشط' : 'ACTIVE_PATH'}
                    </div>
                  ) : (
                    <div className="bg-brand-primary/20 text-brand-primary px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md border border-brand-primary/20">
                       {isAr ? 'تجربة مجانية' : 'FREE_BETA'}
                    </div>
                  )}
                  <div className={`backdrop-blur-xl p-3 rounded-2xl border transition-colors ${currentPersona === path.id ? 'bg-white border-brand-primary text-brand-dark' : 'bg-white/5 border-white/10 text-brand-primary'}`}>
                     {path.icon}
                  </div>
               </div>

               <div className="absolute inset-x-0 bottom-0 p-12 space-y-4">
                  <div className="space-y-1">
                     <span className={`text-[9px] font-black uppercase tracking-[0.6em] ${currentPersona === path.id ? 'text-white' : 'text-brand-primary'}`}>{path.tag}</span>
                     <h3 className="text-4xl font-serif font-bold text-white tracking-tighter">{path.title}</h3>
                  </div>
                  <p className="text-white/80 text-sm font-medium italic leading-relaxed">
                     {path.desc}
                  </p>
                  
                  <div className={`flex items-center gap-4 text-white text-[10px] font-black uppercase tracking-[0.4em] pt-4 transition-all ${currentPersona === path.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                     {isAr ? 'تنشيط ذكاء المسار' : 'AI_TRACK_ACTIVATED'} <ChevronRight size={14} className="text-white" />
                  </div>
               </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BioNexus;

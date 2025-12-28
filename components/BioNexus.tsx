
import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, Zap, Baby, ChevronRight, Check, Loader2, Sparkles, Fingerprint } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { BioPersona, SectionId } from '../types.ts';

const BioNexus: React.FC = () => {
  const { language, scrollTo, currentPersona, setCurrentPersona } = useApp();
  const [isActivating, setIsActivating] = useState<BioPersona | null>(null);
  const isAr = language === 'ar';

  const paths = [
    {
      id: 'ATHLETE' as BioPersona,
      title: isAr ? 'أداء النخبة' : 'Elite Athlete',
      tag: 'METABOLIC_DRIVE',
      desc: isAr ? 'تحسين البروتين، توقيت الكربوهيدرات، واستشفاء العضلات.' : 'Protein optimization, carb-timing, and muscle recovery.',
      icon: <Zap size={28} />,
      img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
      color: 'from-orange-500/80',
      accent: 'text-orange-500'
    },
    {
      id: 'DIABETIC' as BioPersona,
      title: isAr ? 'توازن الجلوكوز' : 'Glucose Balance',
      tag: 'GLUCO_STABLE',
      desc: isAr ? 'تتبع الأحمال الجلايسيمية وتقديم بدائل ذكية ومنخفضة السكر.' : 'Glycemic load tracking with smart, low-sugar alternatives.',
      icon: <HeartPulse size={28} />,
      img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80',
      color: 'from-blue-500/80',
      accent: 'text-blue-500'
    },
    {
      id: 'PREGNANCY' as BioPersona,
      title: isAr ? 'رعاية الأمومة' : 'Maternal Safe',
      tag: 'BIO_SAFETY',
      desc: isAr ? 'تركيز على الفوليك، الحديد، وتجنب المحاذير الغذائية للجنين.' : 'Focus on Folic acid, Iron, and nutrient-dense safety.',
      icon: <Baby size={28} />,
      img: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
      color: 'from-pink-500/80',
      accent: 'text-pink-500'
    }
  ];

  const handleSelect = (id: BioPersona) => {
    setIsActivating(id);
    setCurrentPersona(id);
    
    // محاكاة "معايرة النظام" قبل العودة للهيرو
    setTimeout(() => {
      scrollTo(SectionId.PHASE_01_SCAN);
      setIsActivating(null);
    }, 1500);
  };

  return (
    <section id={SectionId.BIO_NEXUS} className="py-32 bg-brand-light dark:bg-brand-dark transition-all duration-1000 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-dark dark:bg-white/5 text-brand-primary rounded-full border border-brand-primary/20 shadow-2xl">
              <Sparkles size={14} className="animate-spin-slow" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em]">{isAr ? 'عقدة المسارات الحيوية' : 'BIO-PATHS NEXUS'}</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark dark:text-white leading-none tracking-tighter">
              The <span className="text-brand-primary italic font-normal">{isAr ? 'المسارات.' : 'Nexus.'}</span>
            </h2>
          </div>
          
          <div className="max-w-md bg-white/5 backdrop-blur-3xl p-8 rounded-[40px] border border-brand-primary/10 hidden md:block">
             <div className="flex items-center gap-3 mb-3 text-brand-primary">
                <Fingerprint size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'تخصيص البروتوكول' : 'PROTOCOL CUSTOMIZATION'}</span>
             </div>
             <p className="text-sm text-brand-dark/40 dark:text-white/30 italic font-medium">
               {isAr 
                 ? 'اختيارك لأحد هذه المسارات يعيد ضبط خوارزمية المسح الضوئي في الأعلى فوراً.' 
                 : 'Selecting a path recalibrates the scanning algorithm above instantly.'}
             </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {paths.map((path) => (
            <div 
              key={path.id}
              onClick={() => handleSelect(path.id)}
              className={`group relative h-[550px] rounded-[65px] overflow-hidden cursor-pointer shadow-4xl border-2 transition-all duration-1000
                ${currentPersona === path.id 
                  ? 'border-brand-primary scale-[1.03] z-10 shadow-glow' 
                  : 'border-brand-dark/5 dark:border-white/5 grayscale hover:grayscale-0 hover:border-brand-primary/30'}`}
            >
               <div className="absolute inset-0">
                  <img 
                    src={path.img} 
                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                    alt={path.title} 
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${currentPersona === path.id ? path.color : 'from-brand-dark'} via-transparent to-transparent opacity-90`} />
               </div>

               {isActivating === path.id && (
                 <div className="absolute inset-0 z-50 bg-brand-dark/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-white animate-fade-in">
                    <Loader2 size={50} className="text-brand-primary animate-spin mb-6" />
                    <h4 className="text-3xl font-serif font-bold italic mb-3">
                       {isAr ? 'إعادة المعايرة...' : 'Recalibrating...'}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
                       {isAr ? 'تحديث وحدة المسح الضوئي' : 'SYNCING SCAN UNIT'}
                    </p>
                 </div>
               )}

               <div className="absolute top-10 right-10 flex flex-col items-end gap-4">
                  {currentPersona === path.id && (
                    <div className="bg-brand-primary text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-glow animate-bounce">
                       <Check size={12} />
                       {isAr ? 'نشط الآن' : 'ACTIVE'}
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-700 shadow-2xl
                    ${currentPersona === path.id ? 'bg-white text-brand-dark' : 'bg-brand-dark/40 backdrop-blur-md text-brand-primary border border-white/10'}`}>
                     {path.icon}
                  </div>
               </div>

               <div className="absolute inset-x-0 bottom-0 p-12 space-y-4">
                  <div className="space-y-1">
                     <span className={`text-[10px] font-black uppercase tracking-[0.7em] ${currentPersona === path.id ? 'text-white' : 'text-brand-primary'}`}>{path.tag}</span>
                     <h3 className="text-4xl font-serif font-bold text-white tracking-tighter leading-none">{path.title}</h3>
                  </div>
                  <p className="text-white/70 text-base font-medium italic leading-relaxed line-clamp-2">
                     {path.desc}
                  </p>
                  
                  <div className={`flex items-center gap-4 text-white text-[10px] font-black uppercase tracking-[0.5em] pt-6 transition-all duration-700
                    ${currentPersona === path.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                     {isAr ? 'دخول البروتوكول' : 'ENTER PROTOCOL'} <ChevronRight size={16} className="text-brand-primary" />
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

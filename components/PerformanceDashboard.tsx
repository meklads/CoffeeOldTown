
import React, { useState, useEffect } from 'react';
import { Activity, Zap, Droplets, Target, Cpu, TrendingUp, ChevronRight, Gauge } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

const PerformanceDashboard: React.FC = () => {
  const { language, history } = useApp();
  const isAr = language === 'ar';
  
  // Simulated data calculation based on history or defaults
  const [metrics, setMetrics] = useState({
    caffeine: 42,
    metabolism: 88,
    focus: 94,
    stability: 76
  });

  // Animation for "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        metabolism: Math.min(100, Math.max(80, prev.metabolism + (Math.random() - 0.5) * 2)),
        focus: Math.min(100, Math.max(90, prev.focus + (Math.random() - 0.5))),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { 
      label: isAr ? 'تشبع الكافيين' : 'CAFFEINE SATURATION', 
      val: `${metrics.caffeine}%`, 
      icon: <Zap size={16} />, 
      color: 'text-brand-primary',
      desc: isAr ? 'التحلل الأيضي الحالي' : 'Current metabolic decay'
    },
    { 
      label: isAr ? 'الكفاءة الأيضية' : 'METABOLIC EFFICIENCY', 
      val: `${Math.round(metrics.metabolism)}%`, 
      icon: <Activity size={16} />, 
      color: 'text-emerald-500',
      desc: isAr ? 'تحسين استهلاك السعرات' : 'Caloric burn optimization'
    },
    { 
      label: isAr ? 'الاستقرار الحيوي' : 'BIOMETRIC STABILITY', 
      val: `${metrics.stability}%`, 
      icon: <Target size={16} />, 
      color: 'text-blue-400',
      desc: isAr ? 'توازن الجلوكوز والدهون' : 'Glucose/Lipid equilibrium'
    },
    { 
      label: isAr ? 'المحرك العصبي' : 'NEURAL DRIVE', 
      val: `${Math.round(metrics.focus)}%`, 
      icon: <Cpu size={16} />, 
      color: 'text-purple-400',
      desc: isAr ? 'القدرة التشابكية للتركيز' : 'Synaptic focus capacity'
    }
  ];

  return (
    <section className="py-32 bg-brand-dark relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C2A36B 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full border border-brand-primary/20 text-[9px] font-black uppercase tracking-[0.4em] shadow-lg">
              <Gauge size={12} className="animate-pulse" />
              <span>CORE_DATA_STREAM_6.0</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white leading-none tracking-tighter">
              Performance <br /> <span className="text-brand-primary italic font-normal">Dashboard.</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
             <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em]">LAST_SYNC</span>
             <span className="text-white/40 font-mono text-xs italic">{new Date().toLocaleTimeString()} • BIOMETRIC SECURE</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Visualizer: The Energy Wave */}
          <div className="lg:col-span-8 bg-white/[0.03] border border-white/5 rounded-[60px] p-10 flex flex-col relative overflow-hidden shadow-2xl group">
             {/* Scan Line Animation */}
             <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary/20 animate-scan pointer-events-none" />
             
             <div className="flex justify-between items-start mb-12">
                <div className="space-y-1">
                   <h3 className="text-2xl font-serif font-bold text-white">{isAr ? 'توقع منحنى الطاقة' : 'Energy Forecast'}</h3>
                   <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">{isAr ? 'التحليلات التنبؤية لليوم' : 'Predictive Analytics for current cycle'}</p>
                </div>
                <div className="flex gap-2">
                   {['24H', '7D', 'LIVE'].map(t => (
                     <button key={t} className={`px-4 py-1.5 rounded-full text-[8px] font-black border transition-all ${t === 'LIVE' ? 'bg-brand-primary border-brand-primary text-brand-dark' : 'border-white/10 text-white/30 hover:border-white/40'}`}>
                        {t}
                     </button>
                   ))}
                </div>
             </div>

             <div className="flex-grow flex items-end justify-between gap-2 h-64 mb-10">
                {[40, 65, 85, 95, 75, 45, 60, 90, 100, 80, 55, 30].map((h, i) => (
                  <div key={i} className="flex-1 group/bar relative">
                    <div 
                      className="w-full bg-brand-primary/10 group-hover/bar:bg-brand-primary/30 transition-all rounded-t-xl" 
                      style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                    />
                    {i === 8 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-dark px-2 py-1 rounded text-[8px] font-black whitespace-nowrap animate-bounce shadow-glow">PEAK PERFORMANCE</div>}
                  </div>
                ))}
             </div>

             <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
                <span>06:00 AM</span>
                <span>12:00 PM</span>
                <span>06:00 PM</span>
                <span>12:00 AM</span>
             </div>
          </div>

          {/* Sidebar Stats Grid */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
             {stats.map((s, idx) => (
               <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-[35px] p-8 hover:bg-white/[0.05] hover:border-brand-primary/20 transition-all duration-500 group">
                  <div className="flex justify-between items-start">
                     <div className={`p-3 bg-brand-dark rounded-xl ${s.color} border border-white/5 shadow-xl group-hover:scale-110 transition-transform`}>
                        {s.icon}
                     </div>
                     <TrendingUp size={14} className="text-emerald-500 opacity-30" />
                  </div>
                  <div className="mt-6 space-y-1">
                     <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{s.label}</span>
                     <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-serif font-bold text-white">{s.val}</span>
                        <span className="text-[10px] text-brand-primary font-bold italic">{s.desc}</span>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Floating AI Insight Banner */}
        <div className="mt-12 bg-gradient-to-r from-brand-primary/20 to-transparent border-l-4 border-brand-primary p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md">
           <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-primary shadow-2xl border border-white/5">
                 <Cpu size={28} className="animate-spin-slow" />
              </div>
              <div className="space-y-1">
                 <h4 className="text-xl font-serif font-bold text-white italic">{isAr ? 'توصية النظام التنبؤية' : 'System Predictive Insight'}</h4>
                 <p className="text-white/40 text-sm font-medium italic">
                    {isAr ? 'تم رصد انخفاض تدريجي في مستويات الجليكوجين. نوصي بتناول وجبة خفيفة غنية بالبروتين في تمام الساعة 04:30 مساءً للحفاظ على الاستقرار.' : 'Gradual glycogen decay detected. Recommended protein-rich snack intake at 16:30 for stability.'}
                 </p>
              </div>
           </div>
           <button className="shrink-0 flex items-center gap-3 bg-white text-brand-dark px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-brand-primary hover:text-white transition-all shadow-glow">
              {isAr ? 'تطبيق البروتوكول' : 'APPLY PROTOCOL'} <ChevronRight size={14} />
           </button>
        </div>

      </div>
    </section>
  );
};

export default PerformanceDashboard;

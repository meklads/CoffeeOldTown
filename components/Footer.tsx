
import React from 'react';
import { Instagram, Facebook, Twitter, Youtube, Mail, ArrowUpRight, ShieldCheck, Send, Globe } from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

const Footer: React.FC = () => {
  const { language, setLanguage, setView, view, scrollTo } = useApp();
  const isAr = language === 'ar';
  
  const handleNavClick = (viewName: any) => {
    setView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = [
    { label: isAr ? 'المختبر' : 'THE LAB', id: 'home' },
    { label: isAr ? 'المكتبة' : 'LIBRARY', id: 'vaults' },
    { label: isAr ? 'المتجر' : 'MARKET', id: 'coffee' },
    { label: isAr ? 'من نحن' : 'ABOUT', id: 'about' },
  ];

  const legalLinks = [
    { label: isAr ? 'الخصوصية' : 'PRIVACY', id: 'privacy' },
    { label: isAr ? 'الشروط' : 'TERMS', id: 'terms' },
    { label: isAr ? 'تواصل معنا' : 'CONTACT', id: 'contact' },
  ];

  return (
    <footer className="bg-brand-dark pt-32 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Newsletter Section (Integrated) */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[48px] p-10 mb-24 flex flex-col lg:flex-row items-center justify-between gap-12">
           <div className="space-y-3 text-center lg:text-left">
              <h4 className="text-3xl font-serif font-bold text-white tracking-tight">Stay Informed.</h4>
              <p className="text-white/30 text-sm font-medium italic">Weekly clinical updates and protocol releases.</p>
           </div>
           <div className="flex w-full lg:w-auto gap-3">
              <input 
                type="email" 
                placeholder="Secure email..." 
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-primary transition-all w-full lg:w-80"
              />
              <button className="bg-brand-primary text-white p-4 rounded-2xl hover:bg-white hover:text-brand-dark transition-all">
                <Send size={20} />
              </button>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-20 mb-24">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-10">
             <div className="flex flex-col items-start cursor-pointer" onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span className="text-3xl font-serif font-bold leading-none tracking-tighter uppercase text-brand-primary">Coffee</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none text-white/30">Old Town Lab</span>
             </div>
             <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                Advanced bio-analysis for the modern human. Synchronizing world-class coffee with precision metabolic data to upgrade human potential.
             </p>
             <button 
                onClick={() => setLanguage(isAr ? 'en' : 'ar')}
                className="flex items-center gap-3 text-brand-primary/60 hover:text-brand-primary transition-colors text-[10px] font-black uppercase tracking-[0.4em]"
             >
                <Globe size={14} />
                {isAr ? 'Switch to English' : 'التحويل للعربية'}
             </button>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-8">
             <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">EXPLORE</h4>
             <ul className="space-y-4">
                {footerLinks.map((item, i) => (
                  <li key={i}>
                    <button onClick={() => handleNavClick(item.id)} className="text-white/50 hover:text-brand-primary transition-colors text-xs font-bold uppercase tracking-widest text-left">
                      {item.label}
                    </button>
                  </li>
                ))}
             </ul>
          </div>

          {/* Legal/Utility */}
          <div className="lg:col-span-3 space-y-8">
             <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">SYSTEM</h4>
             <ul className="space-y-4">
                {legalLinks.map((item, i) => (
                  <li key={i}>
                    <button onClick={() => handleNavClick(item.id)} className="text-white/50 hover:text-brand-primary transition-colors text-xs font-bold uppercase tracking-widest text-left">
                      {item.label}
                    </button>
                  </li>
                ))}
             </ul>
          </div>

          {/* Social */}
          <div className="lg:col-span-2 space-y-8 text-center lg:text-right">
             <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">CONNECT</h4>
             <div className="flex justify-center lg:justify-end gap-4">
                {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                  <a key={i} href="#" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-primary transition-all">
                    <Icon size={18} />
                  </a>
                ))}
             </div>
             <p className="text-[9px] text-white/20 pt-4 font-black tracking-widest">coffeeoldtownhome@gmail.com</p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] flex items-center gap-4">
              <ShieldCheck size={14} className="text-brand-primary/40" />
              &copy; {new Date().getFullYear()} Coffee Old Town Lab. BIOMETRIC_SECURE_ENCRYPTION_v4.
           </div>
           <div className="flex gap-8 text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">
              <span>Latency: 24ms</span>
              <span>Status: Operational</span>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Moon, Sun, Globe } from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { setView, view, scrollTo, language, setLanguage, theme, toggleTheme } = useApp();
  const isAr = language === 'ar';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { 
      label: isAr ? 'المختبر' : 'THE LAB', 
      id: 'home', 
      type: 'home' 
    },
    { 
      label: isAr ? 'الأرشيف' : 'LIBRARY', 
      id: 'vaults', 
      type: 'view' 
    },
    { 
      label: isAr ? 'المتجر' : 'MARKET', 
      id: 'coffee', 
      type: 'view' 
    },
  ];

  const handleLinkClick = (link: { label: string, id: string, type: string }) => {
    if (link.type === 'home') {
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.type === 'view') {
      setView(link.id as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMobileOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(isAr ? 'en' : 'ar');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[150] transition-all duration-700 ${isScrolled || view !== 'home' ? 'bg-brand-dark/95 backdrop-blur-xl py-3 shadow-2xl border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex flex-col items-start cursor-pointer group" onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="flex items-center gap-2">
             <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-[0_0_10px_#C2A36B] animate-pulse" />
                <div className="absolute inset-0 bg-brand-primary/50 rounded-full animate-ping scale-150 opacity-20" />
             </div>
             <span className={`text-2xl font-serif font-bold leading-none tracking-tighter uppercase transition-colors ${isScrolled || view !== 'home' ? 'text-brand-primary' : 'text-brand-dark dark:text-white'}`}>Coffee</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[9px] font-black uppercase tracking-[0.4em] leading-none transition-colors ${isScrolled || view !== 'home' ? 'text-white/40' : 'text-brand-dark/30 dark:text-white/20'}`}>Old Town Lab</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-10">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleLinkClick(link)}
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2 ${
                (view === link.id || (view === 'home' && link.type === 'home'))
                ? 'text-brand-primary' 
                : isScrolled || view !== 'home' ? 'text-white/60 hover:text-brand-primary' : 'text-brand-dark/60 hover:text-brand-dark dark:text-white/40 dark:hover:text-white'
              }`}
            >
              {link.label}
              {link.id === 'coffee' && <ShoppingCart size={12} className="opacity-50" />}
            </button>
          ))}
          
          <div className="h-4 w-px bg-white/10 mx-2" />

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${isScrolled || view !== 'home' ? 'text-white/60 hover:text-brand-primary bg-white/5' : 'text-brand-dark/60 hover:text-brand-dark bg-brand-dark/5 dark:text-white/40 dark:bg-white/5'}`}
            >
              <Globe size={16} />
              {isAr ? 'EN' : 'AR'}
            </button>

            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isScrolled || view !== 'home' ? 'text-white/60 hover:text-brand-primary bg-white/5' : 'text-brand-dark/60 hover:text-brand-dark bg-brand-dark/5 dark:text-white/40 dark:bg-white/5'}`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="xl:hidden p-2 rounded-xl bg-white/5" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={24} className="text-white" /> : <Menu size={24} className={isScrolled || view !== 'home' ? 'text-white' : 'text-brand-dark dark:text-white'} />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileOpen && (
        <div className="xl:hidden fixed inset-0 top-0 bg-brand-dark z-[200] p-10 flex flex-col justify-center gap-12 animate-fade-in overflow-hidden">
           <button onClick={() => setIsMobileOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white">
             <X size={32} />
           </button>
           
           <div className="space-y-8">
             {navLinks.map((link, idx) => (
              <button 
                key={idx} 
                onClick={() => handleLinkClick(link)} 
                className={`text-left block text-5xl font-serif font-bold tracking-tighter ${view === link.id ? 'text-brand-primary' : 'text-white/60 hover:text-white'}`}
              >
                {link.label}
              </button>
            ))}
           </div>

           <div className="pt-12 border-t border-white/5 flex flex-col gap-8">
             <div className="flex items-center gap-8">
                <button 
                  onClick={() => { toggleLanguage(); setIsMobileOpen(false); }}
                  className="flex items-center gap-3 text-white/40 text-sm font-black uppercase tracking-widest hover:text-white"
                >
                  <Globe size={20} />
                  {isAr ? 'English (EN)' : 'العربية (AR)'}
                </button>
                <button 
                  onClick={() => { toggleTheme(); setIsMobileOpen(false); }}
                  className="flex items-center gap-3 text-white/40 text-sm font-black uppercase tracking-widest hover:text-white"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
             </div>
             
             <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                Coffee Old Town Lab &copy; {new Date().getFullYear()}
             </p>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

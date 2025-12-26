
import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, BookOpen, Activity, Moon, Sun } from 'lucide-react';
import { SectionId } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { translations } from '../translations.ts';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { setView, view, scrollTo, language, theme, toggleTheme } = useApp();
  const t = translations[language].nav;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simplified and corrected mapping for smooth navigation
  const navLinks = [
    { label: t.phase01, id: SectionId.PHASE_01_SCAN, type: 'scroll' },
    { label: language === 'ar' ? '02. التخليق' : '02. SYNTHESIS', id: SectionId.PHASE_03_SYNTHESIS, type: 'scroll' },
    { label: language === 'ar' ? '03. المعرفة' : '03. JOURNAL', id: SectionId.PHASE_05_UPGRADE, type: 'scroll' },
    { label: language === 'ar' ? '04. الأرشيف' : '04. ARCHIVE', id: 'vaults', type: 'view' },
  ];

  const handleLinkClick = (link: { label: string, id: string, type: string }) => {
    if (link.type === 'view') {
      setView('vaults');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (view !== 'home') {
        setView('home');
        // Wait for section to render if coming from another view
        setTimeout(() => scrollTo(link.id), 250);
      } else {
        scrollTo(link.id);
      }
    }
    setIsMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[150] transition-all duration-700 ${isScrolled || view !== 'home' ? 'bg-brand-dark/95 backdrop-blur-xl py-3 shadow-2xl border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
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

        <div className="hidden xl:flex items-center gap-8">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleLinkClick(link)}
              className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2 ${isScrolled || view !== 'home' ? 'text-white/60 hover:text-brand-primary' : 'text-brand-dark/60 hover:text-brand-dark dark:text-white/40 dark:hover:text-white'}`}
            >
              {link.label}
            </button>
          ))}
          
          <button onClick={() => { setView('coffee'); window.scrollTo(0,0); }} className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${isScrolled || view !== 'home' ? 'text-white/60 hover:text-brand-primary' : 'text-brand-dark/60 hover:text-brand-dark dark:text-white/40 dark:hover:text-white'}`}>
            {translations[language].nav.store} <ShoppingCart size={12} />
          </button>

          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all ${isScrolled || view !== 'home' ? 'text-white/60 hover:text-brand-primary bg-white/5' : 'text-brand-dark/60 hover:text-brand-dark bg-brand-dark/5 dark:text-white/40 dark:bg-white/5'}`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <button className="xl:hidden" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={24} className="text-white" /> : <Menu size={24} className={isScrolled || view !== 'home' ? 'text-white' : 'text-brand-dark dark:text-white'} />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="xl:hidden fixed inset-0 top-[64px] bg-brand-dark z-50 p-10 flex flex-col gap-6 animate-fade-in">
           {navLinks.map((link, idx) => (
            <button key={idx} onClick={() => handleLinkClick(link)} className="text-left text-white text-3xl font-serif font-bold tracking-tight border-b border-white/10 pb-4">
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => { toggleTheme(); setIsMobileOpen(false); }}
            className="flex items-center gap-4 text-white text-3xl font-serif font-bold tracking-tight pb-4"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

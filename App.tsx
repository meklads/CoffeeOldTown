
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import SmartNutritionTool from './components/SmartNutritionTool.tsx';
import BioNexus from './components/BioNexus.tsx';
import VaultsPage from './components/VaultsPage.tsx';
import RecipeDetail from './components/RecipeDetail.tsx';
import Footer from './components/Footer.tsx';
import KnowledgeHub from './components/Categories.tsx';
import TrendingRecipes from './components/TrendingRecipes.tsx';
import CoffeeCorner from './components/CoffeeCorner.tsx';
import About from './components/About.tsx';
import FAQ from './components/FAQ.tsx';
import ContactUs from './components/ContactUs.tsx';
import { AppContext, UserTier } from './context/AppContext.tsx';
import { Language } from './translations.ts';
import { MealAnalysisResult, SectionId, ViewType, Recipe, FeedbackEntry, FeedbackSignal, Theme, BioPersona } from './types.ts';
import { syncMealToCloud, fetchCloudHistory, testConnection } from './services/supabaseClient.ts';

const App: React.FC = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ot_lang') as Language;
    return saved || 'en';
  });

  const [tier, setTier] = useState<UserTier>('elite');
  const [view, setView] = useState<ViewType>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [currentPersona, setCurrentPersona] = useState<BioPersona>(() => {
    const saved = localStorage.getItem('ot_persona') as BioPersona;
    return saved || 'GENERAL';
  });
  const [lastAnalysisResult, setLastAnalysisResult] = useState<MealAnalysisResult | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isApiKeyLinked, setIsApiKeyLinked] = useState(false);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ot_theme') as Theme;
    return saved || 'dark';
  });

  const [history, setHistory] = useState<MealAnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem('ot_metabolic_archive');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>(() => {
    try {
      const saved = localStorage.getItem('ot_feedback_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('ot_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ot_persona', currentPersona);
  }, [currentPersona]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#141210'; 
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#FDFDFD';
    }
    localStorage.setItem('ot_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  useEffect(() => {
    const initCloud = async () => {
      const isOk = await testConnection();
      setIsCloudConnected(isOk);
      if (isOk) {
        const cloudData = await fetchCloudHistory();
        if (cloudData.length > 0) {
          setHistory(prev => {
            const combined = [...cloudData, ...prev];
            return combined.filter((v, i, a) => a.findIndex(t => (t.timestamp === v.timestamp)) === i);
          });
        }
      }
    };
    initCloud();
  }, []);

  useEffect(() => {
    localStorage.setItem('ot_metabolic_archive', JSON.stringify(history));
  }, [history]);

  const incrementScans = useCallback(async (result: MealAnalysisResult) => {
    setHistory(prev => [result, ...prev]);
    if (isCloudConnected) await syncMealToCloud(result);
  }, [isCloudConnected]);

  const clearHistory = useCallback(() => {
    if (window.confirm(language === 'ar' ? "هل أنت متأكد من مسح الأرشيف؟" : "Purge history?")) {
      setHistory([]);
      localStorage.removeItem('ot_metabolic_archive');
    }
  }, [language]);

  const submitFeedback = useCallback((signal: FeedbackSignal) => {
    if (!selectedGoal) return;
    const newEntry: FeedbackEntry = {
      goal: selectedGoal,
      signal,
      timestamp: Date.now()
    };
    setFeedbackHistory(prev => [newEntry, ...prev].slice(0, 50));
  }, [selectedGoal]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const HorizontalDivider = () => (
    <div className="divider-container">
       <div className="neural-divider-h">
          <div className="neural-node-h" />
       </div>
    </div>
  );

  const renderContent = () => {
    switch(view) {
      case 'home':
        return (
          <div className="animate-fade-in space-y-0 overflow-hidden bg-brand-light dark:bg-brand-dark bg-grain">
            <Hero />
            <HorizontalDivider />
            <BioNexus />
            <HorizontalDivider />
            <SmartNutritionTool />
            <HorizontalDivider />
            <TrendingRecipes />
            <HorizontalDivider />
            <KnowledgeHub />
          </div>
        );
      case 'vaults': return <VaultsPage />;
      case 'recipe_detail': return <RecipeDetail />;
      case 'coffee': return <CoffeeCorner />;
      case 'about': return <About />;
      case 'contact': return <ContactUs />;
      case 'faq': return <FAQ />;
      default: return <Hero />;
    }
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, tier, setTier, theme, toggleTheme, scansCount: history.length, incrementScans, 
      history, clearHistory, lastAnalysisResult, setLastAnalysisResult,
      view, setView, scrollTo, selectedRecipe, setSelectedRecipe,
      selectedGoal, setSelectedGoal, currentPersona, setCurrentPersona,
      feedbackHistory, submitFeedback,
      isCloudConnected, setIsCloudConnected,
      isApiKeyLinked, setIsApiKeyLinked
    }}>
      <div className="min-h-screen flex flex-col bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-light font-sans selection:bg-brand-primary/30 transition-colors duration-500 scroll-smooth">
        
        {theme === 'dark' && (
          <div className="coffee-nebula-container">
            <div className="nebula-glow w-[600px] h-[600px] bg-brand-primary/20 top-[-10%] right-[-10%] animate-float-slow" />
            <div className="nebula-glow w-[500px] h-[500px] bg-[#3E2723]/30 top-[40%] left-[-5%] animate-float-reverse" />
            <div className="nebula-glow w-[400px] h-[400px] bg-brand-gold/10 bottom-[5%] right-[5%] animate-float-slow" style={{ animationDelay: '-5s' }} />
          </div>
        )}

        <Navbar />
        <main className="flex-grow relative z-10">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </AppContext.Provider>
  );
};

export default App;

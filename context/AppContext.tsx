
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../translations.ts';
import { MealAnalysisResult, ViewType, Recipe, FeedbackEntry, FeedbackSignal, Theme, BioPersona } from '../types.ts';

export type UserTier = 'free' | 'pro' | 'elite';

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  tier: UserTier;
  setTier: (tier: UserTier) => void;
  theme: Theme;
  toggleTheme: () => void;
  scansCount: number;
  incrementScans: (result: MealAnalysisResult) => void;
  history: MealAnalysisResult[];
  clearHistory: () => void;
  lastAnalysisResult: MealAnalysisResult | null;
  setLastAnalysisResult: (result: MealAnalysisResult | null) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  scrollTo: (id: string) => void;
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  selectedGoal: string | null;
  setSelectedGoal: (goal: string | null) => void;
  currentPersona: BioPersona;
  setCurrentPersona: (persona: BioPersona) => void;
  feedbackHistory: FeedbackEntry[];
  submitFeedback: (signal: FeedbackSignal) => void;
  isCloudConnected: boolean;
  setIsCloudConnected: (connected: boolean) => void;
  isApiKeyLinked: boolean;
  setIsApiKeyLinked: (status: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Logic is handled in App.tsx directly for simplicity in this structure
  return <>{children}</>;
};

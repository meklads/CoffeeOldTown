
export interface Recipe {
  id: number;
  title: string;
  category: string;
  image: string;
  time: string;
  calories: number;
  description?: string;
  fullContent?: string;
  ingredients?: string[];
  steps?: { title: string; desc: string; image?: string }[];
  nutritionalFacts?: { label: string; value: string; percentage?: string }[];
  affiliateLinks?: { name: string; url: string }[];
}

export type BioPersona = 'GENERAL' | 'ATHLETE' | 'PREGNANCY' | 'DIABETIC';

export interface MealPlanRequest {
  goal: string;
  diet: string;
  persona?: BioPersona;
}

export interface UserHealthProfile {
  chronicDiseases: string;
  dietProgram: string;
  activityLevel: 'low' | 'moderate' | 'high';
  persona?: BioPersona;
}

export interface Meal {
  name: string;
  calories: string;
  protein: string;
  description: string;
}

export interface DayPlan {
  id?: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
  totalCalories: string;
  advice: string;
}

export type FeedbackSignal = 'no_difference' | 'better' | 'much_better';

export interface FeedbackEntry {
  goal: string;
  signal: FeedbackSignal;
  timestamp: number;
}

export interface BioWarning {
  text: string;
  riskLevel: 'low' | 'medium' | 'high';
  type: string;
}

export interface MealAnalysisResult {
  ingredients: { name: string; calories: number }[];
  totalCalories: number;
  healthScore: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  summary: string;
  personalizedAdvice: string;
  timestamp?: string;
  imageUrl?: string;
  warnings?: (string | BioWarning)[];
}

export enum SectionId {
  PHASE_01_SCAN = 'analysis',       
  PHASE_02_PROTOCOLS = 'protocols', 
  PHASE_03_SYNTHESIS = 'synthesis', 
  PHASE_04_ARCHIVE = 'archive',     
  PHASE_05_UPGRADE = 'pricing',
  BIO_NEXUS = 'nexus',
  RECIPE_VAULT = 'systems',
  COFFEE_STORE = 'coffee',
  ABOUT = 'about'
}

export type ViewType = 'home' | 'privacy' | 'contact' | 'about' | 'terms' | 'faq' | 'vaults' | 'recipe_detail' | 'coffee';
export type Theme = 'light' | 'dark';

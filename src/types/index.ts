export interface SampleData {
  id: string;
  sampleId: string;
  moisture: number;
  dryDensity: number;
  correctionFactor: number;
  porosity: number;
  adjustedMoisture: number;
  adjustedDensity: number;
}

export interface NewsArticle {
  title: string;
  pubDate: string;
  language: string;
  source_id: string;
  link: string;
  description?: string;
  category?: string;
  thumbnail?: string;
}

export interface HeaderContextType {
  title: string;
  subtitle?: string;
  contextData?: Record<string, any>;
}

export interface AppConfig {
  routes: {
    path: string;
    label: string;
    icon: string;
  }[];
  features: {
    samples: {
      defaultCorrectionFactor: number;
      defaultPorosity: number;
    };
    news: {
      defaultCountry: string;
      categories: string[];
    };
  };
}

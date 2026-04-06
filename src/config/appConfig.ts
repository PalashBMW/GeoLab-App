import { AppConfig } from '../types';

export const appConfig: AppConfig = {
  routes: [
    { path: '/', label: 'Home', icon: 'Home' },
    { path: '/samples', label: 'Samples', icon: 'FlaskConical' },
    { path: '/news', label: 'News', icon: 'Newspaper' },
  ],
  features: {
    samples: {
      defaultCorrectionFactor: 5,
      defaultPorosity: 30,
    },
    news: {
      defaultCountry: 'us',
      categories: ['environment', 'science', 'technology'],
    },
  },
};

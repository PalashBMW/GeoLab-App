import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HeaderContextType } from '../types';

interface AppContextData {
  header: HeaderContextType;
  setHeader: (header: HeaderContextType) => void;
  updateHeader: (updates: Partial<HeaderContextType>) => void;
}

const AppContext = createContext<AppContextData | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [header, setHeader] = useState<HeaderContextType>({
    title: 'GeoLab Home',
  });

  const updateHeader = (updates: Partial<HeaderContextType>) => {
    setHeader((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ header, setHeader, updateHeader }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

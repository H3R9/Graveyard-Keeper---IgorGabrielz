import { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playSound: () => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playSound: () => void;
}

export function NavigationProvider({ children, activeTab, setActiveTab, playSound }: NavigationProviderProps) {
  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab, playSound }}>
      {children}
    </NavigationContext.Provider>
  );
}

import React, { createContext, useState, useContext } from 'react';

// 1. Theme ka structure define karen taake red line na aaye
export interface ThemeType {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  card: string;
}

// 6 Themes ka data
export const themes = {
  original: {
    name: 'Original Green',
    primary: '#1B4332',
    secondary: '#2D6A4F',
    background: '#DFF6E8',
    text: '#FFFFFF',
    card: '#FFFFFF',
  },
  ocean: {
    name: 'Tranquil Ocean',
    primary: '#0077B6',
    secondary: '#90E0EF',
    background: '#CAF0F8',
    text: '#FFFFFF',
    card: '#FFFFFF',
  },
  lavender: {
    name: 'Lavender Peace',
    primary: '#7B2CBF',
    secondary: '#BB86FC',
    background: '#E0AAFF',
    text: '#FFFFFF',
    card: '#FFFFFF',
  },
  sunset: {
    name: 'Sunset Warmth',
    primary: '#F4A261',
    secondary: '#E76F51',
    background: '#FFEDD5',
    text: '#FFFFFF',
    card: '#FFFFFF',
  },
  zen: {
    name: 'Midnight Zen',
    primary: '#4ECCA3',
    secondary: '#16213E',
    background: '#1A1A2E',
    text: '#FFFFFF',
    card: '#16213E',
  },
  forest: {
    name: 'Deep Forest',
    primary: '#2D6A4F',
    secondary: '#40916C',
    background: '#B7E4C7',
    text: '#FFFFFF',
    card: '#FFFFFF',
  },
};

// 2. Context ko Interface ke saath define karen
interface ContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ContextProps>({
  theme: themes.original,
  setTheme: () => {}, // Khali function as default
});

export const ThemeProvider = ({ children }: any) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(themes.original);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme: setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
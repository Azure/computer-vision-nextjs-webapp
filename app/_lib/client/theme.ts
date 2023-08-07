// @ts-ignore
import daisyUiColors from 'daisyui/src/theming/themes';
import { useEffect, useState } from 'react';

const getTheme = () => localStorage.getItem('cn-scenario-theme') || 'autumn';

export const setTheme = (newTheme: string) => {
  localStorage.setItem('cn-scenario-theme', newTheme);
  dispatchEvent(new Event('storage'));
  document.querySelector('html')!.setAttribute('data-theme', newTheme);
};

type ThemeColors = {
  'color-scheme': string;
  primary: string;
  secondary: string;
  accent: string;
  'base-100': string;
  'base-200': string;
  'base-300': string;
  neutral: string;
  'neutral-focus': string;
  info: string;
  success: string;
  warning: string;
  error: string;
};

const getThemeColors = (): ThemeColors => daisyUiColors[`[data-theme=${getTheme()}]`];

export const useTheme = () => {
  const autumnThemeColors = daisyUiColors[`[data-theme=autumn]`];
  const [theme, _setTheme] = useState<string>('');
  const [themeColors, setThemeColors] = useState<ThemeColors>(autumnThemeColors);

  useEffect(() => {
    // Only access local storage on component mount, else risk undefined
    _setTheme(getTheme());
    setThemeColors(getThemeColors());

    // Check for theme change when local storage is changed
    const onStorage = () => {
      setThemeColors(getThemeColors());
    };

    addEventListener('storage', onStorage);

    return () => {
      removeEventListener('storage', onStorage);
    };
  }, []);

  return { theme, themeColors };
};

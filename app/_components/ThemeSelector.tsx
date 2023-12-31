'use client';

import { setTheme, useTheme } from '@/_lib/client/theme';
import { Dropdown } from './inputs/Dropdown';

const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
];

export function ThemeSelector() {
  const { theme } = useTheme();

  const onChange = (theme: string) => {
    setTheme(theme);
  };

  return theme ? (
    <Dropdown
      onChange={onChange}
      options={THEMES.map(theme => ({ label: theme, value: theme }))}
      selected={theme}
      wide={true}
      dropdownPosition="dropdown-top"
    />
  ) : (
    <></>
  );
}

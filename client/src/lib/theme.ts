export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export const getTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' ? 'light' : 'dark';
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(STORAGE_KEY, theme);
};

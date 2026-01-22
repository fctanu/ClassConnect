import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System theme';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="relative"
      aria-label={`Current theme: ${getLabel()}. Click to cycle.`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center transition-transform duration-200">
        {getIcon()}
      </span>
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}

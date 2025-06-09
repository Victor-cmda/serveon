import { useState, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';

type WaveDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const useThemeTransition = () => {
  const { theme, setTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [waveDirection, setWaveDirection] = useState<WaveDirection>('top-left');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTheme = useCallback(() => {
    if (isTransitioning) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Escolhe uma direção aleatória para a onda
    const directions: WaveDirection[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setWaveDirection(randomDirection);
    
    setIsTransitioning(true);
    
    // Adiciona classes ao body para o efeito de onda
    const body = document.body;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Force hardware acceleration
    body.style.willChange = 'auto';
    
    body.classList.add('theme-wave-transition', 'transitioning');
    body.classList.add(`wave-${randomDirection}`);
    body.classList.add(theme === 'light' ? 'light-to-dark' : 'dark-to-light');
    
    // Change theme after a short delay to allow animation to start
    setTimeout(() => {
      setTheme(newTheme);
    }, 300);
    
    // Remove classes after animation completes (optimized timing)
    timeoutRef.current = setTimeout(() => {
      body.classList.remove(
        'theme-wave-transition', 
        'transitioning',
        `wave-${randomDirection}`,
        'light-to-dark',
        'dark-to-light'
      );
      body.style.willChange = 'auto';
      setIsTransitioning(false);
      timeoutRef.current = null;
    }, 2000); // Reduced from 2000ms to 1000ms
    
  }, [theme, setTheme, isTransitioning]);
  // Cleanup function to clear timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    theme,
    isTransitioning,
    waveDirection,
    toggleTheme,
    cleanup,
  };
};

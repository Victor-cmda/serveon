import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';

type WaveDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const useThemeTransition = () => {
  const { theme, setTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [waveDirection, setWaveDirection] = useState<WaveDirection>('top-left');

  const toggleTheme = useCallback(() => {
    if (isTransitioning) return;
    
    // Escolhe uma direção aleatória para a onda
    const directions: WaveDirection[] = ['top-right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setWaveDirection(randomDirection);
    
    setIsTransitioning(true);
    
    // Adiciona classes ao body para o efeito de onda
    const body = document.body;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    body.classList.add('theme-wave-transition', 'transitioning');
    body.classList.add(`wave-${randomDirection}`);
    body.classList.add(theme === 'light' ? 'light-to-dark' : 'dark-to-light');
    setTimeout(() => {
      setTheme(newTheme);
    }, 300);
    
    // Remove as classes após a animação completa (1 segundo total)
    setTimeout(() => {
      body.classList.remove(
        'theme-wave-transition', 
        'transitioning',
        `wave-${randomDirection}`,
        'light-to-dark',
        'dark-to-light'
      );
      setIsTransitioning(false);
    }, 2000);
    
  }, [theme, setTheme, isTransitioning]);

  return {
    theme,
    isTransitioning,
    waveDirection,
    toggleTheme,
  };
};

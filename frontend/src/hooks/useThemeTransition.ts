import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';

export const useThemeTransition = () => {
  const { theme, setTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayPhase, setOverlayPhase] = useState<'enter' | 'exit' | null>(null);

  const toggleTheme = useCallback(() => {
    if (isTransitioning) return; // Previne múltiplos cliques
    
    setIsTransitioning(true);
    setOverlayPhase('enter');
    
    // Fase 1: Overlay cobre a tela completamente
    setTimeout(() => {
      // Mudança de tema acontece quando o overlay está no máximo
      setTheme(theme === 'light' ? 'dark' : 'light');
      
      // Pequeno delay para garantir que o tema mudou no DOM
      setTimeout(() => {
        setOverlayPhase('exit');
        
        // Fase 2: Overlay sai suavemente
        setTimeout(() => {
          setIsTransitioning(false);
          setOverlayPhase(null);
        }, 400);
      }, 100);
    }, 400);
  }, [theme, setTheme, isTransitioning]);

  return {
    theme,
    isTransitioning,
    overlayPhase,
    toggleTheme,
  };
};

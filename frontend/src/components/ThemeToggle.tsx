import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThemeTransition } from '@/hooks/useThemeTransition';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, isTransitioning, overlayPhase, toggleTheme } = useThemeTransition();

  return (
    <>      {/* Overlay de transição usando portal */}
      {isTransitioning && createPortal(
        <div 
          className={`fixed inset-0 z-[9999] ${
            overlayPhase === 'enter' ? 'theme-overlay-enter' : 'theme-overlay-exit'
          }`}
          style={{
            background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%)',
            backdropFilter: 'blur(8px)'
          }}
        />,
        document.body
      )}
      
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              disabled={isTransitioning}
              className={`text-muted-foreground hover:text-foreground transition-transform hover:scale-110 hover:rotate-12 ${className}`}
            >
              {theme === 'light' ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Alternar tema</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
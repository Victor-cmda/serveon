import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Bell,
  User,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="fixed top-0 z-30 w-full border-b border-border bg-background backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <a
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <span className="font-bold">S</span>
              </div>
              <span className="hidden text-xl font-semibold tracking-tight sm:inline-block">
                Serveon
              </span>
            </a>
          </div>

          <div className="hidden max-w-md flex-1 px-4 lg:block lg:px-6">
            <div
              className={cn(
                'relative transition-all duration-200 ease-in-out',
                searchFocused ? 'scale-105' : 'scale-100',
              )}
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar no sistema..."
                className={cn(
                  'w-full border-muted bg-muted/30 pl-10 pr-4 transition-all duration-200',
                  searchFocused
                    ? 'border-primary/50 ring-2 ring-primary/20'
                    : 'hover:border-muted/80',
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-muted-foreground hover:text-foreground"
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

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground lg:hidden"
            >
              <Search className="h-[1.2rem] w-[1.2rem]" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="ml-1 flex items-center gap-2 pl-1 pr-2 text-muted-foreground hover:text-foreground sm:gap-3"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src="/avatar-placeholder.png" alt="Usuário" />
                    <AvatarFallback className="bg-muted text-xs">
                      US
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start text-left text-sm sm:flex">
                    <span className="font-medium">Usuário</span>
                    <span className="text-xs text-muted-foreground">
                      Administrador
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Ajuda</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

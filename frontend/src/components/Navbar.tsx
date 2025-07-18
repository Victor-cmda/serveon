import { Button } from '@/components/ui/button';
import {
  Search,
  User,
  Menu,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchInputWithRouter } from './SearchInput';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-30 w-full border-b border-border bg-background backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 animate-fade-in-down animate-duration-500">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden transition-transform hover:scale-110 hover:rotate-12"
              aria-label="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <a
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white transition-transform hover:scale-105">
                <span className="font-bold">S</span>
              </div>
              <span className="hidden text-xl font-semibold tracking-tight sm:inline-block transition-transform hover:scale-105">
                Serveon
              </span>
            </a>
          </div>

          <div className="hidden max-w-md flex-1 px-4 lg:block lg:px-6">
            <SearchInputWithRouter />
          </div>          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground lg:hidden transition-transform hover:scale-110 hover:rotate-12"
            >
              <Search className="h-[1.2rem] w-[1.2rem]" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="ml-1 flex items-center gap-2 pl-1 pr-2 text-muted-foreground hover:text-foreground sm:gap-3 transition-transform hover:scale-105"
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

import {
  Search,
  User,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  PanelLeftOpen,
  PanelLeftClose,
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
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const Navbar = ({ sidebarCollapsed = false, onToggleSidebar }: NavbarProps) => {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 z-30 w-full border-b border-border bg-background backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
    >
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="hidden lg:flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-200 hover:bg-muted"
              aria-label="Toggle Sidebar"
            >
              <AnimatePresence mode="wait">
                {sidebarCollapsed ? (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PanelLeftOpen className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Logo */}
            <motion.a
              href="/"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md"
              >
                <span className="font-bold">S</span>
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="hidden text-xl font-semibold tracking-tight sm:inline-block"
              >
                Serveon
              </motion.span>
            </motion.a>

            {/* Mobile Menu Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-md transition-colors duration-200 hover:bg-muted"
              aria-label="Toggle Mobile Menu"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="hidden max-w-md flex-1 px-4 lg:block lg:px-6"
          >
            <SearchInputWithRouter />
          </motion.div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ThemeToggle />
            </motion.div>

            {/* Mobile Search Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-muted"
            >
              <Search className="h-[1.2rem] w-[1.2rem]" />
            </motion.button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="ml-1 flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-muted sm:gap-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src="/avatar-placeholder.png" alt="Usuário" />
                      <AvatarFallback className="bg-muted text-xs">
                        US
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="hidden flex-col items-start text-left text-sm sm:flex">
                    <span className="font-medium">Usuário</span>
                    <span className="text-xs text-muted-foreground">
                      Administrador
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: 0 }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </motion.div>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  <span>Ajuda</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

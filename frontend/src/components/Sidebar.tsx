import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Package,
  FileText,
  Settings,
  MapPin,
  Globe,
  Map,
  CreditCard,
  Truck,
  Sparkles,
} from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar = () => {
  const location = useLocation();
  const mainMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/',
    },
    {
      id: 'customers',
      title: 'Clientes',
      icon: <Users className="h-5 w-5" />,
      path: '/customers',
    },
    {
      id: 'suppliers',
      title: 'Fornecedores',
      icon: <Truck className="h-5 w-5" />,
      path: '/suppliers',
    },
    {
      id: 'products',
      title: 'Produtos',
      icon: <Package className="h-5 w-5" />,
      path: '/products',
    },
    {
      id: 'invoices',
      title: 'Notas Fiscais',
      icon: <FileText className="h-5 w-5" />,
      path: '/invoices',
    },
  ];

  const locationMenuItems: MenuItem[] = [
    {
      id: 'countries',
      title: 'Países',
      icon: <Globe className="h-5 w-5" />,
      path: '/countries',
    },
    {
      id: 'states',
      title: 'Estados',
      icon: <Map className="h-5 w-5" />,
      path: '/states',
    },
    {
      id: 'cities',
      title: 'Cidades',
      icon: <MapPin className="h-5 w-5" />,
      path: '/cities',
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      id: 'payment-methods',
      title: 'Métodos de Pagamento',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/payment-methods',
    },
    {
      id: 'payment-terms',
      title: 'Condições de Pagamento',
      icon: <FileText className="h-5 w-5" />,
      path: '/payment-terms',
    },
    {
      id: 'settings',
      title: 'Configurações',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
    },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };
  return (
    <aside
      id="sidebar"
      className="fixed left-0 top-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-16 transition-all duration-300 ease-in-out lg:flex"
      aria-label="Sidebar"
    >
      <div className="relative flex min-h-0 flex-1 flex-col backdrop-blur-md bg-card/80 shadow-lg pt-0">
        <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-6">
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Menu Principal</span>
            </div>
          </div>

          <div className="flex-1 space-y-2 px-4">
            {' '}            {mainMenuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105',
                  isActive(item.path)
                    ? 'bg-primary/20 text-primary shadow-lg'
                    : 'hover:bg-accent/50 hover:text-accent-foreground hover:shadow-md',
                )}
                asChild
              >
                <NavLink to={item.path} className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              </Button>
            ))}
            <div className="pt-6 mt-6 space-y-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  🗺️ Localização
                </h3>
              </div>{' '}              {locationMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105',
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary shadow-lg'
                      : 'hover:bg-accent/50 hover:text-accent-foreground hover:shadow-md',
                  )}
                  asChild
                >
                  <NavLink to={item.path} className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </NavLink>
                </Button>
              ))}
            </div>
            <div className="pt-6 mt-6 space-y-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Settings className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  ⚙️ Administração
                </h3>
              </div>{' '}              {settingsMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105',
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary shadow-lg'
                      : 'hover:bg-accent/50 hover:text-accent-foreground hover:shadow-md',
                  )}
                  asChild
                >
                  <NavLink to={item.path} className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </NavLink>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

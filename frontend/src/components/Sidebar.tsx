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
      className="fixed left-0 top-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-16 transition-all duration-200 ease-in-out lg:flex"
      aria-label="Sidebar"
    >
      <div className="relative flex min-h-0 flex-1 flex-col border-r border-border bg-background pt-0">
        <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
          <div className="flex-1 space-y-1 px-3">
            {mainMenuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start px-3',
                  isActive(item.path)
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )}
                asChild
              >
                <NavLink to={item.path}>
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </NavLink>
              </Button>
            ))}

            <div className="pt-5 mt-5 space-y-2 border-t border-border">
              <h3 className="px-3 text-xs font-semibold uppercase text-muted-foreground">
                Localização
              </h3>
              {locationMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start px-3',
                    isActive(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                  asChild
                >
                  <NavLink to={item.path}>
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </NavLink>
                </Button>
              ))}
            </div>

            <div className="pt-5 mt-5 space-y-2 border-t border-border">
              <h3 className="px-3 text-xs font-semibold uppercase text-muted-foreground">
                Administração
              </h3>
              {settingsMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start px-3',
                    isActive(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                  asChild
                >
                  <NavLink to={item.path}>
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
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

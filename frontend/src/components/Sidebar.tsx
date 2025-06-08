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
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
}

interface MenuCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  color: string;
}

const Sidebar = () => {
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['main'])
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const dashboardItem: MenuItem = {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Home className="h-4 w-4" />,
    path: '/',
  };

  const categories: MenuCategory[] = [
    {
      id: 'main',
      title: 'Gestão Principal',
      icon: <Package className="h-4 w-4" />,
      color: 'blue',
      items: [
        {
          id: 'customers',
          title: 'Clientes',
          icon: <Users className="h-4 w-4" />,
          path: '/customers',
        },
        {
          id: 'suppliers',
          title: 'Fornecedores',
          icon: <Truck className="h-4 w-4" />,
          path: '/suppliers',
        },
        {
          id: 'products',
          title: 'Produtos',
          icon: <Package className="h-4 w-4" />,
          path: '/products',
        },
        {
          id: 'invoices',
          title: 'Notas Fiscais',
          icon: <FileText className="h-4 w-4" />,
          path: '/invoices',
        },
      ],
    },
    {
      id: 'location',
      title: 'Localização',
      icon: <Globe className="h-4 w-4" />,
      color: 'green',
      items: [
        {
          id: 'countries',
          title: 'Países',
          icon: <Globe className="h-4 w-4" />,
          path: '/countries',
        },
        {
          id: 'states',
          title: 'Estados',
          icon: <Map className="h-4 w-4" />,
          path: '/states',
        },
        {
          id: 'cities',
          title: 'Cidades',
          icon: <MapPin className="h-4 w-4" />,
          path: '/cities',
        },
      ],
    },
    {
      id: 'admin',
      title: 'Administração',
      icon: <Settings className="h-4 w-4" />,
      color: 'purple',
      items: [
        {
          id: 'payment-methods',
          title: 'Métodos de Pagamento',
          icon: <CreditCard className="h-4 w-4" />,
          path: '/payment-methods',
        },
        {
          id: 'payment-terms',
          title: 'Condições de Pagamento',
          icon: <FileText className="h-4 w-4" />,
          path: '/payment-terms',
        },
        {
          id: 'settings',
          title: 'Configurações',
          icon: <Settings className="h-4 w-4" />,
          path: '/settings',
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getColorClasses = (color: string, variant: 'light' | 'medium' | 'dark' = 'medium') => {
    const colors = {
      blue: {
        light: 'bg-blue-50 text-blue-600 border-blue-200',
        medium: 'bg-blue-500 text-white',
        dark: 'bg-blue-600 text-white',
      },
      green: {
        light: 'bg-green-50 text-green-600 border-green-200',
        medium: 'bg-green-500 text-white',
        dark: 'bg-green-600 text-white',
      },
      purple: {
        light: 'bg-purple-50 text-purple-600 border-purple-200',
        medium: 'bg-purple-500 text-white',
        dark: 'bg-purple-600 text-white',
      },
    };
    return colors[color as keyof typeof colors]?.[variant] || colors.blue[variant];
  };

  return (
    <aside
      id="sidebar"
      className="fixed left-0 top-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-16 transition-all duration-300 ease-in-out lg:flex bg-background border-r border-border"
      aria-label="Sidebar"
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Kaneko System</h2>
          <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {/* Dashboard - Always visible */}
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start h-10 px-3 rounded-lg transition-all duration-200',
                isActive(dashboardItem.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted'
              )}
              asChild
            >
              <NavLink to={dashboardItem.path}>
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'p-1.5 rounded-md',
                    isActive(dashboardItem.path)
                      ? 'bg-primary-foreground/20'
                      : 'bg-muted'
                  )}>
                    {dashboardItem.icon}
                  </div>
                  <span className="font-medium">{dashboardItem.title}</span>
                </div>
              </NavLink>
            </Button>

            <div className="h-2" />

            {/* Categories */}
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              const hasActiveItem = category.items.some(item => isActive(item.path));
              
              return (
                <div key={category.id} className="space-y-1">
                  {/* Category Header */}
                  <Button
                    variant="ghost"
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      'w-full justify-between h-9 px-3 rounded-lg transition-all duration-200',
                      hasActiveItem 
                        ? 'bg-muted text-foreground' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full transition-colors duration-200',
                        getColorClasses(category.color, 'medium')
                      )} />
                      <span className="text-sm font-medium">{category.title}</span>
                    </div>
                    <ChevronRight 
                      className={cn(
                        'h-3 w-3 transition-transform duration-200',
                        isExpanded && 'rotate-90'
                      )} 
                    />
                  </Button>

                  {/* Category Items */}
                  <div className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isExpanded 
                      ? 'max-h-96 opacity-100' 
                      : 'max-h-0 opacity-0'
                  )}>
                    <div className="pl-4 pr-1 space-y-1">
                      {category.items.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className={cn(
                            'w-full justify-start h-8 px-3 rounded-md transition-all duration-200 text-sm',
                            isActive(item.path)
                              ? cn(
                                  'text-foreground font-medium shadow-sm border',
                                  getColorClasses(category.color, 'light')
                                )
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                          asChild
                        >
                          <NavLink to={item.path}>
                            <div className="flex items-center space-x-2">
                              <div className={cn(
                                'transition-colors duration-200',
                                isActive(item.path) && `text-${category.color}-600`
                              )}>
                                {item.icon}
                              </div>
                              <span>{item.title}</span>
                            </div>
                          </NavLink>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Sistema Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

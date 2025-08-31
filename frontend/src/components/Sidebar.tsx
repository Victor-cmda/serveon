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
  Building2,
  Briefcase,
  Tags,
  Layers,
  Scale,
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

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar = ({ collapsed = false }: SidebarProps) => {
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
      color: 'blue',      items: [        {
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
          id: 'transporters',
          title: 'Transportadoras',
          icon: <Truck className="h-4 w-4" />,
          path: '/transporters',
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
        },      ],
    },
    {
      id: 'hr',
      title: 'Recursos Humanos',
      icon: <Users className="h-4 w-4" />,
      color: 'orange',
      items: [
        {
          id: 'employees',
          title: 'Funcionários',
          icon: <Users className="h-4 w-4" />,
          path: '/employees',
        },
        {
          id: 'departments',
          title: 'Departamentos',
          icon: <Building2 className="h-4 w-4" />,
          path: '/departments',
        },
        {
          id: 'positions',
          title: 'Cargos',
          icon: <Briefcase className="h-4 w-4" />,
          path: '/positions',
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
    },    {
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
    {
      id: 'catalog',
      title: 'Cadastros de Produtos',
      icon: <Package className="h-4 w-4" />,
      color: 'indigo',
      items: [
        {
          id: 'categories',
          title: 'Categorias',
          icon: <Layers className="h-4 w-4" />,
          path: '/categories',
        },
        {
          id: 'brands',
          title: 'Marcas',
          icon: <Tags className="h-4 w-4" />,
          path: '/brands',
        },
        {
          id: 'unit-measures',
          title: 'Unidades de Medida',
          icon: <Scale className="h-4 w-4" />,
          path: '/unit-measures',
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };  const getColorClasses = (color: string, variant: 'light' | 'medium' | 'dark' = 'medium') => {
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
      orange: {
        light: 'bg-orange-50 text-orange-600 border-orange-200',
        medium: 'bg-orange-500 text-white',
        dark: 'bg-orange-600 text-white',
      },
      purple: {
        light: 'bg-purple-50 text-purple-600 border-purple-200',
        medium: 'bg-purple-500 text-white',
        dark: 'bg-purple-600 text-white',
      },
      indigo: {
        light: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        medium: 'bg-indigo-500 text-white',
        dark: 'bg-indigo-600 text-white',
      },
    };
    return colors[color as keyof typeof colors]?.[variant] || colors.blue[variant];
  };

  return (
    <aside
      id="sidebar"
      className={cn(
        "fixed left-0 top-0 z-20 flex h-full flex-shrink-0 flex-col pt-16 transition-all duration-700 ease-out bg-background border-r border-border transform origin-left",
        // Mobile behavior: hidden by default, show when not collapsed
        "lg:flex",
        collapsed ? "hidden lg:block lg:w-16 shadow-sm scale-x-95 -translate-x-1" : "flex w-64 shadow-xl scale-x-100 translate-x-0"
      )}
      style={{
        background: collapsed 
          ? 'linear-gradient(135deg, rgba(var(--muted), 0.3) 0%, rgba(var(--background), 0.8) 100%)'
          : undefined
      }}
      aria-label="Sidebar"
    >
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Animated Background Effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-700 ease-out",
          collapsed ? "opacity-100 scale-110" : "opacity-0 scale-100"
        )} />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {/* Dashboard - Always visible */}
            <Button
              variant="ghost"
              className={cn(
                'w-full h-10 px-3 rounded-lg transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-0.5',
                collapsed ? 'justify-center animate-pulse' : 'justify-start',
                isActive(dashboardItem.path)
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'hover:bg-muted hover:shadow-lg hover:border-primary/20 border border-transparent'
              )}
              asChild
            >
              <NavLink to={dashboardItem.path}>
                <div className={cn(
                  "flex items-center transition-all duration-500 ease-out",
                  collapsed ? "justify-center" : "space-x-3"
                )}>
                  <div className={cn(
                    'p-1.5 rounded-md transition-all duration-500 ease-out transform',
                    collapsed ? 'scale-125 rotate-12 bg-primary/20' : 'scale-100 rotate-0',
                    isActive(dashboardItem.path)
                      ? 'bg-primary-foreground/20 shadow-inner'
                      : 'bg-muted shadow-sm'
                  )}>
                    {dashboardItem.icon}
                  </div>
                  <span className={cn(
                    "font-medium transition-all duration-500 ease-out transform",
                    collapsed ? "opacity-0 scale-0 w-0 -translate-x-4" : "opacity-100 scale-100 w-auto translate-x-0"
                  )}>
                    {dashboardItem.title}
                  </span>
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
                  <div className={cn(
                    "transition-all duration-700 ease-out transform",
                    collapsed ? "opacity-0 h-0 overflow-hidden scale-y-0 -translate-y-2" : "opacity-100 h-auto scale-y-100 translate-y-0"
                  )}>
                    <Button
                      variant="ghost"
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        'w-full justify-between h-9 px-3 rounded-lg transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-0.5',
                        hasActiveItem 
                          ? 'bg-muted text-foreground shadow-lg border border-primary/20' 
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground hover:shadow-lg hover:border-primary/10 border border-transparent'
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full transition-all duration-300 transform',
                          'animate-pulse',
                          getColorClasses(category.color, 'medium')
                        )} />
                        <span className="text-sm font-medium">{category.title}</span>
                      </div>
                      <ChevronRight 
                        className={cn(
                          'h-3 w-3 transition-all duration-300 ease-in-out transform',
                          isExpanded && 'rotate-90 scale-110'
                        )} 
                      />
                    </Button>
                  </div>

                  {/* Category Items */}
                  <div className={cn(
                    'overflow-hidden transition-all duration-500 ease-in-out',
                    collapsed 
                      ? 'max-h-96 opacity-100' 
                      : isExpanded 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                  )}>
                    <div className={cn(
                      "space-y-1 transition-all duration-300",
                      collapsed ? "px-1" : "pl-4 pr-1"
                    )}>
                      {category.items.map((item, index) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className={cn(
                            'w-full h-8 px-3 rounded-md transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-0.5',
                            collapsed ? 'justify-center opacity-80 hover:opacity-100' : 'justify-start',
                            isActive(item.path)
                              ? cn(
                                  'text-foreground font-medium shadow-lg border transform scale-105 bg-gradient-to-r from-primary/10 to-primary/5',
                                  getColorClasses(category.color, 'light')
                                )
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-lg hover:border-primary/10 border border-transparent'
                          )}
                          style={{
                            animationDelay: collapsed ? '0ms' : `${index * 75}ms`,
                            transform: collapsed ? 'rotate(2deg)' : 'rotate(0deg)'
                          }}
                          asChild
                        >
                          <NavLink to={item.path}>
                            <div className={cn(
                              "flex items-center transition-all duration-500 ease-out",
                              collapsed ? "justify-center" : "space-x-2"
                            )}>
                              <div className={cn(
                                'transition-all duration-500 ease-out transform',
                                collapsed ? 'scale-125 rotate-12' : 'scale-100 rotate-0',
                                isActive(item.path) ? `text-${category.color}-600 drop-shadow-sm` : ''
                              )}>
                                {item.icon}
                              </div>
                              <span className={cn(
                                "transition-all duration-500 ease-out transform",
                                collapsed ? "opacity-0 scale-0 w-0 -translate-x-3" : "opacity-100 scale-100 w-auto translate-x-0"
                              )}>
                                {item.title}
                              </span>
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

        {/* Collapsed Mode Floating Icons */}
        {collapsed && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-1 h-1 bg-primary/30 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-1 h-1 bg-primary/20 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-1 h-1 bg-primary/30 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

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
  ChevronDown,
  Building2,
  Briefcase,
  Tags,
  Layers,
  Scale,
  ShoppingCart,
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
      items: [
        {
          id: 'purchases',
          title: 'Compras',
          icon: <ShoppingCart className="h-4 w-4" />,
          path: '/purchases',
        },
        {
          id: 'sales',
          title: 'Vendas',
          icon: <ShoppingCart className="h-4 w-4" />,
          path: '/sales',
        },
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
        },
      ],
    },
    {
      id: 'hr',
      title: 'Recursos Humanos',
      icon: <Users className="h-4 w-4" />,
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
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-full bg-background border-r border-border pt-16 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="h-full overflow-y-auto px-3 py-4">
        {/* Dashboard */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10",
              collapsed && "justify-center px-0",
              isActive(dashboardItem.path) 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted hover:text-foreground"
            )}
            asChild
          >
            <NavLink to={dashboardItem.path}>
              <div className="flex items-center gap-3">
                {dashboardItem.icon}
                {!collapsed && <span className="font-medium">{dashboardItem.title}</span>}
              </div>
            </NavLink>
          </Button>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const hasActiveItem = category.items.some(item => isActive(item.path));
            
            return (
              <div key={category.id}>
                {/* Category Header */}
                {!collapsed && (
                  <Button
                    variant="ghost"
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "w-full justify-between h-9 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted",
                      hasActiveItem && "text-foreground bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.title}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )} 
                    />
                  </Button>
                )}

                {/* Category Items */}
                <div className={cn(
                  "space-y-1",
                  !collapsed && !isExpanded && "hidden",
                  !collapsed && "ml-2 mt-1"
                )}>
                  {category.items.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-8 text-sm",
                        collapsed ? "justify-center px-0" : "pl-6",
                        isActive(item.path) 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      asChild
                    >
                      <NavLink to={item.path}>
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {!collapsed && <span>{item.title}</span>}
                        </div>
                      </NavLink>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

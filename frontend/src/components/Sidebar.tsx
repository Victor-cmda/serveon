import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
  Receipt,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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
          id: 'accounts-payable',
          title: 'Contas a Pagar',
          icon: <Receipt className="h-4 w-4" />,
          path: '/accounts-payable',
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
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-20 h-full bg-background border-r border-border pt-16"
      >
        <nav className="h-full overflow-y-auto overflow-x-hidden px-3 py-4">
          {/* Dashboard */}
          <motion.div 
            className="mb-6"
            layout
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <NavLink to={dashboardItem.path}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'flex items-center gap-3 h-10 rounded-md px-3 transition-colors duration-200',
                  collapsed && 'justify-center px-0',
                  isActive(dashboardItem.path)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted hover:text-foreground'
                )}
              >
                {dashboardItem.icon}
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {dashboardItem.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          </motion.div>

          {/* Categories */}
          <div className="space-y-2">
            {categories.map((category, categoryIndex) => {
              const isExpanded = expandedCategories.has(category.id);
              const hasActiveItem = category.items.some(item => isActive(item.path));
              const isHovered = hoveredCategory === category.id;

              return (
                <motion.div 
                  key={category.id}
                  layout
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="relative"
                  data-category-index={categoryIndex}
                  onMouseEnter={() => collapsed && setHoveredCategory(category.id)}
                  onMouseLeave={() => collapsed && setHoveredCategory(null)}
                >
                  {/* Category Header */}
                  {!collapsed ? (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        'w-full flex items-center justify-between h-9 px-3 rounded-md text-sm font-medium transition-colors duration-200',
                        hasActiveItem 
                          ? 'text-foreground bg-muted' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span>{category.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'flex items-center justify-center h-10 rounded-md cursor-pointer transition-colors duration-200',
                        hasActiveItem 
                          ? 'bg-muted text-foreground' 
                          : 'hover:bg-muted hover:text-foreground text-muted-foreground'
                      )}
                    >
                      {category.icon}
                    </motion.div>
                  )}

                  {/* Expanded Category Items */}
                  <AnimatePresence initial={false}>
                    {!collapsed && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 ml-2 mt-1">
                          {category.items.map((item) => (
                            <NavLink key={item.id} to={item.path}>
                              <motion.div
                                whileHover={{ x: 4, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className={cn(
                                  'flex items-center gap-3 h-8 pl-6 pr-3 rounded-md text-sm transition-colors duration-200',
                                  isActive(item.path)
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                              >
                                {item.icon}
                                <span>{item.title}</span>
                              </motion.div>
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </nav>
      </motion.aside>

      {/* Collapsed Popovers - Rendered outside sidebar to avoid overflow issues */}
      <AnimatePresence>
        {collapsed && hoveredCategory && categories.map((category, categoryIndex) => {
          if (category.id !== hoveredCategory) return null;
          
          // Calculate position based on category index
          // Dashboard takes ~88px (64px top padding + 24px margin)
          // Each category is ~48px (40px height + 8px spacing)
          const topPosition = 88 + categoryIndex * 48;
          
          return (
            <motion.div
              key={`popover-${category.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: '72px',
                top: `${topPosition}px`,
                zIndex: 1000,
                backgroundColor: 'hsl(var(--popover))',
              }}
              className="min-w-[200px] bg-popover border border-border rounded-md shadow-2xl p-2 backdrop-blur-sm"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border mb-2">
                {category.title}
              </div>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <NavLink key={item.id} to={item.path}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200',
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'hover:bg-muted hover:text-foreground text-muted-foreground'
                      )}
                    >
                      {item.icon}
                      <span className="whitespace-nowrap">{item.title}</span>
                    </motion.div>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

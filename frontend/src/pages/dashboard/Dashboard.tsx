// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart3,
  Activity,
  Building2,
  Truck,
  Tags,
  Briefcase,
  UserCog,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Boxes,
  Store,
  PackageOpen
} from 'lucide-react';
import { 
  customerApi, 
  supplierApi, 
  productApi, 
  salesApi, 
  purchaseApi,
  employeeApi,
  departmentApi,
  positionApi,
  brandApi,
  categoryApi,
  unitMeasureApi,
  transporterApi,
  accountsPayableApi
} from '@/services/api';


interface DashboardStats {
  customers: number;
  suppliers: number;
  products: number;
  employees: number;
  departments: number;
  positions: number;
  brands: number;
  categories: number;
  unitMeasures: number;
  transporters: number;
  sales: number;
  purchases: number;
  accountsPayable: number;
  overdueAccounts: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    customers: 0,
    suppliers: 0,
    products: 0,
    employees: 0,
    departments: 0,
    positions: 0,
    brands: 0,
    categories: 0,
    unitMeasures: 0,
    transporters: 0,
    sales: 0,
    purchases: 0,
    accountsPayable: 0,
    overdueAccounts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          customers,
          suppliers,
          products,
          employees,
          departments,
          positions,
          brands,
          categories,
          unitMeasures,
          transporters,
          sales,
          purchases,
          accountsPayable,
          overdueAccounts,
        ] = await Promise.allSettled([
          customerApi.getAll(),
          supplierApi.getAll(),
          productApi.getAll(),
          employeeApi.getAll(),
          departmentApi.getAll(),
          positionApi.getAll(),
          brandApi.getAll(),
          categoryApi.getAll(),
          unitMeasureApi.getAll(),
          transporterApi.getAll(),
          salesApi.getAll(),
          purchaseApi.getAll(),
          accountsPayableApi.getAll(),
          accountsPayableApi.getOverdue(),
        ]);

        setStats({
          customers: customers.status === 'fulfilled' ? customers.value.length : 0,
          suppliers: suppliers.status === 'fulfilled' ? suppliers.value.length : 0,
          products: products.status === 'fulfilled' ? products.value.length : 0,
          employees: employees.status === 'fulfilled' ? employees.value.length : 0,
          departments: departments.status === 'fulfilled' ? departments.value.length : 0,
          positions: positions.status === 'fulfilled' ? positions.value.length : 0,
          brands: brands.status === 'fulfilled' ? brands.value.length : 0,
          categories: categories.status === 'fulfilled' ? categories.value.length : 0,
          unitMeasures: unitMeasures.status === 'fulfilled' ? unitMeasures.value.length : 0,
          transporters: transporters.status === 'fulfilled' ? transporters.value.length : 0,
          sales: sales.status === 'fulfilled' ? sales.value.length : 0,
          purchases: purchases.status === 'fulfilled' ? purchases.value.length : 0,
          accountsPayable: accountsPayable.status === 'fulfilled' ? accountsPayable.value.length : 0,
          overdueAccounts: overdueAccounts.status === 'fulfilled' ? overdueAccounts.value.length : 0,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com saudação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {greeting}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema de gestão empresarial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <Badge variant="secondary" className="bg-muted">
            <BarChart3 className="h-3 w-3 mr-1" />
            Sistema de Gestão ServeOn
          </Badge>
        </div>
      </div>

      {/* Alertas Importantes */}
      {!isLoading && stats.overdueAccounts > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Atenção: Contas em atraso
                </h3>
                <p className="text-sm text-red-700 dark:text-red-200">
                  Você tem <strong>{stats.overdueAccounts}</strong> conta(s) a pagar vencida(s).{' '}
                  <Link to="/accounts-payable" className="underline font-medium">
                    Ver detalhes
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de estatísticas principais - Operacional */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Operacional
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : stats.sales}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Total de vendas</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/sales" className="text-xs">Ver todas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras</CardTitle>
              <PackageOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : stats.purchases}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Total de compras</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/purchases" className="text-xs">Ver todas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${stats.overdueAccounts > 0 ? 'border-l-red-500' : 'border-l-green-500'} hover:shadow-lg transition-all duration-300`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
              <CreditCard className={`h-4 w-4 ${stats.overdueAccounts > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.overdueAccounts > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : stats.accountsPayable}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {stats.overdueAccounts > 0 ? `${stats.overdueAccounts} em atraso` : 'Em dia'}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/accounts-payable" className="text-xs">Gerenciar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Boxes className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : stats.products}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Cadastrados</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/products" className="text-xs">Gerenciar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pessoas e Relacionamentos */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Pessoas e Relacionamentos
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : stats.customers}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Total cadastrado</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/customers" className="text-xs">Gerenciar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
              <Store className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : stats.suppliers}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Total cadastrado</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/suppliers" className="text-xs">Gerenciar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <UserCog className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : stats.employees}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Total de colaboradores</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/employees" className="text-xs">Gerenciar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transportadoras</CardTitle>
              <Truck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : stats.transporters}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Total cadastrado</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/transporters" className="text-xs">Gerenciar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estrutura Organizacional e Produtos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Estrutura Organizacional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Estrutura Organizacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Departamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {isLoading ? '...' : stats.departments}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/departments">Gerenciar</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <UserCog className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Cargos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {isLoading ? '...' : stats.positions}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/positions">Gerenciar</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Funcionários Ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {isLoading ? '...' : stats.employees}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/employees">Ver todos</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestão de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Gestão de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Tags className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Categorias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {isLoading ? '...' : stats.categories}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/categories">Gerenciar</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Marcas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {isLoading ? '...' : stats.brands}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/brands">Gerenciar</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Unidades de Medida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {isLoading ? '...' : stats.unitMeasures}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/unit-measures">Gerenciar</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Resumo do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? '...' : stats.sales + stats.purchases}
              </div>
              <div className="text-sm text-muted-foreground">Transações Totais</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.sales} vendas + {stats.purchases} compras
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? '...' : stats.customers + stats.suppliers}
              </div>
              <div className="text-sm text-muted-foreground">Parceiros Comerciais</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.customers} clientes + {stats.suppliers} fornecedores
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? '...' : stats.departments + stats.positions}
              </div>
              <div className="text-sm text-muted-foreground">Estrutura Corporativa</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.departments} departamentos + {stats.positions} cargos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-auto py-4 flex flex-col gap-2">
              <Link to="/sales">
                <ShoppingCart className="h-5 w-5" />
                <span>Nova Venda</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Link to="/purchases">
                <PackageOpen className="h-5 w-5" />
                <span>Nova Compra</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Link to="/customers">
                <Users className="h-5 w-5" />
                <span>Novo Cliente</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Link to="/products">
                <Package className="h-5 w-5" />
                <span>Novo Produto</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
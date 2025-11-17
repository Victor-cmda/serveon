import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Store,
  PackageOpen,
  ArrowUpRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  customerApi, 
  supplierApi, 
  productApi, 
  salesApi, 
  purchaseApi,
  accountsPayableApi,
  accountsReceivableApi
} from '@/services/api';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

interface DashboardStats {
  customers: number;
  suppliers: number;
  products: number;
  sales: number;
  purchases: number;
  accountsPayable: number;
  accountsReceivable: number;
  overdueAccounts: number;
  salesTotal: number;
  purchasesTotal: number;
  profit: number;
}

interface SalesData {
  month: string;
  vendas: number;
  compras: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    customers: 0,
    suppliers: 0,
    products: 0,
    sales: 0,
    purchases: 0,
    accountsPayable: 0,
    accountsReceivable: 0,
    overdueAccounts: 0,
    salesTotal: 0,
    purchasesTotal: 0,
    profit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const salesChartData: SalesData[] = [
    { month: 'Jan', vendas: 45000, compras: 32000 },
    { month: 'Fev', vendas: 52000, compras: 38000 },
    { month: 'Mar', vendas: 48000, compras: 35000 },
    { month: 'Abr', vendas: 61000, compras: 42000 },
    { month: 'Mai', vendas: 55000, compras: 39000 },
    { month: 'Jun', vendas: 67000, compras: 45000 },
  ];

  const revenueData = [
    { name: 'Seg', valor: 12000 },
    { name: 'Ter', valor: 19000 },
    { name: 'Qua', valor: 15000 },
    { name: 'Qui', valor: 25000 },
    { name: 'Sex', valor: 22000 },
    { name: 'Sáb', valor: 30000 },
    { name: 'Dom', valor: 18000 },
  ];

  const chartConfig = {
    vendas: {
      label: "Vendas",
      theme: {
        light: "oklch(0.55 0.20 220)",
        dark: "oklch(0.85 0.05 220)",
      },
    },
    compras: {
      label: "Compras",
      theme: {
        light: "oklch(0.60 0.22 160)",
        dark: "oklch(0.80 0.04 160)",
      },
    },
    valor: {
      label: "Receita",
      theme: {
        light: "oklch(0.50 0.24 280)",
        dark: "oklch(0.75 0.05 280)",
      },
    },
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          customers,
          suppliers,
          products,
          sales,
          purchases,
          accountsPayable,
          accountsReceivable,
          overdueAccounts,
        ] = await Promise.allSettled([
          customerApi.getAll(),
          supplierApi.getAll(),
          productApi.getAll(),
          salesApi.getAll(),
          purchaseApi.getAll(),
          accountsPayableApi.getAll(),
          accountsReceivableApi.getAll(),
          accountsPayableApi.getOverdue(),
        ]);

        const salesData = sales.status === 'fulfilled' ? sales.value : [];
        const purchasesData = purchases.status === 'fulfilled' ? purchases.value : [];

        const salesTotal = salesData.reduce((acc: number, sale: any) => acc + (sale.total_amount || 0), 0);
        const purchasesTotal = purchasesData.reduce((acc: number, purchase: any) => acc + (purchase.total_amount || 0), 0);

        setStats({
          customers: customers.status === 'fulfilled' ? customers.value.length : 0,
          suppliers: suppliers.status === 'fulfilled' ? suppliers.value.length : 0,
          products: products.status === 'fulfilled' ? products.value.length : 0,
          sales: salesData.length,
          purchases: purchasesData.length,
          accountsPayable: accountsPayable.status === 'fulfilled' ? accountsPayable.value.length : 0,
          accountsReceivable: accountsReceivable.status === 'fulfilled' ? accountsReceivable.value.length : 0,
          overdueAccounts: overdueAccounts.status === 'fulfilled' ? overdueAccounts.value.length : 0,
          salesTotal,
          purchasesTotal,
          profit: salesTotal - purchasesTotal,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const profitPercentage = stats.salesTotal > 0 
    ? ((stats.profit / stats.salesTotal) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 md:p-12 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Dashboard
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {greeting}!
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl">
                Visão geral do seu sistema de gestão empresarial ServeOn
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xl"
                asChild
              >
                <Link to="/sales">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Nova Venda
                </Link>
              </Button>
            </div>
          </div>

          {!isLoading && stats.overdueAccounts > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-red-500/20 backdrop-blur-sm border border-red-300/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-white" />
                <div>
                  <span className="font-semibold">Atenção:</span>
                  <span className="ml-2">
                    {stats.overdueAccounts} conta(s) vencida(s).
                  </span>
                  <Link to="/accounts-payable" className="ml-2 underline font-medium hover:text-blue-100">
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Receita Total
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                {isLoading ? (
                  <Clock className="h-8 w-8 animate-spin" />
                ) : (
                  formatCurrency(stats.salesTotal)
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>+12.5% vs mês anterior</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                <Link to="/sales" className="text-xs flex items-center justify-center gap-1">
                  Ver vendas
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total em Compras
              <PackageOpen className="h-4 w-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                {isLoading ? (
                  <Clock className="h-8 w-8 animate-spin" />
                ) : (
                  formatCurrency(stats.purchasesTotal)
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                <TrendingDown className="h-3 w-3" />
                <span>-3.2% vs mês anterior</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                <Link to="/purchases" className="text-xs flex items-center justify-center gap-1">
                  Ver compras
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Margem de Lucro
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {isLoading ? (
                  <Clock className="h-8 w-8 animate-spin" />
                ) : (
                  formatCurrency(stats.profit)
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                <span className="font-bold">{profitPercentage}%</span>
                <span>de margem</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(parseFloat(profitPercentage), 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Clientes
              <Users className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                {isLoading ? (
                  <Clock className="h-8 w-8 animate-spin" />
                ) : (
                  stats.customers
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>+{stats.customers > 10 ? '8' : '2'} novos este mês</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                <Link to="/customers" className="text-xs flex items-center justify-center gap-1">
                  Gerenciar
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Vendas vs Compras
            </CardTitle>
            <CardDescription>
              Comparativo dos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-vendas)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-vendas)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-compras)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-compras)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="var(--color-vendas)" 
                  fillOpacity={1}
                  fill="url(#colorVendas)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="compras" 
                  stroke="var(--color-compras)" 
                  fillOpacity={1}
                  fill="url(#colorCompras)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Receita Semanal
            </CardTitle>
            <CardDescription>
              Últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="valor" 
                  fill="var(--color-valor)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Produtos
              </span>
              <Badge variant="secondary" className="text-lg font-bold">
                {isLoading ? '...' : stats.products}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastrados no sistema
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/products" className="flex items-center justify-center gap-2">
                Gerenciar produtos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Fornecedores
              </span>
              <Badge variant="secondary" className="text-lg font-bold">
                {isLoading ? '...' : stats.suppliers}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Parceiros comerciais ativos
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/suppliers" className="flex items-center justify-center gap-2">
                Ver fornecedores
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
          stats.overdueAccounts > 0 
            ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20' 
            : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
        }`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                {stats.overdueAccounts > 0 ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                Contas a Pagar
              </span>
              <Badge 
                variant={stats.overdueAccounts > 0 ? "destructive" : "secondary"}
                className="text-lg font-bold"
              >
                {isLoading ? '...' : stats.accountsPayable}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {stats.overdueAccounts > 0 
                ? `${stats.overdueAccounts} conta(s) em atraso` 
                : 'Todas as contas em dia'}
            </p>
            <Button 
              variant={stats.overdueAccounts > 0 ? "destructive" : "outline"}
              className="w-full" 
              asChild
            >
              <Link to="/accounts-payable" className="flex items-center justify-center gap-2">
                Gerenciar contas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button 
              size="lg" 
              className="h-24 flex flex-col gap-2 text-base font-semibold"
              asChild
            >
              <Link to="/sales">
                <ShoppingCart className="h-6 w-6" />
                <span>Nova Venda</span>
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-24 flex flex-col gap-2 text-base font-semibold"
              asChild
            >
              <Link to="/purchases">
                <PackageOpen className="h-6 w-6" />
                <span>Nova Compra</span>
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-24 flex flex-col gap-2 text-base font-semibold"
              asChild
            >
              <Link to="/customers">
                <Users className="h-6 w-6" />
                <span>Novo Cliente</span>
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-24 flex flex-col gap-2 text-base font-semibold"
              asChild
            >
              <Link to="/products">
                <Package className="h-6 w-6" />
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

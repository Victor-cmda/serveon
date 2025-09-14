// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  Clock,
  BarChart3,
  Globe,
  Map,
  MapPin,
  Target,
  Calendar,
  Activity,
  Building2
} from 'lucide-react';
import { customerApi, supplierApi } from '@/services/api';

// Dados de vendas do sistema
const salesData = {
  today: {
    revenue: 2850.75,
    orders: 45,
    bestSeller: "Produto Premium",
    trend: "+12%"
  },
  week: {
    revenue: 18420.30,
    orders: 287,
    avgOrder: 64.15,
    trend: "+8%"
  },
  month: {
    revenue: 76850.50,
    orders: 1256,
    newCustomers: 89,
    trend: "+15%"
  }
};

const topProducts = [
  { name: "Produto Premium", sales: 156, revenue: 4680, trend: 12 },
  { name: "Serviço Personalizado", sales: 89, revenue: 7120, trend: 8 },
  { name: "Item Padrão", sales: 234, revenue: 3510, trend: -3 },
  { name: "Pacote Especial", sales: 98, revenue: 2940, trend: 15 },
  { name: "Produto Deluxe", sales: 67, revenue: 6030, trend: 22 }
];

const monthlyGoals = {
  revenue: { current: 76850.50, target: 85000, percentage: 90 },
  orders: { current: 1256, target: 1400, percentage: 90 },
  newCustomers: { current: 89, target: 100, percentage: 89 }
};

const Dashboard = () => {
  const [customerCount, setCustomerCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [customers, suppliers] = await Promise.all([
          customerApi.getAll(),
          supplierApi.getAll()
        ]);

        setCustomerCount(customers.length);
        setSupplierCount(suppliers.length);
      } catch (error) {
        console.error('Erro ao carregar contadores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCounts();
  }, []);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com saudação profissional */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {greeting}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho do seu negócio em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <Badge variant="secondary" className="bg-muted">
            <BarChart3 className="h-3 w-3 mr-1" />
            Sistema de Gestão
          </Badge>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              R$ {salesData.today.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {salesData.today.trend} vs ontem
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {salesData.today.orders}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1 text-blue-500" />
              Ticket médio: R$ {(salesData.today.revenue / salesData.today.orders).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Vendido</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">
              {salesData.today.bestSeller}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Activity className="h-3 w-3 mr-1 text-primary" />
              Produto destaque do dia
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {isLoading ? '...' : customerCount}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Building2 className="h-3 w-3 mr-1 text-orange-500" />
              Total cadastrado
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metas mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Metas do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Faturamento</span>
                <span className="font-medium">
                  R$ {monthlyGoals.revenue.current.toLocaleString('pt-BR')} / R$ {monthlyGoals.revenue.target.toLocaleString('pt-BR')}
                </span>
              </div>
              <Progress value={monthlyGoals.revenue.percentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {monthlyGoals.revenue.percentage}% da meta
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pedidos</span>
                <span className="font-medium">
                  {monthlyGoals.orders.current} / {monthlyGoals.orders.target}
                </span>
              </div>
              <Progress value={monthlyGoals.orders.percentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {monthlyGoals.orders.percentage}% da meta
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Novos Clientes</span>
                <span className="font-medium">
                  {monthlyGoals.newCustomers.current} / {monthlyGoals.newCustomers.target}
                </span>
              </div>
              <Progress value={monthlyGoals.newCustomers.percentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {monthlyGoals.newCustomers.percentage}% da meta
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produtos mais vendidos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Produtos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-primary text-primary-foreground' :
                      index === 1 ? 'bg-muted-foreground text-muted' :
                      index === 2 ? 'bg-muted-foreground text-muted' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.sales} vendas
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      R$ {product.revenue.toLocaleString('pt-BR')}
                    </div>
                    <div className={`text-xs flex items-center ${
                      product.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.trend > 0 ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingDown className="h-3 w-3 mr-1" />
                      }
                      {product.trend > 0 ? '+' : ''}{product.trend}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gestão do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Gestão do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Clientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{isLoading ? '...' : customerCount}</Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/customers">Gerenciar</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Fornecedores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{isLoading ? '...' : supplierCount}</Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/suppliers">Gerenciar</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Países</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/countries">Gerenciar</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Map className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Estados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/states">Gerenciar</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Cidades</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/cities">Gerenciar</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo da semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Resumo da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                R$ {salesData.week.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Faturamento Total</div>
              <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {salesData.week.trend} vs semana anterior
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                {salesData.week.orders}
              </div>
              <div className="text-sm text-muted-foreground">Pedidos Realizados</div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(salesData.week.orders / 7)} pedidos/dia em média
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                R$ {salesData.week.avgOrder.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Ticket Médio</div>
              <div className="text-xs text-muted-foreground mt-1">
                Valor médio por pedido
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
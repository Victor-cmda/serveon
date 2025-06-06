// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Candy, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  Clock,
  Star,
  Heart,
  Cake,
  Coffee,
  Globe,
  Map,
  MapPin,
  Target,
  Calendar,
  Trophy
} from 'lucide-react';
import { customerApi, supplierApi } from '@/services/api';

// Simulação de dados de vendas de doces
const salesData = {
  today: {
    revenue: 2850.75,
    orders: 45,
    bestSeller: "Brigadeiros Gourmet",
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

const sweetProducts = [
  { name: "Brigadeiros Gourmet", sales: 156, revenue: 4680, trend: 12 },
  { name: "Tortas Personalizadas", sales: 89, revenue: 7120, trend: 8 },
  { name: "Cupcakes Decorados", sales: 234, revenue: 3510, trend: -3 },
  { name: "Docinhos para Festa", sales: 98, revenue: 2940, trend: 15 },
  { name: "Bolos de Aniversário", sales: 67, revenue: 6030, trend: 22 }
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
      {/* Header com saudação personalizada */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            {greeting}, Doceira! 🍰
          </h1>
          <p className="text-muted-foreground mt-1">
            Vamos adoçar o dia com vendas incríveis! ✨
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Candy className="h-8 w-8 text-pink-500 animate-bounce" />
          <Badge variant="secondary" className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
            <Heart className="h-3 w-3 mr-1 text-pink-500" />
            Doces & Sonhos
          </Badge>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:shadow-lg transition-all duration-300 hover:scale-105">
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

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 hover:shadow-lg transition-all duration-300 hover:scale-105">
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

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Vendido</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
              {salesData.today.bestSeller}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Trophy className="h-3 w-3 mr-1 text-purple-500" />
              Produto destaque do dia
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {isLoading ? '...' : customerCount}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Heart className="h-3 w-3 mr-1 text-orange-500" />
              Clientes fiéis
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metas mensais */}
      <Card className="bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
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
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-amber-600" />
              Top Produtos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sweetProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 text-gray-600'
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
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-slate-600" />
              Gestão do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200">
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

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200">
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

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200">
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

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200">
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

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200">
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
      <Card className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Resumo da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-600">
                R$ {salesData.week.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Faturamento Total</div>
              <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {salesData.week.trend} vs semana anterior
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-teal-600">
                {salesData.week.orders}
              </div>
              <div className="text-sm text-muted-foreground">Pedidos Realizados</div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(salesData.week.orders / 7)} pedidos/dia em média
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-cyan-600">
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
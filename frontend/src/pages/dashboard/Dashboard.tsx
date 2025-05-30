// src/pages/Dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Globe, Map, MapPin, Users, Sparkles, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">
              Sistema Serveon - Gestão Inteligente
            </span>
          </div>
        </div>
        <div className="floating">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
      </div>{' '}
      <p className="text-muted-foreground text-lg">
        ✨ Bem-vindo ao sistema Serveon! Gerencie sua empresa de forma eficiente.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Cards */}
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold">
                👥 Clientes
              </CardTitle>
              <div className="floating">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold mb-2">Gestão de Clientes</div>
              <p className="text-sm text-muted-foreground mb-4">
                🎯 Cadastre e gerencie seus clientes
              </p>{' '}
              <div className="mt-4">
                <Button asChild size="lg" className="w-full">
                  <Link to="/customers" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Gerenciar Clientes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold">
                🌍 Países
              </CardTitle>
              <div className="floating" style={{ animationDelay: '0.5s' }}>
                <Globe className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold mb-2">Gestão de Países</div>
              <p className="text-sm text-muted-foreground mb-4">
                🗺️ Cadastre e gerencie países no sistema
              </p>{' '}
              <div className="mt-4">
                <Button asChild size="lg" className="w-full">
                  <Link to="/countries" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Gerenciar Países
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold">
                🗾 Estados
              </CardTitle>
              <div className="floating" style={{ animationDelay: '1s' }}>
                <Map className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold mb-2">Gestão de Estados</div>
              <p className="text-sm text-muted-foreground mb-4">
                📍 Cadastre e gerencie estados no sistema
              </p>{' '}
              <div className="mt-4">
                <Button asChild size="lg" className="w-full">
                  <Link to="/states" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Gerenciar Estados
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold">
                🏙️ Cidades
              </CardTitle>
              <div className="floating" style={{ animationDelay: '1.5s' }}>
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold mb-2">Gestão de Cidades</div>
              <p className="text-sm text-muted-foreground mb-4">
                🏘️ Cadastre e gerencie cidades no sistema
              </p>{' '}
              <div className="mt-4">
                <Button asChild size="lg" className="w-full">
                  <Link to="/cities" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Gerenciar Cidades
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

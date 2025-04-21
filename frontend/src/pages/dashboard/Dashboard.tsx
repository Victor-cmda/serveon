import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Globe, Map, MapPin, Users } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <p className="text-muted-foreground">
        Bem-vindo ao sistema Serveon! Gerencie sua empresa de forma eficiente.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gestão de Clientes</div>
            <p className="text-xs text-muted-foreground">
              Cadastre e gerencie seus clientes
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/customers">Gerenciar Clientes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Países</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gestão de Países</div>
            <p className="text-xs text-muted-foreground">
              Cadastre e gerencie países no sistema
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/countries">Gerenciar Países</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gestão de Estados</div>
            <p className="text-xs text-muted-foreground">
              Cadastre e gerencie estados no sistema
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/states">Gerenciar Estados</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cidades</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gestão de Cidades</div>
            <p className="text-xs text-muted-foreground">
              Cadastre e gerencie cidades no sistema
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/cities">Gerenciar Cidades</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

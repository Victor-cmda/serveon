import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cityApi, stateApi, countryApi } from '@/services/api';
import { City, State, Country } from '@/types/location';
import { toast } from 'sonner';

const CitiesList = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);

  useEffect(() => {
    fetchCountries();
    fetchStates();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const filtered = states.filter(
        (state) => state.paisId === selectedCountry,
      );
      setFilteredStates(filtered);
      if (
        selectedState &&
        !filtered.some((state) => state.id === selectedState)
      ) {
        setSelectedState('');
      }
    } else {
      setFilteredStates(states);
    }
  }, [selectedCountry, states, selectedState]);

  useEffect(() => {
    let filtered = cities;

    if (selectedState) {
      filtered = filtered.filter((city) => city.estadoId === selectedState);
    } else if (selectedCountry) {
      filtered = filtered.filter((city) => {
        const cityState = states.find((state) => state.id === city.estadoId);
        return cityState && cityState.paisId === selectedCountry;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (city) =>
          city.nome.toLowerCase().includes(searchLower) ||
          (city.codigoIbge &&
            city.codigoIbge.toLowerCase().includes(searchLower)) ||
          (city.estadoNome &&
            city.estadoNome.toLowerCase().includes(searchLower)) ||
          (city.uf && city.uf.toLowerCase().includes(searchLower)),
      );
    }

    setFilteredCities(filtered);
  }, [search, selectedState, selectedCountry, cities, states]);

  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const data = await cityApi.getAll();
      setCities(data);
      setFilteredCities(data);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar a lista de cidades',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const data = await stateApi.getAll();
      setStates(data);
      setFilteredStates(data);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar a lista de estados.',
      });
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await countryApi.getAll();
      setCountries(data);
    } catch (error) {
      console.error('Erro ao buscar países:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar a lista de países.',
      });
    }
  };

  const handleDeleteClick = (city: City) => {
    setCityToDelete(city);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cityToDelete) return;

    try {
      await cityApi.delete(cityToDelete.id);
      setCities(cities.filter((c) => c.id !== cityToDelete.id));
      toast.success('Sucesso', {
        description: `Cidade ${cityToDelete.nome} removida com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao excluir cidade:', error);
      toast.success('Sucesso', {
        description:
          error.message ||
          'Não foi possível excluir a cidade. Verifique se não há referências ativas.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCityToDelete(null);
    }
  };

  const handleCountryFilter = (value: string) => {
    setSelectedCountry(value);
    setSelectedState('');
  };

  const handleStateFilter = (value: string) => {
    setSelectedState(value);
  };

  const clearFilters = () => {
    setSelectedCountry('');
    setSelectedState('');
    setSearch('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cidades</h1>
        <Button asChild>
          <Link to="/cities/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Cidade
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center py-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cidades..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-1 gap-2 items-center flex-wrap">
          <Select value={selectedCountry} onValueChange={handleCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedState}
            onValueChange={handleStateFilter}
            disabled={filteredStates.length === 0}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              {filteredStates.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.nome} ({state.uf})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedCountry || selectedState || search) && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código IBGE</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>UF</TableHead>
              <TableHead>País</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhuma cidade encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredCities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.nome}</TableCell>
                  <TableCell>{city.codigoIbge || '-'}</TableCell>
                  <TableCell>{city.estadoNome}</TableCell>
                  <TableCell>{city.uf}</TableCell>
                  <TableCell>{city.paisNome}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/cities/edit/${city.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(city)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a cidade {cityToDelete?.nome}? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitiesList;

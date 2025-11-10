import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cityApi, stateApi, countryApi } from '../../services/api';
import { City, State, Country } from '../../types/location';
import { toast } from '../../lib/toast';

const CitiesList: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [citiesData, statesData, countriesData] = await Promise.all([
        cityApi.getAll(),
        stateApi.getAll(),
        countryApi.getAll(),
      ]);
      setCities(citiesData);
      setStates(statesData);
      setCountries(countriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os dados',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta cidade?')) {
      try {
        await cityApi.delete(id);
        toast.success('Sucesso', {
          description: 'Cidade excluída com sucesso',
        });
        loadData();
      } catch (error) {
        console.error('Erro ao excluir cidade:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir a cidade',
        });
      }
    }
  };

  const filteredStates = selectedCountry
    ? states.filter(state => state.paisId === Number(selectedCountry))
    : states;
  const filteredCities = cities.filter(city => {
    const matchesSearch = city.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (city.codigoIbge && city.codigoIbge.includes(searchTerm)) ||
      city.id.toString().includes(searchTerm) ||
      (city.estadoNome && city.estadoNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (city.uf && city.uf.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (city.paisNome && city.paisNome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesState = !selectedState || city.estadoId === Number(selectedState);
    const matchesCountry = !selectedCountry || 
      (selectedState ? true : states.find(s => s.id === city.estadoId)?.paisId === Number(selectedCountry));

    return matchesSearch && matchesState && matchesCountry;
  });

  const clearFilters = () => {
    setSelectedCountry('');
    setSelectedState('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Cidades
          </h1>
          <p className="text-muted-foreground">
            Gerencie as cidades do sistema
          </p>
        </div>
        <Link
          to="/cities/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova Cidade
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar cidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedState('');
            }}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todos os países</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id.toString()}>
                {country.nome}
              </option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={filteredStates.length === 0}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todos os estados</option>
            {filteredStates.map((state) => (
              <option key={state.id} value={state.id.toString()}>
                {state.nome} ({state.uf})
              </option>
            ))}
          </select>

          {(selectedCountry || selectedState || searchTerm) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Código
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Cidade
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Código IBGE
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  UF
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  País
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>              {filteredCities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || selectedCountry || selectedState ? 'Nenhuma cidade encontrada.' : 'Nenhuma cidade cadastrada.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCities.map((city) => (
                  <tr key={city.id} className="border-b">
                    <td className="p-4">
                      <div className="font-mono text-sm text-muted-foreground">{city.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{city.nome}</div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm">{city.codigoIbge || '-'}</code>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{city.estadoNome}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{city.uf}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{city.paisNome}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/cities/edit/${city.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(city.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCities.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredCities.length} de {cities.length} cidade(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default CitiesList;

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { stateApi, countryApi } from '../../services/api';
import { State, Country } from '../../types/location';
import { toast } from '../../lib/toast';

const StatesList: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statesData, countriesData] = await Promise.all([
        stateApi.getAll(),
        countryApi.getAll(),
      ]);
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
    if (window.confirm('Tem certeza que deseja excluir este estado?')) {
      try {
        await stateApi.delete(id);
        toast.success('Sucesso', {
          description: 'Estado excluído com sucesso',
        });
        loadData();
      } catch (error) {
        console.error('Erro ao excluir estado:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir o estado',
        });
      }
    }
  };
  const filteredStates = states.filter(state => {
    const matchesSearch = state.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.uf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.id.toString().includes(searchTerm) ||
      (state.paisNome && state.paisNome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCountry = !selectedCountry || state.paisId === Number(selectedCountry);

    return matchesSearch && matchesCountry;
  });

  const clearFilters = () => {
    setSelectedCountry('');
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
            Estados
          </h1>
          <p className="text-muted-foreground">
            Gerencie os estados do sistema
          </p>
        </div>
        <Link
          to="/states/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo Estado
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar estados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todos os países</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id.toString()}>
                {country.nome}
              </option>
            ))}
          </select>

          {(selectedCountry || searchTerm) && (
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
            <tbody>              {filteredStates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || selectedCountry ? 'Nenhum estado encontrado.' : 'Nenhum estado cadastrado.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStates.map((state) => (
                  <tr key={state.id} className="border-b">
                    <td className="p-4">
                      <div className="font-mono text-sm text-muted-foreground">{state.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{state.nome}</div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm">{state.uf}</code>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{state.paisNome}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/states/edit/${state.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(state.id)}
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

      {filteredStates.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredStates.length} de {states.length} estado(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default StatesList;

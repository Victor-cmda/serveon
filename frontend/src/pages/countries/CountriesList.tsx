import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { countryApi } from '../../services/api';
import { Country } from '../../types/location';
import { toast } from '../../lib/toast';

const CountriesList: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await countryApi.getAll();
      setCountries(data);
    } catch (error) {
      console.error('Erro ao carregar países:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os países',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este país?')) {
      try {
        await countryApi.delete(id);
        toast.success('Sucesso', {
          description: 'País excluído com sucesso',
        });
        loadCountries();
      } catch (error) {
        console.error('Erro ao excluir país:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir o país',
        });
      }
    }
  };
  const filteredCountries = countries.filter(
    country =>
      country.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.id.toString().includes(searchTerm) ||
      (country.codigo && country.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <Globe className="h-8 w-8" />
            Países
          </h1>
          <p className="text-muted-foreground">
            Gerencie os países do sistema
          </p>
        </div>
        <Link
          to="/countries/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo País
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar países..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>              
              <tr className="border-b bg-muted/50">                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Código
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Nome
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Sigla
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  DDI
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>              
              {filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Globe className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhum país encontrado.' : 'Nenhum país cadastrado.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCountries.map((country) => (
                  <tr key={country.id} className="border-b">
                    <td className="p-4">
                      <div className="font-mono text-sm text-muted-foreground">{country.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{country.nome}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{country.sigla}</div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm">{country.codigo || '-'}</code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/countries/edit/${country.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(country.id)}
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

      {filteredCountries.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredCountries.length} de {countries.length} país(es)
          </div>
        </div>
      )}
    </div>
  );
};

export default CountriesList;

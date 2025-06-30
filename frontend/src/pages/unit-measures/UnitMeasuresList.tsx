import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Scale } from 'lucide-react';
import { UnitMeasure } from '../../types/unit-measure';
import { unitMeasureApi } from '../../services/api';
import { toast } from 'sonner';

const UnitMeasuresList: React.FC = () => {
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUnitMeasures();
  }, []);

  const loadUnitMeasures = async () => {
    try {
      setLoading(true);
      const data = await unitMeasureApi.getAll();
      setUnitMeasures(data);
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar as unidades de medida',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade de medida?')) {
      try {
        await unitMeasureApi.delete(id);
        toast.success('Sucesso', {
          description: 'Unidade de medida excluída com sucesso',
        });
        loadUnitMeasures();
      } catch (error) {
        console.error('Erro ao excluir unidade de medida:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir a unidade de medida',
        });
      }
    }
  };

  const filteredUnitMeasures = unitMeasures.filter(
    (unitMeasure) =>
      (unitMeasure.nome && unitMeasure.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unitMeasure.sigla && unitMeasure.sigla.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Scale className="h-8 w-8" />
            Unidades de Medida
          </h1>
          <p className="text-muted-foreground">
            Gerencie as unidades de medida dos produtos
          </p>
        </div>
        <Link
          to="/unit-measures/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova Unidade
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar unidades de medida..."
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
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Código
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Nome
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Sigla
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUnitMeasures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Scale className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhuma unidade de medida encontrada' : 'Nenhuma unidade de medida cadastrada'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUnitMeasures.map((unitMeasure) => (
                  <tr key={unitMeasure.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{unitMeasure.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{unitMeasure.nome}</div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">
                        {unitMeasure.sigla}
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {unitMeasure.ativo ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                            Inativo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/unit-measures/edit/${unitMeasure.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(unitMeasure.id)}
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

      {filteredUnitMeasures.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredUnitMeasures.length} de {unitMeasures.length} unidade(s) de medida
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitMeasuresList;

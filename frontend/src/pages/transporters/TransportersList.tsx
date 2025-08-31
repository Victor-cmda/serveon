import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { transporterApi } from '../../services/api';
import { Transporter } from '../../types/transporter';
import { toast } from '../../lib/toast';

const TransportersList: React.FC = () => {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransporters();
  }, []);

  const loadTransporters = async () => {
    try {
      setLoading(true);
      const data = await transporterApi.getAll();
      setTransporters(data);
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar as transportadoras',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transportadora?')) {
      try {
        await transporterApi.delete(id);
        toast.success('Sucesso', {
          description: 'Transportadora excluída com sucesso',
        });
        loadTransporters();
      } catch (error) {
        console.error('Erro ao excluir transportadora:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir a transportadora',
        });
      }
    }
  };

  const filteredTransporters = transporters.filter(
    (transporter) =>
      transporter.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transporter.nomeFantasia &&
        transporter.nomeFantasia
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      transporter.cnpj.includes(searchTerm) ||
      transporter.id.toString().includes(searchTerm) ||
      (transporter.cidadeNome &&
        transporter.cidadeNome.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const formatCnpj = (cnpj: string) => {
    if (cnpj.length === 14) {
      return cnpj.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5',
      );
    }
    return cnpj;
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
            <Truck className="h-8 w-8" />
            Transportadoras
          </h1>
          <p className="text-muted-foreground">
            Gerencie as transportadoras da empresa
          </p>
        </div>
        <Link
          to="/transporters/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova Transportadora
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar transportadoras..."
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
                  Nome Fantasia
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  CNPJ
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Cidade
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Website
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransporters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Truck className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? 'Nenhuma transportadora encontrada.'
                          : 'Nenhuma transportadora cadastrada.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransporters.map((transporter) => (
                  <tr key={transporter.id} className="border-b">
                    <td className="p-4">
                      <div className="font-mono text-sm text-muted-foreground">
                        {transporter.id}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{transporter.nome}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {transporter.nomeFantasia || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm">
                        {formatCnpj(transporter.cnpj)}
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {transporter.cidadeNome || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {transporter.website ? (
                          <a
                            href={transporter.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {transporter.website}
                          </a>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/transporters/edit/${transporter.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(transporter.id)}
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

      {filteredTransporters.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredTransporters.length} de {transporters.length}{' '}
            transportadora(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportersList;

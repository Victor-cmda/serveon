import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supplierApi } from '../../services/api';
import { Supplier } from '../../types/supplier';
import { toast } from '../../lib/toast';

const SuppliersList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierApi.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os fornecedores',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await supplierApi.delete(id);
        toast.success('Sucesso', {
          description: 'Fornecedor excluído com sucesso',
        });
        loadSuppliers();
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir o fornecedor',
        });
      }
    }
  };
  const filteredSuppliers = suppliers.filter(
    supplier =>
      supplier.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.nomeFantasia && supplier.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      supplier.cnpjCpf.includes(searchTerm) ||
      supplier.id.toString().includes(searchTerm) ||
      (supplier.cidadeNome && supplier.cidadeNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.responsavel && supplier.responsavel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCpfCnpj = (doc: string, tipo: 'F' | 'J') => {
    if (tipo === 'F') {
      if (doc.length === 11) {
        return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
    } else {
      if (doc.length === 14) {
        return doc.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          '$1.$2.$3/$4-$5',
        );
      }
    }
    return doc;
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
            <Users className="h-8 w-8" />
            Fornecedores
          </h1>
          <p className="text-muted-foreground">
            Gerencie os fornecedores da empresa
          </p>
        </div>
        <Link
          to="/suppliers/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo Fornecedor
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
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
                  Fornecedor
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Nome Fantasia
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  CPF/CNPJ
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Cidade
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Limite Crédito
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Responsável
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhum fornecedor encontrado.' : 'Nenhum fornecedor cadastrado.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b">
                    <td className="p-4">
                      <div className="font-mono text-sm text-muted-foreground">{supplier.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{supplier.razaoSocial}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{supplier.nomeFantasia || '-'}</div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm">{formatCpfCnpj(supplier.cnpjCpf, supplier.tipo)}</code>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{supplier.tipo === 'F' ? 'Física' : 'Jurídica'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{supplier.cidadeNome || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-mono">
                        {supplier.limiteCredito 
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(supplier.limiteCredito)
                          : '-'
                        }
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{supplier.responsavel || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/suppliers/edit/${supplier.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(supplier.id)}
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

      {filteredSuppliers.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredSuppliers.length} de {suppliers.length} fornecedor(es)
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersList;

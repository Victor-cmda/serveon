import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../services/api';
import { Customer } from '../../types/customer';
import { toast } from '../../lib/toast';

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os clientes',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cnpjCpf: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await customerApi.delete(Number(cnpjCpf));
        toast.success('Sucesso', {
          description: 'Cliente excluído com sucesso',
        });
        loadCustomers();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir o cliente',
        });
      }
    }
  };
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.nomeFantasia &&
        customer.nomeFantasia
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      customer.cnpjCpf.includes(searchTerm) ||
      customer.id.toString().includes(searchTerm) ||
      (customer.cidadeNome &&
        customer.cidadeNome.toLowerCase().includes(searchTerm.toLowerCase())),
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
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie os clientes da empresa
          </p>
        </div>
        <Link
          to="/customers/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar clientes..."
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
                  Nome/Razão Social
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
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? 'Nenhum cliente encontrado.'
                          : 'Nenhum cliente cadastrado.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (                  <tr key={customer.id} className="border-b">
                    <td className="p-4">
                      <div className="font-mono text-sm text-muted-foreground">{customer.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{customer.razaoSocial}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {customer.nomeFantasia || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm">
                        {formatCpfCnpj(customer.cnpjCpf, customer.tipo)}
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {customer.tipo === 'F' ? 'Física' : 'Jurídica'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {customer.cidadeNome || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/customers/edit/${customer.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.cnpjCpf)}
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

      {filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredCustomers.length} de {customers.length}{' '}
            cliente(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paymentMethodApi } from '../../services/api';
import { PaymentMethod } from '../../types/payment-method';
import { toast } from '../../lib/toast';

const PaymentMethodsList: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodApi.getAll();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar as formas de pagamento',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      try {
        await paymentMethodApi.delete(id);
        toast.success('Sucesso', {
          description: 'Forma de pagamento excluída com sucesso',
        });
        loadPaymentMethods();
      } catch (error) {
        console.error('Erro ao excluir forma de pagamento:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir a forma de pagamento',
        });
      }
    }
  };
  const filteredPaymentMethods = paymentMethods.filter(
    paymentMethod =>
      paymentMethod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (paymentMethod.code && paymentMethod.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (paymentMethod.type && paymentMethod.type.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <CreditCard className="h-8 w-8" />
            Formas de Pagamento
          </h1>
          <p className="text-muted-foreground">
            Gerencie as formas de pagamento do sistema
          </p>
        </div>
        <Link
          to="/payment-methods/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova Forma de Pagamento
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar formas de pagamento..."
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
                  Descrição
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Código
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>            <tbody>
              {filteredPaymentMethods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhuma forma de pagamento encontrada.' : 'Nenhuma forma de pagamento cadastrada.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPaymentMethods.map((paymentMethod) => (
                  <tr key={paymentMethod.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{paymentMethod.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{paymentMethod.code || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{paymentMethod.type || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          paymentMethod.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {paymentMethod.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/payment-methods/edit/${paymentMethod.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(paymentMethod.id)}
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

      {filteredPaymentMethods.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredPaymentMethods.length} de {paymentMethods.length} forma(s) de pagamento
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsList;

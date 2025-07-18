import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import { paymentTermApi } from '@/services/api';
import { PaymentTerm } from '@/types/payment-term';
import { toast } from '../../lib/toast';

const PaymentTermsList = () => {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPaymentTerms();
  }, []);

  const fetchPaymentTerms = async () => {
    setLoading(true);
    try {
      const data = await paymentTermApi.getAll();
      setPaymentTerms(data);
    } catch (error) {
      console.error('Erro ao buscar condições de pagamento:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar a lista de condições de pagamento.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (term: PaymentTerm) => {
    if (window.confirm(`Tem certeza que deseja excluir a condição de pagamento "${term.name}"?`)) {
      try {
        await paymentTermApi.delete(term.id);
        setPaymentTerms(paymentTerms.filter((t) => t.id !== term.id));
        toast.success('Sucesso', {
          description: `Condição de pagamento "${term.name}" removida com sucesso.`,
        });
      } catch (error: unknown) {
        console.error('Erro ao excluir condição de pagamento:', error);
        const errorMessage = error instanceof Error ? error.message : 'Não foi possível excluir a condição de pagamento. Verifique se não está sendo usada em pedidos.';
        toast.error('Erro', {
          description: errorMessage,
        });
      }
    }
  };

  const calculateTotalInstallments = (term: PaymentTerm) => {
    return term.installments.length;
  };
  const filteredPaymentTerms = paymentTerms.filter(
    (term) =>
      term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (term.description && term.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      term.id.toString().includes(searchTerm)
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
            <FileText className="h-8 w-8" />
            Condições de Pagamento
          </h1>
          <p className="text-muted-foreground">
            Gerencie as condições de pagamento da empresa
          </p>
        </div>
        <Link
          to="/payment-terms/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova Condição
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar condições de pagamento..."
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
                  Nome
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Descrição
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Parcelas
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Taxa de Juros
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Multa / Desconto
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>              {filteredPaymentTerms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhuma condição de pagamento encontrada.' : 'Nenhuma condição de pagamento cadastrada.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPaymentTerms.map((term) => (
                  <tr key={term.id} className="border-b">
                    <td className="p-4">
                      <div className="font-mono text-sm text-muted-foreground">{term.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{term.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {term.description || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{calculateTotalInstallments(term)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{term.interestRate}%</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {term.fineRate}% / {term.discountPercentage}%
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          term.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {term.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/payment-terms/edit/${term.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(term)}
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

      {filteredPaymentTerms.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredPaymentTerms.length} de {paymentTerms.length} condição(ões) de pagamento
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTermsList;
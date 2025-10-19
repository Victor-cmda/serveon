import React, { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, Search, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { purchaseApi } from '../../services/api';
import { Purchase } from '../../types/purchase';
import { toast } from '../../lib/toast';
import PurchaseViewDialog from './components/PurchaseViewDialog';

const PurchasesList: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await purchaseApi.getAll();
      setPurchases(data);
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar as compras',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(
    purchase =>
      (purchase.numeroSequencial?.toString() || '').includes(searchTerm) ||
      purchase.id.toString().includes(searchTerm) ||
      (purchase.fornecedorNome && purchase.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (purchase.funcionarioNome && purchase.funcionarioNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      purchase.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (purchase.modelo && purchase.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (purchase.serie && purchase.serie.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMADA':
        return 'bg-blue-100 text-blue-800';
      case 'ENTREGUE':
        return 'bg-green-100 text-green-800';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <ShoppingCart className="h-8 w-8" />
            Compras
          </h1>
          <p className="text-muted-foreground">
            Gerencie as compras da empresa
          </p>
        </div>
        <Link
          to="/purchases/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova Compra
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar compras..."
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
                  Número
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Fornecedor
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Data Emissão
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Data Chegada
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Total a Pagar
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
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhuma compra encontrada.' : 'Nenhuma compra cadastrada.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{purchase.numeroSequencial || '-'}</div>
                      {purchase.modelo && purchase.serie && (
                        <div className="text-sm text-muted-foreground">
                          Mod: {purchase.modelo} / Série: {purchase.serie}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{purchase.fornecedorNome || '-'}</div>
                      {purchase.codigoFornecedor && (
                        <div className="text-sm text-muted-foreground">
                          Cód: {purchase.codigoFornecedor}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{formatDate(purchase.dataEmissao)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{formatDate(purchase.dataChegada)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{formatCurrency(purchase.totalAPagar)}</div>
                      <div className="text-sm text-muted-foreground">
                        Produtos: {formatCurrency(purchase.totalProdutos)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(purchase.status)}`}
                      >
                        {purchase.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPurchase(purchase)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                          title="Visualizar compra"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          disabled
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-muted text-muted-foreground h-8 w-8 cursor-not-allowed opacity-50"
                          title="Exclusão temporariamente indisponível"
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

      {filteredPurchases.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredPurchases.length} de {purchases.length} compra(s)
          </div>
        </div>
      )}

      {selectedPurchase && (
        <PurchaseViewDialog
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
};

export default PurchasesList;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { Product } from '../../types/product';
import { productApi } from '../../services/api';
import { toast } from 'sonner';

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os produtos',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productApi.delete(id);
        toast.success('Sucesso', {
          description: 'Produto excluído com sucesso',
        });
        loadProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir o produto',
        });
      }
    }
  };
  const filteredProducts = products.filter(
    (product) =>
      (product.produto && product.produto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.descricao && product.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.categoriaNome && product.categoriaNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.marcaNome && product.marcaNome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
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
            <Package className="h-8 w-8" />
            Produtos
          </h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos
          </p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar produtos..."
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
                  Categoria
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Marca
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Preço
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Estoque
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{product.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{product.produto}</div>
                      {product.descricao && (
                        <div className="text-sm text-muted-foreground">{product.descricao}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{product.categoriaNome || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{product.marcaNome || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {formatPrice(product.valorVenda || 0)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground ring-1 ring-inset ring-border">
                          {product.quantidade || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {product.ativo ? (
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
                          to={`/products/edit/${product.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
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

      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredProducts.length} de {products.length} produto(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;

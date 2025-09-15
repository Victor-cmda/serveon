import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Search } from 'lucide-react';
import { SearchDialog } from '@/components/SearchDialog';
import { purchaseApi, supplierApi, paymentTermApi, productApi } from '@/services/api';
import { Supplier } from '@/types/supplier';
import { PaymentTerm } from '@/types/payment-term';
import { Product } from '@/types/product';
import SupplierCreationDialog from '@/components/dialogs/SupplierCreationDialog';

interface PurchaseItemForm {
  codigo: string;
  produto: string;
  produtoId?: number;
  unidade: string;
  quantidade: number;
  precoUN: number;
  descUN: number;
  liquidoUN: number;
  total: number;
  rateio: number;
  custoFinalUN: number;
  custoFinal: number;
}

interface Installment {
  numero: number;
  dataVencimento: string;
  valor: number;
}

export default function NewPurchaseForm() {
  const navigate = useNavigate();

  // Estados do formulário principal
  const [fornecedorId, setFornecedorId] = useState<number>(0);
  const [dataEmissao, setDataEmissao] = useState<string>('');
  const [dataChegada, setDataChegada] = useState<string>('');
  const [condicaoPagamentoId, setCondicaoPagamentoId] = useState<number>(0);
  const [funcionarioId, setFuncionarioId] = useState<number>(1);
  const [modelo, setModelo] = useState<string>('');
  const [serie, setSerie] = useState<string>('');
  const [codigoFornecedor, setCodigoFornecedor] = useState<string>('');
  const [valorFrete, setValorFrete] = useState<number>(0);
  const [valorSeguro, setValorSeguro] = useState<number>(0);
  const [outrasDesp, setOutrasDesp] = useState<number>(0);
  const [observacoes, setObservacoes] = useState<string>('');

  // Estados das listas
  const [items, setItems] = useState<PurchaseItemForm[]>([]);
  const [installments] = useState<Installment[]>([]);

  // Estados dos dados carregados
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Estados selecionados
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<PaymentTerm | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Estados dos diálogos de pesquisa
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [paymentTermSearchOpen, setPaymentTermSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  // Estados dos diálogos de edição
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  // Estados de loading
  const [isLoading, setIsLoading] = useState(false);

  // Estados para controlar seções bloqueadas (irreversível)
  const [headerLocked, setHeaderLocked] = useState(false);
  const [itemsLocked, setItemsLocked] = useState(false);
  const [currentSection, setCurrentSection] = useState<'header' | 'items' | 'totals'>('header');

  // Estados para novo item
  const [newItem, setNewItem] = useState<PurchaseItemForm>({
    codigo: '',
    produto: '',
    produtoId: undefined,
    unidade: '',
    quantidade: 0,
    precoUN: 0,
    descUN: 0,
    liquidoUN: 0,
    total: 0,
    rateio: 0,
    custoFinalUN: 0,
    custoFinal: 0,
  });

  // Carrega dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [suppliersData, paymentTermsData, productsData] = await Promise.all([
          supplierApi.getAll(),
          paymentTermApi.getAll(),
          productApi.getAll(),
        ]);
        
        setSuppliers(suppliersData);
        setPaymentTerms(paymentTermsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados necessários');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Effect para monitorar mudanças de seção automaticamente
  useEffect(() => {
    // Verificar se deve bloquear cabeçalho quando há itens
    if (items.length > 0 && !headerLocked && isHeaderComplete()) {
      setHeaderLocked(true);
      toast.success('Cabeçalho bloqueado automaticamente.');
    }
  }, [items.length, headerLocked, fornecedorId, dataEmissao, condicaoPagamentoId]);

  // Handlers para seleção de entidades
  const onSelectSupplier = (supplier: Supplier) => {
    // Resetar condição de pagamento anterior se houver mudança de fornecedor
    if (selectedSupplier && selectedSupplier.id !== supplier.id) {
      setSelectedPaymentTerm(null);
      setCondicaoPagamentoId(0);
    }
    
    setSelectedSupplier(supplier);
    setFornecedorId(supplier.id);
    
    // Auto-preencher condição de pagamento do fornecedor
    if (supplier.condicaoPagamentoId && supplier.condicaoPagamentoNome) {
      const paymentTerm = {
        id: supplier.condicaoPagamentoId,
        name: supplier.condicaoPagamentoNome,
        description: '',
        interestRate: 0,
        fineRate: 0,
        discountPercentage: 0,
        ativo: true,
        createdAt: '',
        updatedAt: '',
        installments: []
      };
      setSelectedPaymentTerm(paymentTerm);
      setCondicaoPagamentoId(supplier.condicaoPagamentoId);
      toast.success(`Condição de pagamento "${supplier.condicaoPagamentoNome}" preenchida automaticamente.`);
    } else {
      // Se fornecedor não tem condição padrão, permitir seleção manual
      toast.info('Fornecedor sem condição padrão. Selecione uma condição de pagamento.');
    }
    
    setSupplierSearchOpen(false);
  };

  const onSelectPaymentTerm = (paymentTerm: PaymentTerm) => {
    // Só permite alteração se não houver condição definida
    if (condicaoPagamentoId > 0) {
      toast.error('Condição de pagamento já foi definida pelo fornecedor e não pode ser alterada.');
      setPaymentTermSearchOpen(false);
      return;
    }
    
    setSelectedPaymentTerm(paymentTerm);
    setCondicaoPagamentoId(paymentTerm.id);
    setPaymentTermSearchOpen(false);
  };

  const onSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setNewItem(prev => ({
      ...prev,
      codigo: product.codigoBarras || product.referencia || '',
      produto: product.produto,
      produtoId: product.id,
      unidade: product.unidade || product.unidadeMedidaNome || 'UN'
    }));
    setProductSearchOpen(false);
  };

  // Handlers para criação de novas entidades (implementar depois)
  const onCreateNewSupplier = () => {
    setSupplierToEdit(null);
    setSupplierDialogOpen(true);
    setSupplierSearchOpen(false);
  };

  const handleSupplierCreated = (newSupplier: Supplier) => {
    setSuppliers((prev) => [...prev, newSupplier]);
    setSelectedSupplier(newSupplier);
    setFornecedorId(newSupplier.id);
    
    // Auto-preencher condição de pagamento do novo fornecedor
    if (newSupplier.condicaoPagamentoId && newSupplier.condicaoPagamentoNome) {
      const paymentTerm = {
        id: newSupplier.condicaoPagamentoId,
        name: newSupplier.condicaoPagamentoNome,
        description: '',
        interestRate: 0,
        fineRate: 0,
        discountPercentage: 0,
        ativo: true,
        createdAt: '',
        updatedAt: '',
        installments: []
      };
      setSelectedPaymentTerm(paymentTerm);
      setCondicaoPagamentoId(newSupplier.condicaoPagamentoId);
    }
    
    setSupplierDialogOpen(false);
    toast.success('Fornecedor criado com sucesso!');
  };

  const onCreateNewPaymentTerm = () => {
    if (condicaoPagamentoId > 0) {
      toast.error('Condição de pagamento já foi definida pelo fornecedor e não pode ser alterada.');
      setPaymentTermSearchOpen(false);
      return;
    }
    toast.info('Funcionalidade de criar condição de pagamento será implementada');
    setPaymentTermSearchOpen(false);
  };

  const onCreateNewProduct = () => {
    toast.info('Funcionalidade de criar produto será implementada');
    setProductSearchOpen(false);
  };

  // Handlers para edição de entidades (implementar depois)
  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setSupplierDialogOpen(true);
    setSupplierSearchOpen(false);
  };

  const handleEditPaymentTerm = (paymentTerm: PaymentTerm) => {
    toast.info('Funcionalidade de editar condição de pagamento será implementada');
  };

  const handleEditProduct = (product: Product) => {
    toast.info('Funcionalidade de editar produto será implementada');
  };

  // Handlers para quando entidades são criadas/atualizadas
  const handleSupplierUpdated = (updatedSupplier: Supplier) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      )
    );
    
    // Se o fornecedor sendo editado é o selecionado, atualizar também
    if (selectedSupplier && selectedSupplier.id === updatedSupplier.id) {
      setSelectedSupplier(updatedSupplier);
      
      // Reprocessar condição de pagamento se mudou
      if (updatedSupplier.condicaoPagamentoId !== selectedSupplier.condicaoPagamentoId) {
        if (updatedSupplier.condicaoPagamentoId && updatedSupplier.condicaoPagamentoNome) {
          const paymentTerm = {
            id: updatedSupplier.condicaoPagamentoId,
            name: updatedSupplier.condicaoPagamentoNome,
            description: '',
            interestRate: 0,
            fineRate: 0,
            discountPercentage: 0,
            ativo: true,
            createdAt: '',
            updatedAt: '',
            installments: []
          };
          setSelectedPaymentTerm(paymentTerm);
          setCondicaoPagamentoId(updatedSupplier.condicaoPagamentoId);
        } else {
          setSelectedPaymentTerm(null);
          setCondicaoPagamentoId(0);
        }
      }
    }
    
    setSupplierDialogOpen(false);
    toast.success('Fornecedor atualizado com sucesso!');
  };

  // Função para verificar se o cabeçalho está completo
  const isHeaderComplete = () => {
    // Condição de pagamento é obrigatória, mas pode ser preenchida automaticamente pelo fornecedor
    return fornecedorId > 0 && dataEmissao && condicaoPagamentoId > 0;
  };

  // Função para verificar se a seção de itens está completa
  const isItemsComplete = () => {
    return items.length > 0;
  };

  // Função para mudar de seção (com bloqueio automático)
  const moveToSection = (section: 'header' | 'items' | 'totals') => {
    // Bloquear seção atual se estiver completa
    if (currentSection === 'header' && isHeaderComplete() && !headerLocked) {
      setHeaderLocked(true);
      toast.success('Cabeçalho bloqueado automaticamente. Não é possível mais editá-lo.');
    }
    
    if (currentSection === 'items' && isItemsComplete() && !itemsLocked) {
      setItemsLocked(true);
      toast.success('Itens bloqueados automaticamente. Não é possível mais editá-los.');
    }

    setCurrentSection(section);
  };

  // Verificar se pode acessar uma seção
  const canAccessSection = (section: 'header' | 'items' | 'totals') => {
    if (section === 'items') {
      return headerLocked; // Só pode acessar itens se cabeçalho estiver bloqueado
    }
    if (section === 'totals') {
      return headerLocked && itemsLocked; // Só pode acessar totais se ambos estiverem bloqueados
    }
    return true; // Header sempre acessível (enquanto não bloqueado)
  };

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Calcular totais
  const totals = useMemo(() => {
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalGeral = subTotal + valorFrete + valorSeguro + outrasDesp;
    const totalRateio = valorFrete + valorSeguro + outrasDesp;

    return {
      subTotal,
      totalGeral,
      totalRateio,
    };
  }, [items, valorFrete, valorSeguro, outrasDesp]);

  // Recalcular rateio automaticamente quando os valores mudam
  useEffect(() => {
    if (totals.subTotal > 0 && totals.totalRateio > 0) {
      setItems(prev => prev.map(item => {
        const proporcao = item.total / totals.subTotal;
        const rateio = proporcao * totals.totalRateio;
        const custoFinalUN = item.liquidoUN + (rateio / item.quantidade);
        const custoFinal = custoFinalUN * item.quantidade;

        return {
          ...item,
          rateio,
          custoFinalUN,
          custoFinal,
        };
      }));
    }
  }, [totals.subTotal, totals.totalRateio]);

  // Adicionar novo item
  const addItem = () => {
    if (!newItem.codigo || !newItem.produto || newItem.quantidade <= 0 || newItem.precoUN <= 0) {
      toast.error('Por favor, preencha todos os campos do item');
      return;
    }

    // Bloquear cabeçalho automaticamente quando adicionar primeiro item
    if (!headerLocked && isHeaderComplete()) {
      setHeaderLocked(true);
      toast.success('Cabeçalho bloqueado automaticamente ao adicionar item.');
    }

    const liquidoUN = newItem.precoUN - newItem.descUN;
    const total = liquidoUN * newItem.quantidade;

    const item: PurchaseItemForm = {
      ...newItem,
      liquidoUN,
      total,
      rateio: 0,
      custoFinalUN: liquidoUN,
      custoFinal: total,
    };

    setItems(prev => [...prev, item]);
    setNewItem({
      codigo: '',
      produto: '',
      produtoId: undefined,
      unidade: '',
      quantidade: 0,
      precoUN: 0,
      descUN: 0,
      liquidoUN: 0,
      total: 0,
      rateio: 0,
      custoFinalUN: 0,
      custoFinal: 0,
    });
  };

  // Remover item
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Função para atualizar campo do novo item
  const updateNewItemField = (field: keyof PurchaseItemForm, value: any) => {
    setNewItem(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'quantidade' || field === 'precoUN' || field === 'descUN') {
        updated.liquidoUN = updated.precoUN - updated.descUN;
        updated.total = updated.liquidoUN * updated.quantidade;
      }

      return updated;
    });
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fornecedorId || !dataEmissao || items.length === 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const purchaseData = {
        fornecedorId,
        dataEmissao,
        dataChegada,
        condicaoPagamentoId,
        funcionarioId,
        modelo,
        serie,
        codigoFornecedor,
        valorFrete,
        valorSeguro,
        outrasDespesas: outrasDesp,
        observacoes,
        itens: items.map(item => ({
          codigo: item.codigo,
          produtoId: item.produtoId || 1,
          produto: item.produto,
          unidade: item.unidade,
          quantidade: item.quantidade,
          precoUN: item.precoUN,
          descUN: item.descUN,
          liquidoUN: item.liquidoUN,
          total: item.total,
          rateio: item.rateio,
          custoFinalUN: item.custoFinalUN,
          custoFinal: item.custoFinal,
        })),
        parcelas: [], // TODO: Implementar parcelas baseadas na condição de pagamento
      };

      await purchaseApi.create(purchaseData);
      toast.success('Compra criada com sucesso!');
      navigate('/purchases');
    } catch (error) {
      console.error('Erro ao criar compra:', error);
      toast.error('Erro ao criar compra');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Nova Compra</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/purchases')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabeçalho da Compra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Dados da Compra
              {headerLocked ? (
                <span className="text-sm text-green-600 font-medium">✓ Seção Bloqueada</span>
              ) : (
                <span className="text-sm text-blue-600 font-medium">📝 Em Edição</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4" onBlur={(e) => {
              // Verificar se o foco está saindo da seção completa
              setTimeout(() => {
                if (!e.currentTarget.contains(document.activeElement) && 
                    isHeaderComplete() && !headerLocked) {
                  setHeaderLocked(true);
                  toast.success('Cabeçalho bloqueado automaticamente ao sair da seção.');
                }
              }, 100);
            }}>
              {/* Linha 1 */}
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor *</Label>
                <div className="flex space-x-2">
                  <Input
                    value={selectedSupplier ? selectedSupplier.fornecedor : ''}
                    placeholder="Selecione um fornecedor..."
                    readOnly
                    disabled={headerLocked}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={headerLocked}
                    onClick={() => setSupplierSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEmissao">Data Emissão *</Label>
                <Input
                  id="dataEmissao"
                  type="date"
                  value={dataEmissao}
                  onChange={(e) => setDataEmissao(e.target.value)}
                  disabled={headerLocked}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataChegada">Data Chegada</Label>
                <Input
                  id="dataChegada"
                  type="date"
                  value={dataChegada}
                  onChange={(e) => setDataChegada(e.target.value)}
                  disabled={headerLocked}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condicaoPagamento">Condição Pagamento</Label>
                <div className="flex space-x-2">
                  <Input
                    value={selectedPaymentTerm ? selectedPaymentTerm.name : ''}
                    placeholder={condicaoPagamentoId > 0 ? "Definida pelo fornecedor" : "Selecione uma condição..."}
                    readOnly
                    disabled={headerLocked || condicaoPagamentoId > 0}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={headerLocked || condicaoPagamentoId > 0}
                    onClick={() => setPaymentTermSearchOpen(true)}
                    title={condicaoPagamentoId > 0 ? "Condição definida pelo fornecedor" : "Selecionar condição"}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {condicaoPagamentoId > 0 && (
                  <p className="text-xs text-green-600">
                    ✓ Definida automaticamente pelo fornecedor
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  disabled={headerLocked}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serie">Série</Label>
                <Input
                  id="serie"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  disabled={headerLocked}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adição de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Adicionar Produto
              {!headerLocked ? (
                <span className="text-sm text-amber-600 font-medium">
                  ⚠️ Complete o cabeçalho primeiro
                </span>
              ) : itemsLocked ? (
                <span className="text-sm text-green-600 font-medium">✓ Seção Bloqueada</span>
              ) : (
                <span className="text-sm text-blue-600 font-medium">📝 Em Edição</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-4 items-end" onBlur={(e) => {
              // Verificar se o foco está saindo da seção completa
              setTimeout(() => {
                if (!e.currentTarget.contains(document.activeElement) && 
                    isItemsComplete() && !itemsLocked && headerLocked) {
                  setItemsLocked(true);
                  toast.success('Itens bloqueados automaticamente ao sair da seção.');
                }
              }, 100);
            }}>
              <div className="space-y-2">
                <Label>Código</Label>
                <Input
                  value={newItem.codigo}
                  onChange={(e) => updateNewItemField('codigo', e.target.value)}
                  placeholder="Código"
                  disabled={!headerLocked || itemsLocked}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Produto</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.produto}
                    onChange={(e) => updateNewItemField('produto', e.target.value)}
                    placeholder="Nome do produto"
                    className="flex-1"
                    disabled={!headerLocked || itemsLocked}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!headerLocked || itemsLocked}
                    onClick={() => setProductSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  value={newItem.unidade}
                  onChange={(e) => updateNewItemField('unidade', e.target.value)}
                  placeholder="UN"
                  disabled={!headerLocked || itemsLocked}
                />
              </div>

              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={newItem.quantidade}
                  onChange={(e) => updateNewItemField('quantidade', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  disabled={!headerLocked || itemsLocked}
                />
              </div>

              <div className="space-y-2">
                <Label>Preço UN</Label>
                <Input
                  type="number"
                  value={newItem.precoUN}
                  onChange={(e) => updateNewItemField('precoUN', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  disabled={!headerLocked || itemsLocked}
                />
              </div>

              <div className="space-y-2">
                <Label>Desc. UN</Label>
                <Input
                  type="number"
                  value={newItem.descUN}
                  onChange={(e) => updateNewItemField('descUN', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  disabled={!headerLocked || itemsLocked}
                />
              </div>

              <div>
                <Button type="button" onClick={addItem} size="sm" disabled={!headerLocked || itemsLocked}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Itens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Itens da Compra
              {itemsLocked ? (
                <span className="text-sm text-green-600 font-medium">✓ Seção Bloqueada</span>
              ) : items.length > 0 ? (
                <span className="text-sm text-blue-600 font-medium">📝 Em Edição</span>
              ) : (
                <span className="text-sm text-gray-500 font-medium">📋 Aguardando Itens</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Unid.</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Preço UN</TableHead>
                  <TableHead>Desc. UN</TableHead>
                  <TableHead>Líquido UN</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Rateio</TableHead>
                  <TableHead>Custo Final UN</TableHead>
                  <TableHead>Custo Final</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.codigo}</TableCell>
                    <TableCell>{item.produto}</TableCell>
                    <TableCell>{item.unidade}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>{formatCurrency(item.precoUN)}</TableCell>
                    <TableCell>{formatCurrency(item.descUN)}</TableCell>
                    <TableCell>{formatCurrency(item.liquidoUN)}</TableCell>
                    <TableCell>{formatCurrency(item.total)}</TableCell>
                    <TableCell>{formatCurrency(item.rateio)}</TableCell>
                    <TableCell>{formatCurrency(item.custoFinalUN)}</TableCell>
                    <TableCell>{formatCurrency(item.custoFinal)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={itemsLocked}
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totais e Rateio */}
        <div className="grid grid-cols-2 gap-6" onFocus={() => {
          // Bloquear itens automaticamente ao focar na seção de totais
          if (!itemsLocked && isItemsComplete() && headerLocked) {
            setItemsLocked(true);
            toast.success('Itens bloqueados automaticamente ao acessar seção de totais.');
          }
        }}>
          <Card>
            <CardHeader>
              <CardTitle>Valores Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valorFrete">Valor Frete</Label>
                <Input
                  id="valorFrete"
                  type="number"
                  value={valorFrete}
                  onChange={(e) => setValorFrete(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorSeguro">Valor Seguro</Label>
                <Input
                  id="valorSeguro"
                  type="number"
                  value={valorSeguro}
                  onChange={(e) => setValorSeguro(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outrasDesp">Outras Despesas</Label>
                <Input
                  id="outrasDesp"
                  type="number"
                  value={outrasDesp}
                  onChange={(e) => setOutrasDesp(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal Produtos:</span>
                <span className="font-semibold">{formatCurrency(totals.subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete:</span>
                <span>{formatCurrency(valorFrete)}</span>
              </div>
              <div className="flex justify-between">
                <span>Seguro:</span>
                <span>{formatCurrency(valorSeguro)}</span>
              </div>
              <div className="flex justify-between">
                <span>Outras Despesas:</span>
                <span>{formatCurrency(outrasDesp)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Rateio:</span>
                <span className="font-semibold">{formatCurrency(totals.totalRateio)}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-bold">Total Geral:</span>
                <span className="font-bold">{formatCurrency(totals.totalGeral)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Diálogos de Pesquisa */}
      <SearchDialog
        open={supplierSearchOpen}
        onOpenChange={setSupplierSearchOpen}
        title="Selecionar Fornecedor"
        entities={suppliers}
        isLoading={isLoading}
        onSelect={onSelectSupplier}
        onCreateNew={onCreateNewSupplier}
        onEdit={handleEditSupplier}
        displayColumns={[
          { key: 'fornecedor', header: 'Fornecedor' },
          { key: 'cnpjCpf', header: 'CNPJ/CPF' },
          { key: 'email', header: 'Email' },
        ]}
        searchKeys={['fornecedor', 'cnpjCpf', 'email', 'razaoSocial']}
        entityType="fornecedores"
        description="Selecione um fornecedor para a compra ou crie um novo."
      />

      <SearchDialog
        open={paymentTermSearchOpen && condicaoPagamentoId === 0}
        onOpenChange={(open) => {
          if (condicaoPagamentoId > 0 && open) {
            toast.error('Condição de pagamento já foi definida pelo fornecedor.');
            return;
          }
          setPaymentTermSearchOpen(open);
        }}
        title="Selecionar Condição de Pagamento"
        entities={paymentTerms}
        isLoading={isLoading}
        onSelect={onSelectPaymentTerm}
        onCreateNew={onCreateNewPaymentTerm}
        onEdit={handleEditPaymentTerm}
        displayColumns={[
          { key: 'name', header: 'Nome' },
          { key: 'description', header: 'Descrição' },
        ]}
        searchKeys={['name', 'description']}
        entityType="condições de pagamento"
        description="Selecione uma condição de pagamento ou crie uma nova."
      />

      <SearchDialog
        open={productSearchOpen}
        onOpenChange={setProductSearchOpen}
        title="Selecionar Produto"
        entities={products}
        isLoading={isLoading}
        onSelect={onSelectProduct}
        onCreateNew={onCreateNewProduct}
        onEdit={handleEditProduct}
        displayColumns={[
          { key: 'produto', header: 'Produto' },
          { key: 'codigoBarras', header: 'Código' },
          { key: 'unidade', header: 'Unidade' },
          { key: 'valorVenda', header: 'Valor' },
        ]}
        searchKeys={['produto', 'codigoBarras', 'referencia', 'descricao']}
        entityType="produtos"
        description="Selecione um produto para adicionar à compra ou crie um novo."
      />
      
      {/* Dialog de criação/edição de fornecedor */}
      <SupplierCreationDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        onSuccess={supplierToEdit ? handleSupplierUpdated : handleSupplierCreated}
        supplier={supplierToEdit}
      />
    </div>
  );
}
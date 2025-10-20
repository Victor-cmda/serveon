import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, parseISO } from 'date-fns';
import { ArrowLeft, Save, Loader2, Search, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supplierApi, productApi, paymentTermApi, purchaseApi, transporterApi, paymentMethodApi } from '@/services/api';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AuditSection from '@/components/AuditSection';
import SupplierCreationDialog from '@/components/dialogs/SupplierCreationDialog';
import { Supplier } from '@/types/supplier';
import { Product } from '@/types/product';
import { PaymentTerm } from '@/types/payment-term';
import { Transporter } from '@/types/transporter';
import { PaymentMethod } from '@/types/payment-method';

// Funções para formatar e desformatar moeda (trabalha em centavos)
const formatCurrency = (valueInCents: number): string => {
  const number = Number(valueInCents) / 100;
  if (isNaN(number)) return '0,00';
  return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseCurrency = (valueString: string | number): number => {
  if (typeof valueString !== 'string') {
    valueString = String(valueString || '0');
  }
  const digitsOnly = valueString.replace(/\D/g, '');
  return parseInt(digitsOnly, 10) || 0;
};

interface ProdutoItem {
  idProduto: string;
  nomeProduto: string;
  unidade: string;
  quantidade: string;
  preco: string;
  desconto: string;
  precoUN: number;
  descontoUN: number;
  precoLiquidoUN: number;
  precoTotal: number;
  valorRateio?: number;
  valorTotalComRateio?: number;
}

interface Parcela {
  num_parcela: number;
  cod_forma_pagto: number;
  forma_pagto_descricao: string;
  data_vencimento: string;
  valor_parcela: number;
}

const formSchema = z.object({
  numeroNota: z.string().min(1, 'Número da nota é obrigatório'),
  modelo: z.string().optional(),
  serie: z.string().optional(),
  idFornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  dataChegada: z.string().min(1, 'Data de chegada é obrigatória'),
  tipoFrete: z.enum(['CIF', 'FOB']).default('CIF'),
  valorFrete: z.string().default('0,00'),
  valorSeguro: z.string().default('0,00'),
  outrasDespesas: z.string().default('0,00'),
  idTransportadora: z.string().optional(),
  idCondPagamento: z.string().min(1, 'Condição de pagamento é obrigatória'),
  idFormaPagamento: z.string().optional(),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PurchaseFormProps {
  mode?: 'create' | 'edit' | 'view';
}

export function PurchaseForm({ mode = 'create' }: PurchaseFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = mode === 'edit';
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);

  // Estados para entidades selecionadas
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<PaymentTerm | null>(null);
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null);

  // Estado para controlar se a condição de pagamento vem do fornecedor (bloqueada)
  const [isPaymentTermFromSupplier, setIsPaymentTermFromSupplier] = useState(false);

  // Estados para produtos e parcelas
  const [produtos, setProdutos] = useState<ProdutoItem[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

  // Estados para controle de produto em edição
  const [produtoAtual, setProdutoAtual] = useState({
    idProduto: '',
    nomeProduto: '',
    unidade: '',
    quantidade: '1',
    preco: '0,00',
    desconto: '0,00',
  });

  // Estados para controle dos modais
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [paymentTermSearchOpen, setPaymentTermSearchOpen] = useState(false);
  const [transporterSearchOpen, setTransporterSearchOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

  // Estados para edição
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  // Estados para controle de bloqueio
  const [isHeaderLocked, setIsHeaderLocked] = useState(false);
  const [isProductsLocked, setIsProductsLocked] = useState(false);

  // Estado para controle de verificação de chave composta
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Listas de entidades
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroNota: '',
      modelo: '',
      serie: '',
      idFornecedor: '',
      dataEmissao: new Date().toISOString().split('T')[0],
      dataChegada: new Date().toISOString().split('T')[0],
      tipoFrete: 'CIF',
      valorFrete: '0,00',
      valorSeguro: '0,00',
      outrasDespesas: '0,00',
      idTransportadora: '',
      idCondPagamento: '',
      idFormaPagamento: '',
      observacao: '',
    },
  });

  // Verifica se o header está completo (Número e Fornecedor preenchidos)
  const numeroNota = form.watch('numeroNota');
  const idFornecedor = form.watch('idFornecedor');
  const modelo = form.watch('modelo');
  const serie = form.watch('serie');
  
  const isHeaderComplete = useMemo(() => {
    return numeroNota?.trim() !== '' && idFornecedor?.trim() !== '';
  }, [numeroNota, idFornecedor]);

  // Função para verificar se a chave composta já existe
  const checkDuplicatePurchase = async (
    numeroPedido: string,
    modeloDoc: string,
    serieDoc: string,
    fornecedorId: string
  ) => {
    // Não verifica em modo de edição para a própria compra
    if (isEditing && id) {
      return;
    }

    // Valida se todos os campos da chave composta estão preenchidos
    if (!numeroPedido || !modeloDoc || !serieDoc || !fornecedorId) {
      setDuplicateError(null);
      return;
    }

    setIsCheckingDuplicate(true);
    setDuplicateError(null);

    try {
      // Usa a API específica para verificar existência
      const result = await purchaseApi.checkExists(
        numeroPedido,
        modeloDoc,
        serieDoc,
        fornecedorId
      );

      if (result.exists) {
        const errorMsg = `Já existe uma compra com Número: ${numeroPedido}, Modelo: ${modeloDoc}, Série: ${serieDoc} e Fornecedor ID: ${fornecedorId}`;
        setDuplicateError(errorMsg);
        toast.error(errorMsg, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar duplicidade:', error);
      // Se houver erro na verificação, não bloqueamos o usuário
      toast.warning('Não foi possível verificar duplicidade. Prossiga com cautela.');
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Verifica duplicidade quando os campos da chave composta mudam
  useEffect(() => {
    if (numeroNota && modelo && serie && idFornecedor) {
      const timer = setTimeout(() => {
        checkDuplicatePurchase(numeroNota, modelo, serie, idFornecedor);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timer);
    } else {
      setDuplicateError(null);
    }
  }, [numeroNota, modelo, serie, idFornecedor, isEditing, id]);

  // Carrega listas de entidades
  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersData, productsData, paymentTermsData, transportersData, paymentMethodsData] = await Promise.all([
          supplierApi.getAll(),
          productApi.getAll(),
          paymentTermApi.getAll(),
          transporterApi.getAll(),
          paymentMethodApi.getAll(),
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);
        setPaymentTerms(paymentTermsData);
        setTransporters(transportersData);
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };
    loadData();
  }, []);

  // Carrega dados da compra em modo de edição
  useEffect(() => {
    if (id && isEditing) {
      const loadPurchase = async () => {
        setIsLoading(true);
        try {
          const purchase = await purchaseApi.getById(Number(id));
          setPurchaseData(purchase);
          // TODO: Implementar conversão completa dos dados da compra
          form.reset({
            numeroNota: purchase.numeroNota || '',
            modelo: purchase.modelo || '',
            serie: purchase.serie || '',
            idFornecedor: purchase.fornecedorId?.toString() || '',
            dataEmissao: purchase.dataEmissao || '',
            dataChegada: purchase.dataChegada || '',
            tipoFrete: purchase.tipoFrete || 'CIF',
            valorFrete: formatCurrency(purchase.valorFrete || 0),
            valorSeguro: formatCurrency(purchase.valorSeguro || 0),
            outrasDespesas: formatCurrency(purchase.outrasDespesas || 0),
            idCondPagamento: purchase.condicaoPagamentoId?.toString() || '',
            observacao: purchase.observacoes || '',
          });
        } catch (error) {
          console.error('Erro ao carregar compra:', error);
          toast.error('Erro ao carregar compra');
          navigate('/purchases');
        } finally {
          setIsLoading(false);
        }
      };
      loadPurchase();
    }
  }, [id, isEditing, form, navigate]);

  // Calcula produtos com rateio das despesas adicionais
  const produtosComRateio = useMemo(() => {
    if (produtos.length === 0) return [];

    const freteCents = parseCurrency(form.watch('valorFrete') || '0,00');
    const seguroCents = parseCurrency(form.watch('valorSeguro') || '0,00');
    const outrasDespesasCents = parseCurrency(form.watch('outrasDespesas') || '0,00');
    const totalDespesasCents = freteCents + seguroCents + outrasDespesasCents;

    const totalProdutosCents = produtos.reduce((acc, p) => acc + p.precoTotal, 0);

    if (totalProdutosCents === 0) return produtos;

    return produtos.map((produto) => {
      const proporcao = produto.precoTotal / totalProdutosCents;
      const rateio = Math.round(totalDespesasCents * proporcao);
      return {
        ...produto,
        valorRateio: rateio,
        valorTotalComRateio: produto.precoTotal + rateio,
      };
    });
  }, [produtos, form.watch('valorFrete'), form.watch('valorSeguro'), form.watch('outrasDespesas')]);

  // Calcula totais
  const totais = useMemo(() => {
    const totalProdutos = produtosComRateio.reduce((acc, p) => acc + p.precoTotal, 0);
    const totalRateio = produtosComRateio.reduce(
      (acc, p) => acc + (p.valorRateio || 0),
      0
    );
    const totalGeral = totalProdutos + totalRateio;

    return {
      totalProdutos,
      totalRateio,
      totalGeral,
    };
  }, [produtosComRateio]);

  // Gera parcelas automaticamente quando a condição de pagamento muda
  useEffect(() => {
    if (!selectedPaymentTerm || totais.totalGeral === 0) {
      setParcelas([]);
      return;
    }

    const dataBase = parseISO(form.watch('dataEmissao') || new Date().toISOString().split('T')[0]);
    const installments = selectedPaymentTerm.installments || [];
    
    if (installments.length === 0) {
      setParcelas([]);
      return;
    }

    const totalCents = totais.totalGeral;
    const numParcelas = installments.length;
    const valorParcela = Math.floor(totalCents / numParcelas);
    const resto = totalCents - valorParcela * numParcelas;

    const novasParcelas: Parcela[] = installments.map((inst, idx) => {
      const dataVencimento = addDays(dataBase, inst.daysToPayment);
      const valorFinal = idx === numParcelas - 1 ? valorParcela + resto : valorParcela;
      
      // Buscar o nome da forma de pagamento
      const paymentMethod = paymentMethods.find(pm => pm.id === inst.paymentMethodId);
      const formaPagtoNome = paymentMethod?.name || 'Não definido';

      return {
        num_parcela: idx + 1,
        cod_forma_pagto: inst.paymentMethodId,
        forma_pagto_descricao: formaPagtoNome,
        data_vencimento: format(dataVencimento, 'yyyy-MM-dd'),
        valor_parcela: valorFinal, // Manter em centavos, converter apenas no envio
      };
    });

    setParcelas(novasParcelas);
  }, [selectedPaymentTerm, totais.totalGeral, form.watch('dataEmissao'), paymentMethods]);

  // Função para selecionar fornecedor
  const onSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    form.setValue('idFornecedor', supplier.id.toString());
    
    // Preencher automaticamente a condição de pagamento do fornecedor e bloquear
    if (supplier.condicaoPagamentoId) {
      const paymentTerm = paymentTerms.find(pt => pt.id === supplier.condicaoPagamentoId);
      if (paymentTerm) {
        setSelectedPaymentTerm(paymentTerm);
        form.setValue('idCondPagamento', paymentTerm.id.toString());
        setIsPaymentTermFromSupplier(true); // Bloquear alteração da condição de pagamento
      }
    } else {
      setIsPaymentTermFromSupplier(false); // Permitir alteração se fornecedor não tiver condição
    }
    
    setSupplierSearchOpen(false);
  };

  // Função para criar novo fornecedor
  const onCreateNewSupplier = () => {
    setSupplierToEdit(null);
    setSupplierDialogOpen(true);
    setSupplierSearchOpen(false);
  };

  // Função para editar fornecedor
  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setSupplierDialogOpen(true);
    setSupplierSearchOpen(false);
  };

  // Função chamada quando fornecedor é criado
  const handleSupplierCreated = (newSupplier: Supplier) => {
    setSuppliers((prev) => [...prev, newSupplier]);
    setSelectedSupplier(newSupplier);
    form.setValue('idFornecedor', newSupplier.id.toString());
    
    // Preencher automaticamente a condição de pagamento do fornecedor
    if (newSupplier.condicaoPagamentoId) {
      const paymentTerm = paymentTerms.find(pt => pt.id === newSupplier.condicaoPagamentoId);
      if (paymentTerm) {
        setSelectedPaymentTerm(paymentTerm);
        form.setValue('idCondPagamento', paymentTerm.id.toString());
        setIsPaymentTermFromSupplier(true);
      }
    }
    
    setSupplierDialogOpen(false);
    setSupplierSearchOpen(true);
    toast.success(`Fornecedor ${newSupplier.razaoSocial} criado com sucesso!`);
  };

  // Função chamada quando fornecedor é atualizado
  const handleSupplierUpdated = (updatedSupplier: Supplier) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      )
    );

    if (selectedSupplier && selectedSupplier.id === updatedSupplier.id) {
      setSelectedSupplier(updatedSupplier);
      
      // Atualizar condição de pagamento se mudou
      if (updatedSupplier.condicaoPagamentoId) {
        const paymentTerm = paymentTerms.find(pt => pt.id === updatedSupplier.condicaoPagamentoId);
        if (paymentTerm) {
          setSelectedPaymentTerm(paymentTerm);
          form.setValue('idCondPagamento', paymentTerm.id.toString());
          setIsPaymentTermFromSupplier(true);
        }
      } else {
        setIsPaymentTermFromSupplier(false);
      }
    }

    setSupplierToEdit(null);
    setSupplierDialogOpen(false);
    setSupplierSearchOpen(true);
    toast.success(`Fornecedor ${updatedSupplier.razaoSocial} atualizado com sucesso!`);
  };

  // Função para selecionar produto
  const onSelectProduct = (product: Product) => {
    setProdutoAtual({
      idProduto: product.id.toString(),
      nomeProduto: product.produto,
      unidade: product.unidadeMedidaNome || product.unidade || '',
      quantidade: '1',
      preco: formatCurrency(product.valorCompra || 0),
      desconto: '0,00',
    });
    setProductSearchOpen(false);
  };

  // Função para selecionar condição de pagamento
  const onSelectPaymentTerm = (paymentTerm: PaymentTerm) => {
    setSelectedPaymentTerm(paymentTerm);
    form.setValue('idCondPagamento', paymentTerm.id.toString());
    setIsProductsLocked(true);
    setPaymentTermSearchOpen(false);
  };

  // Função para selecionar transportadora
  const onSelectTransporter = (transporter: Transporter) => {
    setSelectedTransporter(transporter);
    form.setValue('idTransportadora', transporter.id.toString());
    setTransporterSearchOpen(false);
  };

  // Função para adicionar produto à lista
  const adicionarProduto = () => {
    if (!produtoAtual.idProduto) {
      toast.error('Selecione um produto');
      return;
    }

    const qtd = parseFloat(produtoAtual.quantidade.replace(',', '.')) || 0;
    const precoCents = parseCurrency(produtoAtual.preco);
    const descontoCents = parseCurrency(produtoAtual.desconto);

    if (qtd <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    // Validação: desconto não pode ser maior que o valor total do produto
    const valorTotalProduto = precoCents * qtd;
    if (descontoCents > valorTotalProduto) {
      toast.error('O desconto não pode ser maior que o valor total do produto');
      return;
    }

    const precoUN = precoCents;
    const descontoUN = descontoCents / qtd; // Desconto unitário
    const precoLiquidoUN = precoUN - descontoUN;
    const precoTotal = Math.round(precoLiquidoUN * qtd);

    const novoProduto: ProdutoItem = {
      ...produtoAtual,
      precoUN,
      descontoUN,
      precoLiquidoUN,
      precoTotal,
    };

    setProdutos([...produtos, novoProduto]);
    setProdutoAtual({
      idProduto: '',
      nomeProduto: '',
      unidade: '',
      quantidade: '1',
      preco: '0,00',
      desconto: '0,00',
    });

    // Bloqueia o header após adicionar o primeiro produto
    setIsHeaderLocked(true);
    toast.success('Produto adicionado');
  };

  // Função para remover produto
  const removerProduto = (index: number) => {
    const novosProdutos = produtos.filter((_, i) => i !== index);
    setProdutos(novosProdutos);

    // Se não houver mais produtos, desbloqueia o header e a seção de produtos
    if (novosProdutos.length === 0) {
      setIsHeaderLocked(false);
      setIsProductsLocked(false);
      form.setValue('idCondPagamento', '');
      setSelectedPaymentTerm(null);
      setParcelas([]);
    }
  };

  // Handler para mudanças nos campos financeiros
  const handleFinancialFieldChange = (fieldName: string, value: string) => {
    if (produtos.length > 0) {
      setIsHeaderLocked(true);
      setIsProductsLocked(true);
    }
    form.setValue(fieldName as any, value);
  };

  // Função para submeter o formulário
  const onSubmit = async (data: FormData) => {
    if (produtos.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    if (parcelas.length === 0) {
      toast.error('Selecione uma condição de pagamento');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        numeroNota: data.numeroNota,
        modelo: data.modelo || '55',
        serie: data.serie || '1',
        fornecedorId: parseInt(data.idFornecedor),
        dataEmissao: data.dataEmissao,
        dataChegada: data.dataChegada,
        tipoFrete: data.tipoFrete,
        valorFrete: parseCurrency(data.valorFrete) / 100, // Converter centavos para reais
        valorSeguro: parseCurrency(data.valorSeguro) / 100, // Converter centavos para reais
        outrasDespesas: parseCurrency(data.outrasDespesas) / 100, // Converter centavos para reais
        transportadoraId: data.idTransportadora ? parseInt(data.idTransportadora) : undefined,
        condicaoPagamentoId: parseInt(data.idCondPagamento),
        formaPagamentoId: data.idFormaPagamento ? parseInt(data.idFormaPagamento) : undefined,
        funcionarioId: 4, // TODO: Obter do contexto de autenticação
        observacoes: data.observacao,
        itens: produtosComRateio.map((p) => ({
          produtoId: parseInt(p.idProduto),
          quantidade: parseFloat(p.quantidade.replace(',', '.')),
          precoUn: p.precoUN / 100, // Converter centavos para reais
          descUn: p.descontoUN / 100, // Converter centavos para reais
          liquidoUn: p.precoLiquidoUN / 100, // Converter centavos para reais
          total: p.precoTotal / 100, // Converter centavos para reais
          rateio: (p.valorRateio || 0) / 100, // Converter centavos para reais
          custoFinalUn: Math.round((p.precoTotal + (p.valorRateio || 0)) / parseFloat(p.quantidade.replace(',', '.'))) / 100, // Converter centavos para reais
          custoFinal: (p.precoTotal + (p.valorRateio || 0)) / 100, // Converter centavos para reais
        })),
        parcelas: parcelas.map((p) => ({
          parcela: p.num_parcela,
          codigoFormaPagto: p.cod_forma_pagto.toString(),
          formaPagamentoId: p.cod_forma_pagto,
          dataVencimento: p.data_vencimento,
          valorParcela: p.valor_parcela / 100, // Converter centavos para reais
        })),
      };

      if (isEditing && id) {
        await purchaseApi.update(Number(id), payload);
        toast.success('Compra atualizada com sucesso!');
      } else {
        await purchaseApi.create(payload);
        toast.success('Compra criada com sucesso!');
      }
      navigate('/purchases');
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      toast.error('Erro ao salvar compra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/purchases">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Editar Compra' : 'Nova Compra'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? 'Edite as informações da compra abaixo'
                : 'Preencha as informações para registrar uma nova compra'}
            </p>
          </div>
        </div>

        {isEditing && purchaseData && (
          <AuditSection
            form={form}
            data={purchaseData}
            variant="header"
            isEditing={isEditing}
            statusFieldName="ativo"
          />
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados da Compra */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Dados da Compra
              </h3>
              <p className="text-sm text-muted-foreground">
                {isHeaderLocked 
                  ? 'Campos bloqueados após adicionar produtos' 
                  : 'Informações básicas da nota fiscal'}
              </p>
            </div>
            <div className="p-6 pt-0 space-y-6">
              {/* DADOS DO DOCUMENTO */}
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="modelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={isHeaderLocked || isLoading}
                              className={duplicateError ? 'border-red-500' : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="serie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Série</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={isHeaderLocked || isLoading}
                              className={duplicateError ? 'border-red-500' : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="numeroNota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={isHeaderLocked || isLoading}
                              className={duplicateError ? 'border-red-500' : ''}
                            />
                          </FormControl>
                          <FormMessage />
                          {isCheckingDuplicate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Verificando duplicidade...
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="dataEmissao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Emissão *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} disabled={isHeaderLocked || isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="dataChegada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Chegada *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} disabled={isHeaderLocked || isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="idFornecedor"
                      render={() => (
                        <FormItem>
                          <FormLabel>Cód. Fornecedor *</FormLabel>
                          <FormControl>
                            <div className="flex gap-1">
                              <Input
                                value={selectedSupplier?.id || ''}
                                readOnly
                                disabled={isHeaderLocked || isLoading}
                                className={duplicateError ? 'border-red-500' : ''}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setSupplierSearchOpen(true)}
                                disabled={isHeaderLocked || isLoading}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-10">
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input
                          value={selectedSupplier?.razaoSocial || ''}
                          readOnly
                          disabled
                          className={duplicateError ? 'border-red-500' : ''}
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
                
                {/* Alerta de duplicidade */}
                {duplicateError && (
                  <div className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-950/30 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-600 dark:text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                          Chave Composta Duplicada
                        </h3>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                          {duplicateError}
                        </p>
                        <p className="mt-2 text-xs text-red-600 dark:text-red-500">
                          A combinação de <strong>Número + Modelo + Série + Fornecedor</strong> deve ser única no sistema.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PRODUTOS */}
              <div className="border-t pt-6 space-y-4">

              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-1">
                  <Label>Cód. Produto *</Label>
                  <div className="flex gap-1">
                    <Input
                      value={produtoAtual.idProduto}
                      readOnly
                      disabled={!isHeaderComplete || isProductsLocked || isLoading || !!duplicateError}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setProductSearchOpen(true)}
                      disabled={!isHeaderComplete || isProductsLocked || isLoading || !!duplicateError}
                      title={duplicateError ? 'Corrija a duplicidade antes de adicionar produtos' : 'Buscar produto'}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="col-span-4">
                  <Label>Produto</Label>
                  <Input
                    value={produtoAtual.nomeProduto}
                    readOnly
                    disabled
                  />
                </div>

                <div className="col-span-1">
                  <Label>Unidade</Label>
                  <Input value={produtoAtual.unidade} readOnly disabled />
                </div>

                <div className="col-span-1">
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    value={produtoAtual.quantidade}
                    onChange={(e) =>
                      setProdutoAtual({ ...produtoAtual, quantidade: e.target.value })
                    }
                    disabled={!isHeaderComplete || isProductsLocked || isLoading}
                  />
                </div>

                <div className="col-span-1">
                  <Label>Preço *</Label>
                  <Input
                    value={produtoAtual.preco}
                    onChange={(e) => {
                      const parsed = parseCurrency(e.target.value);
                      setProdutoAtual({ ...produtoAtual, preco: formatCurrency(parsed) });
                    }}
                    disabled={!isHeaderComplete || isProductsLocked || isLoading}
                  />
                </div>

                <div className="col-span-1">
                  <Label>R$ Desconto</Label>
                  <Input
                    value={produtoAtual.desconto}
                    onChange={(e) => {
                      const parsed = parseCurrency(e.target.value);
                      setProdutoAtual({ ...produtoAtual, desconto: formatCurrency(parsed) });
                    }}
                    disabled={!isHeaderComplete || isProductsLocked || isLoading}
                    className={
                      parseCurrency(produtoAtual.desconto) > 
                      (parseFloat(produtoAtual.quantidade.replace(',', '.')) || 0) * parseCurrency(produtoAtual.preco)
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }
                  />
                  {parseCurrency(produtoAtual.desconto) > 
                   (parseFloat(produtoAtual.quantidade.replace(',', '.')) || 0) * parseCurrency(produtoAtual.preco) && (
                    <p className="text-xs text-red-500 mt-1">
                      Desconto não pode exceder o valor total
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <Label>Total</Label>
                  <Input
                    value={formatCurrency(
                      Math.round(parseFloat(produtoAtual.quantidade || '0') * parseCurrency(produtoAtual.preco)) -
                      parseCurrency(produtoAtual.desconto)
                    )}
                    readOnly
                    disabled
                    className={
                      parseCurrency(produtoAtual.desconto) > 
                      (parseFloat(produtoAtual.quantidade.replace(',', '.')) || 0) * parseCurrency(produtoAtual.preco)
                        ? 'border-red-500'
                        : ''
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Button
                    type="button"
                    onClick={adicionarProduto}
                    disabled={!isHeaderComplete || isProductsLocked || isLoading || !!duplicateError}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {produtos.length > 0 && (
                <div className="space-y-3">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Código</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Produto</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Unidade</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Qtd</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Preço UN</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Desc UN</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Líquido UN</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Total</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Rateio</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Custo Final UN</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Custo Final</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {produtosComRateio.map((produto, index) => {
                        const quantidade = parseFloat(produto.quantidade) || 1;
                        const custoFinalUN = (produto.valorTotalComRateio || produto.precoTotal) / quantidade;
                        return (
                          <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">{produto.idProduto}</td>
                            <td className="p-4 align-middle">{produto.nomeProduto}</td>
                            <td className="p-4 align-middle">{produto.unidade}</td>
                            <td className="p-4 align-middle text-right">{produto.quantidade}</td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(produto.precoUN)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(produto.descontoUN)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(produto.precoLiquidoUN)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(produto.precoTotal)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(produto.valorRateio || 0)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(Math.round(custoFinalUN))}
                            </td>
                            <td className="p-4 align-middle text-right font-semibold">
                              {formatCurrency(produto.valorTotalComRateio || produto.precoTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removerProduto(produtos.length - 1)}
                    disabled={produtos.length === 0 || isLoading}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir Produto
                  </Button>
                </div>
                </div>
              )}

              {/* VALORES FINANCEIROS */}
              <div className="border-t pt-6 space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="tipoFrete"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Frete</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  value="CIF"
                                  checked={field.value === 'CIF'}
                                  onChange={(e) => {
                                    handleFinancialFieldChange('tipoFrete', e.target.value);
                                    if (e.target.value === 'CIF') {
                                      handleFinancialFieldChange('valorFrete', '0,00');
                                      handleFinancialFieldChange('valorSeguro', '0,00');
                                    }
                                  }}
                                  disabled={!isHeaderComplete || isLoading}
                                />
                                <span className="text-sm">CIF</span>
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  value="FOB"
                                  checked={field.value === 'FOB'}
                                  onChange={(e) => handleFinancialFieldChange('tipoFrete', e.target.value)}
                                  disabled={!isHeaderComplete || isLoading}
                                />
                                <span className="text-sm">FOB</span>
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="valorFrete"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Frete</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                const parsed = parseCurrency(e.target.value);
                                handleFinancialFieldChange('valorFrete', formatCurrency(parsed));
                              }}
                              disabled={!isHeaderComplete || form.watch('tipoFrete') === 'CIF' || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="valorSeguro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Seguro</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                const parsed = parseCurrency(e.target.value);
                                handleFinancialFieldChange('valorSeguro', formatCurrency(parsed));
                              }}
                              disabled={!isHeaderComplete || form.watch('tipoFrete') === 'CIF' || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="outrasDespesas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outras Despesas</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                const parsed = parseCurrency(e.target.value);
                                handleFinancialFieldChange('outrasDespesas', formatCurrency(parsed));
                              }}
                              disabled={!isHeaderComplete || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormItem>
                      <FormLabel>Total Produtos</FormLabel>
                      <FormControl>
                        <Input
                          value={formatCurrency(totais.totalProdutos)}
                          readOnly
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  </div>

                  <div className="col-span-2">
                    <FormItem>
                      <FormLabel>Total a Pagar</FormLabel>
                      <FormControl>
                        <Input
                          value={formatCurrency(totais.totalGeral)}
                          readOnly
                          disabled
                          className="font-semibold"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
              </div>

              {/* TRANSPORTE E PAGAMENTO */}
              <div className="border-t pt-6 space-y-4">
                <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2">
                  <FormItem>
                    <FormLabel>Cód. Transportadora</FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        <Input
                          value={selectedTransporter?.id || ''}
                          readOnly
                          disabled={!isHeaderComplete || isLoading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setTransporterSearchOpen(true)}
                          disabled={!isHeaderComplete || isLoading}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                </div>

                <div className="col-span-10">
                  <FormItem>
                    <FormLabel>Transportadora</FormLabel>
                    <FormControl>
                      <Input
                        value={selectedTransporter?.nome || ''}
                        readOnly
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <FormItem>
                      <FormLabel>Cód. Cond. Pagto *</FormLabel>
                      <FormControl>
                        <div className="flex gap-1">
                          <Input
                            value={selectedPaymentTerm?.id || ''}
                            readOnly
                            disabled={!isHeaderComplete || isLoading || isPaymentTermFromSupplier}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setPaymentTermSearchOpen(true)}
                            disabled={!isHeaderComplete || isLoading || isPaymentTermFromSupplier}
                            title={isPaymentTermFromSupplier ? 'Condição de pagamento definida pelo fornecedor' : 'Selecionar condição de pagamento'}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      {isPaymentTermFromSupplier && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Condição definida pelo fornecedor
                        </p>
                      )}
                    </FormItem>
                  </div>

                  <div className="col-span-10">
                    <FormField
                      control={form.control}
                      name="idCondPagamento"
                      render={() => (
                        <FormItem>
                          <FormLabel>Condição de Pagamento</FormLabel>
                          <FormControl>
                            <Input
                              value={selectedPaymentTerm?.name || ''}
                              readOnly
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              {/* Visualização da Estrutura da Condição de Pagamento */}
              {selectedPaymentTerm && selectedPaymentTerm.installments && selectedPaymentTerm.installments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Estrutura de Parcelas da Condição de Pagamento:
                  </div>
                  <div className="relative w-full overflow-auto rounded-md border">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b bg-muted/50">
                        <tr className="border-b transition-colors">
                          <th className="h-10 px-4 text-left align-middle font-medium">Parcela</th>
                          <th className="h-10 px-4 text-left align-middle font-medium">Dias até Vencimento</th>
                          <th className="h-10 px-4 text-left align-middle font-medium">Forma de Pagamento</th>
                          <th className="h-10 px-4 text-right align-middle font-medium">% do Total</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {selectedPaymentTerm.installments.map((inst) => {
                          const paymentMethod = paymentMethods.find(pm => pm.id === inst.paymentMethodId);
                          return (
                            <tr
                              key={inst.id}
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <td className="p-3 align-middle">{inst.installmentNumber}</td>
                              <td className="p-3 align-middle">{inst.daysToPayment} dias</td>
                              <td className="p-3 align-middle">{paymentMethod?.name || 'Não definido'}</td>
                              <td className="p-3 align-middle text-right">{inst.percentageValue.toFixed(2)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Parcelas Calculadas com Valores */}
              {parcelas.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Parcelas Calculadas (com valores):
                  </div>
                  <div className="relative w-full overflow-auto rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Parcela</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Cód. Forma Pagto</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Forma de Pagamento</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Data Vencimento</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Valor Parcela</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {parcelas.map((parcela) => (
                        <tr
                          key={parcela.num_parcela}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle">{parcela.num_parcela}</td>
                          <td className="p-4 align-middle">{parcela.cod_forma_pagto}</td>
                          <td className="p-4 align-middle">{parcela.forma_pagto_descricao}</td>
                          <td className="p-4 align-middle">
                            {format(parseISO(parcela.data_vencimento), 'dd/MM/yyyy')}
                          </td>
                          <td className="p-4 align-middle text-right font-semibold">
                            {formatCurrency(parcela.valor_parcela)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
              </div>

              {/* OBSERVAÇÕES */}
              <div className="border-t pt-6">
                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={4}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Observações adicionais sobre a compra..."
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* AÇÕES */}
              <div className="border-t pt-6">
                <div className="flex justify-end space-x-4">
                  <Link to="/purchases">
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={isLoading || isCheckingDuplicate || !!duplicateError}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCheckingDuplicate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Atualizar' : 'Salvar'}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* Diálogos de pesquisa */}
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
          { key: 'razaoSocial', header: 'Razão Social' },
          { key: 'nomeFantasia', header: 'Nome Fantasia' },
          { key: 'cnpjCpf', header: 'CNPJ/CPF' },
          { key: 'telefone', header: 'Telefone' },
        ]}
        searchKeys={['razaoSocial', 'nomeFantasia', 'cnpjCpf']}
        entityType="fornecedores"
        description="Selecione o fornecedor da compra, crie um novo ou edite um existente."
      />

      <SearchDialog
        open={productSearchOpen}
        onOpenChange={setProductSearchOpen}
        title="Selecionar Produto"
        entities={products}
        isLoading={isLoading}
        onSelect={onSelectProduct}
        displayColumns={[
          { key: 'produto', header: 'Nome' },
          { key: 'referencia', header: 'Referência' },
          { key: 'codigoBarras', header: 'Código de Barras' },
        ]}
        searchKeys={['produto', 'referencia', 'codigoBarras', 'descricao']}
        entityType="produtos"
        description="Selecione o produto a ser adicionado."
      />

      <SearchDialog
        open={paymentTermSearchOpen}
        onOpenChange={setPaymentTermSearchOpen}
        title="Selecionar Condição de Pagamento"
        entities={paymentTerms}
        isLoading={isLoading}
        onSelect={onSelectPaymentTerm}
        displayColumns={[
          { key: 'name', header: 'Nome' },
          { key: 'description', header: 'Descrição' },
          {
            key: (term) => term.installments?.length?.toString() || '0',
            header: 'Parcelas',
          },
        ]}
        searchKeys={['name', 'description']}
        entityType="condições de pagamento"
        description="Selecione a condição de pagamento da compra."
      />

      <SearchDialog
        open={transporterSearchOpen}
        onOpenChange={setTransporterSearchOpen}
        title="Selecionar Transportadora"
        entities={transporters}
        isLoading={isLoading}
        onSelect={onSelectTransporter}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'cnpj', header: 'CNPJ' },
          { key: 'cidadeNome', header: 'Cidade' },
        ]}
        searchKeys={['nome', 'nomeFantasia', 'cnpj']}
        entityType="transportadoras"
        description="Selecione a transportadora responsável pela entrega."
      />

      {/* Diálogo de criação/edição de fornecedor */}
      <SupplierCreationDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        onSuccess={supplierToEdit ? handleSupplierUpdated : handleSupplierCreated}
        supplier={supplierToEdit}
      />
    </div>
  );
}

export default PurchaseForm;

import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, parseISO } from 'date-fns';
import { DatePicker, stringToDate, dateToString } from '@/components/ui/date-picker';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Search, 
  Plus, 
  Trash, 
  FileText, 
  Hash, 
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  customerApi,
  productApi,
  paymentTermApi,
  salesApi,
  transporterApi,
  paymentMethodApi,
} from '@/services/api';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import AuditSection from '@/components/AuditSection';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { PaymentTerm } from '@/types/payment-term';
import { Transporter } from '@/types/transporter';
import { PaymentMethod } from '@/types/payment-method';
import CustomerCreationDialog from '@/components/dialogs/CustomerCreationDialog';

// Funções para formatar e desformatar moeda (trabalha em centavos)
const formatCurrency = (valueInCents: number): string => {
  const number = Number(valueInCents) / 100;
  if (isNaN(number)) return '0,00';
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseCurrency = (valueString: string | number): number => {
  if (typeof valueString !== 'string') {
    valueString = String(valueString || '0');
  }
  const digitsOnly = valueString.replace(/\D/g, '');
  return parseInt(digitsOnly, 10) || 0;
};

// Função para arredondar para um número específico de casas decimais
const roundToDecimals = (value: number, decimals: number): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
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

// NOTA: numeroNota no formulário mapeia para numeroPedido no backend
const formSchema = z.object({
  numeroNota: z.string().min(1, 'Número da nota é obrigatório'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  serie: z.string().min(1, 'Série é obrigatória'),
  idCliente: z.string().min(1, 'Cliente é obrigatório'),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
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

interface SaleFormProps {
  mode?: 'create' | 'edit' | 'view';
}

export function SaleForm({ mode = 'create' }: SaleFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = mode === 'edit';
  const [isLoading, setIsLoading] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);

  // Estados para entidades selecionadas
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedPaymentTerm, setSelectedPaymentTerm] =
    useState<PaymentTerm | null>(null);
  const [selectedTransporter, setSelectedTransporter] =
    useState<Transporter | null>(null);

  // Estado para controlar se a condição de pagamento vem do cliente (bloqueada)
  const [isPaymentTermFromCustomer, setIsPaymentTermFromCustomer] =
    useState(false);

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
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [paymentTermSearchOpen, setPaymentTermSearchOpen] = useState(false);
  const [transporterSearchOpen, setTransporterSearchOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  // Estados para edição
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Estados para controle de bloqueio
  const [isHeaderLocked, setIsHeaderLocked] = useState(false);
  const [isProductsLocked, setIsProductsLocked] = useState(false);

  // Estado para controle de verificação de chave composta
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Listas de entidades
  const [customers, setCustomers] = useState<Customer[]>([]);
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
      idCliente: '',
      dataEmissao: new Date().toISOString().split('T')[0],
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

  // Verifica se o header está completo (Número, Modelo, Série e Cliente preenchidos)
  const numeroNota = form.watch('numeroNota');
  const idCliente = form.watch('idCliente');
  const modelo = form.watch('modelo');
  const serie = form.watch('serie');

  const isHeaderComplete = useMemo(() => {
    return (
      numeroNota?.trim() !== '' &&
      idCliente?.trim() !== '' &&
      modelo?.trim() !== '' &&
      serie?.trim() !== ''
    );
  }, [numeroNota, idCliente, modelo, serie]);

  // Função para verificar se a chave composta já existe
  const checkDuplicateSale = async (
    numeroPedido: string,
    modeloDoc: string,
    serieDoc: string,
    clienteId: string,
  ) => {
    // Não verifica em modo de edição para a própria venda
    if (isEditing && id) {
      return;
    }

    // Valida se todos os campos da chave composta estão preenchidos
    if (!numeroPedido || !modeloDoc || !serieDoc || !clienteId) {
      setDuplicateError(null);
      return;
    }

    setIsCheckingDuplicate(true);
    setDuplicateError(null);

    try {
      // Usa a API específica para verificar existência
      const result = await salesApi.checkExists(
        numeroPedido,
        modeloDoc,
        serieDoc,
        clienteId,
      );

      if (result.exists) {
        const errorMsg = `Já existe uma venda com Número: ${numeroPedido}, Modelo: ${modeloDoc}, Série: ${serieDoc} e Cliente ID: ${clienteId}`;
        setDuplicateError(errorMsg);
        toast.error(errorMsg, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar duplicidade:', error);
      // Se houver erro na verificação, não bloqueamos o usuário
      toast.warning(
        'Não foi possível verificar duplicidade. Prossiga com cautela.',
      );
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Verifica duplicidade quando os campos da chave composta mudam
  useEffect(() => {
    if (numeroNota && modelo && serie && idCliente) {
      const timer = setTimeout(() => {
        checkDuplicateSale(numeroNota, modelo, serie, idCliente);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timer);
    } else {
      setDuplicateError(null);
    }
  }, [numeroNota, modelo, serie, idCliente, isEditing, id]);

  // Carrega listas de entidades
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          customersData,
          productsData,
          paymentTermsData,
          transportersData,
          paymentMethodsData,
        ] = await Promise.all([
          customerApi.getAll(),
          productApi.getAll(),
          paymentTermApi.getAll(),
          transporterApi.getAll(),
          paymentMethodApi.getAll(),
        ]);
        setCustomers(customersData);
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

  // Carrega dados da venda em modo de edição
  useEffect(() => {
    if (id && isEditing) {
      const loadSale = async () => {
        setIsLoading(true);
        try {
          const sale = await salesApi.getById(Number(id));
          setSaleData(sale);
          // TODO: Implementar conversão completa dos dados da venda
          form.reset({
            numeroNota: sale.numeroPedido || '',
            modelo: sale.modelo || '',
            serie: sale.serie || '',
            idCliente: sale.clienteId?.toString() || '',
            dataEmissao: sale.dataEmissao || '',
            tipoFrete: sale.tipoFrete || 'CIF',
            valorFrete: formatCurrency(sale.valorFrete || 0),
            valorSeguro: formatCurrency(sale.valorSeguro || 0),
            outrasDespesas: formatCurrency(sale.outrasDespesas || 0),
            idCondPagamento: sale.condicaoPagamentoId?.toString() || '',
            observacao: sale.observacoes || '',
          });
        } catch (error) {
          console.error('Erro ao carregar venda:', error);
          toast.error('Erro ao carregar venda');
          navigate('/sales');
        } finally {
          setIsLoading(false);
        }
      };
      loadSale();
    }
  }, [id, isEditing, form, navigate]);

  // Calcula produtos com rateio das despesas adicionais
  const produtosComRateio = useMemo(() => {
    if (produtos.length === 0) return [];

    const freteCents = parseCurrency(form.watch('valorFrete') || '0,00');
    const seguroCents = parseCurrency(form.watch('valorSeguro') || '0,00');
    const outrasDespesasCents = parseCurrency(
      form.watch('outrasDespesas') || '0,00',
    );
    const totalDespesasCents = freteCents + seguroCents + outrasDespesasCents;

    const totalProdutosCents = produtos.reduce(
      (acc, p) => acc + p.precoTotal,
      0,
    );

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
  }, [
    produtos,
    form.watch('valorFrete'),
    form.watch('valorSeguro'),
    form.watch('outrasDespesas'),
  ]);

  // Calcula totais
  const totais = useMemo(() => {
    const totalProdutos = produtosComRateio.reduce(
      (acc, p) => acc + p.precoTotal,
      0,
    );
    const totalRateio = produtosComRateio.reduce(
      (acc, p) => acc + (p.valorRateio || 0),
      0,
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

    const dataBase = parseISO(
      form.watch('dataEmissao') || new Date().toISOString().split('T')[0],
    );
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
      const valorFinal =
        idx === numParcelas - 1 ? valorParcela + resto : valorParcela;

      // Buscar o nome da forma de pagamento
      const paymentMethod = paymentMethods.find(
        (pm) => pm.id === inst.paymentMethodId,
      );
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
  }, [
    selectedPaymentTerm,
    totais.totalGeral,
    form.watch('dataEmissao'),
    paymentMethods,
  ]);

  // Função para selecionar cliente
  const onSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValue('idCliente', customer.id.toString());

    // Preencher automaticamente a condição de pagamento do cliente e bloquear
    if (customer.condicaoPagamentoId) {
      const paymentTerm = paymentTerms.find(
        (pt) => pt.id === customer.condicaoPagamentoId,
      );
      if (paymentTerm) {
        setSelectedPaymentTerm(paymentTerm);
        form.setValue('idCondPagamento', paymentTerm.id.toString());
        setIsPaymentTermFromCustomer(true); // Bloquear alteração da condição de pagamento
      }
    } else {
      setIsPaymentTermFromCustomer(false); // Permitir alteração se cliente não tiver condição
    }

    setCustomerSearchOpen(false);
  };

  // Função para criar novo cliente
  const onCreateNewCustomer = () => {
    setCustomerToEdit(null);
    setCustomerDialogOpen(true);
  };

  // Função para editar cliente
  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setCustomerDialogOpen(true);
  };

  // Função chamada quando cliente é criado
  const handleCustomerCreated = (newCustomer: Customer) => {
    setCustomers((prev) => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
    form.setValue('idCliente', newCustomer.id.toString());

    // Preencher automaticamente a condição de pagamento do cliente
    if (newCustomer.condicaoPagamentoId) {
      const paymentTerm = paymentTerms.find(
        (pt) => pt.id === newCustomer.condicaoPagamentoId,
      );
      if (paymentTerm) {
        setSelectedPaymentTerm(paymentTerm);
        form.setValue('idCondPagamento', paymentTerm.id.toString());
        setIsPaymentTermFromCustomer(true);
      }
    }

    setCustomerDialogOpen(false);
    setCustomerSearchOpen(true);
    toast.success(`Cliente ${newCustomer.razaoSocial} criado com sucesso!`);
  };

  // Função chamada quando cliente é atualizado
  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer,
      ),
    );

    if (selectedCustomer && selectedCustomer.id === updatedCustomer.id) {
      setSelectedCustomer(updatedCustomer);

      // Atualizar condição de pagamento se mudou
      if (updatedCustomer.condicaoPagamentoId) {
        const paymentTerm = paymentTerms.find(
          (pt) => pt.id === updatedCustomer.condicaoPagamentoId,
        );
        if (paymentTerm) {
          setSelectedPaymentTerm(paymentTerm);
          form.setValue('idCondPagamento', paymentTerm.id.toString());
          setIsPaymentTermFromCustomer(true);
        }
      } else {
        setIsPaymentTermFromCustomer(false);
      }
    }

    setCustomerToEdit(null);
    setCustomerDialogOpen(false);
    setCustomerSearchOpen(true);
    toast.success(
      `Cliente ${updatedCustomer.razaoSocial} atualizado com sucesso!`,
    );
  };

  // Função para selecionar produto
  const onSelectProduct = (product: Product) => {
    setProdutoAtual({
      idProduto: product.id.toString(),
      nomeProduto: product.produto,
      unidade: product.unidadeMedidaNome || product.unidade || '',
      quantidade: '1',
      preco: formatCurrency(product.valorVenda || 0), // Usar valorVenda para vendas
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
        numeroPedido: data.numeroNota, // O campo numeroNota do form é o número do pedido
        modelo: data.modelo,
        serie: data.serie,
        clienteId: parseInt(data.idCliente),
        dataEmissao: data.dataEmissao,
        tipoFrete: data.tipoFrete,
        valorFrete: roundToDecimals(parseCurrency(data.valorFrete) / 100, 2), // Converter centavos para reais com 2 decimais
        valorSeguro: roundToDecimals(parseCurrency(data.valorSeguro) / 100, 2), // Converter centavos para reais com 2 decimais
        outrasDespesas: roundToDecimals(parseCurrency(data.outrasDespesas) / 100, 2), // Converter centavos para reais com 2 decimais
        transportadoraId: data.idTransportadora
          ? parseInt(data.idTransportadora)
          : undefined,
        condicaoPagamentoId: parseInt(data.idCondPagamento),
        formaPagamentoId: data.idFormaPagamento
          ? parseInt(data.idFormaPagamento)
          : undefined,
        // funcionarioId será auto-selecionado pelo backend (primeiro funcionário ativo)
        observacoes: data.observacao,
        itens: produtosComRateio.map((p) => ({
          produtoId: parseInt(p.idProduto),
          quantidade: parseFloat(p.quantidade.replace(',', '.')),
          precoUn: roundToDecimals(p.precoUN / 100, 4), // Converter centavos para reais com 4 decimais
          descUn: roundToDecimals(p.descontoUN / 100, 4), // Converter centavos para reais com 4 decimais
          liquidoUn: roundToDecimals(p.precoLiquidoUN / 100, 4), // Converter centavos para reais com 4 decimais
          total: roundToDecimals(p.precoTotal / 100, 2), // Converter centavos para reais com 2 decimais
          rateio: roundToDecimals((p.valorRateio || 0) / 100, 2), // Converter centavos para reais com 2 decimais
          custoFinalUn: roundToDecimals(
            (p.precoTotal + (p.valorRateio || 0)) /
              parseFloat(p.quantidade.replace(',', '.')) / 100,
            4
          ), // Converter centavos para reais com 4 decimais
          custoFinal: roundToDecimals((p.precoTotal + (p.valorRateio || 0)) / 100, 2), // Converter centavos para reais com 2 decimais
        })),
        parcelas: parcelas.map((p) => ({
          parcela: p.num_parcela,
          codigoFormaPagto: p.cod_forma_pagto.toString(),
          formaPagamentoId: p.cod_forma_pagto,
          dataVencimento: p.data_vencimento,
          valorParcela: roundToDecimals(p.valor_parcela / 100, 2), // Converter centavos para reais com 2 decimais
        })),
      };

      if (isEditing && id) {
        await salesApi.update(Number(id), payload);
        toast.success('Venda atualizada com sucesso!');
      } else {
        await salesApi.create(payload);
        toast.success('Venda criada com sucesso!');
      }
      navigate('/sales');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast.error('Erro ao salvar venda');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/sales">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Editar Venda' : 'Nova Venda'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? 'Edite as informações da venda abaixo'
                : 'Preencha as informações para registrar uma nova venda'}
            </p>
          </div>
        </div>

        {isEditing && saleData && (
          <AuditSection
            form={form}
            data={saleData}
            variant="header"
            isEditing={isEditing}
            statusFieldName="ativo"
          />
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados da Venda */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Dados da Venda
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
                      name="numeroNota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da Nota*</FormLabel>
                          <FormControl>
                            <InputWithIcon
                              icon={<Hash className="h-4 w-4" />}
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
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="modelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo *</FormLabel>
                          <FormControl>
                            <InputWithIcon
                              icon={<FileText className="h-4 w-4" />}
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
                          <FormLabel>Série *</FormLabel>
                          <FormControl>
                            <InputWithIcon
                              icon={<FileText className="h-4 w-4" />}
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

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="dataEmissao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Emissão *</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value ? stringToDate(field.value) : undefined}
                              onSelect={(date) => {
                                field.onChange(date ? dateToString(date) : '');
                              }}
                              placeholder="Selecione a data de emissão"
                              disabled={isHeaderLocked || isLoading}
                              disabledDate={(date) => {
                                // Não pode ser data futura
                                const today = new Date();
                                today.setHours(23, 59, 59, 999);
                                return date > today;
                              }}
                              fromYear={2000}
                              toYear={2050}
                            />
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
                      name="idCliente"
                      render={() => (
                        <FormItem>
                          <FormLabel>Cód. Cliente *</FormLabel>
                          <FormControl>
                            <div className="flex gap-1">
                              <Input
                                value={selectedCustomer?.id || ''}
                                readOnly
                                disabled={isHeaderLocked || isLoading}
                                className={
                                  duplicateError ? 'border-red-500' : ''
                                }
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setCustomerSearchOpen(true)}
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
                      <FormLabel>Cliente</FormLabel>
                      <FormControl>
                        <Input
                          value={selectedCustomer?.razaoSocial || ''}
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
                          A combinação de{' '}
                          <strong>Número + Modelo + Série + Cliente</strong>{' '}
                          deve ser única no sistema.
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
                    <Label htmlFor="cod-produto">Cód.</Label>
                    <div className="flex gap-1">
                      <Input
                        id="cod-produto"
                        value={produtoAtual.idProduto}
                        readOnly
                        disabled={
                          !isHeaderComplete || isProductsLocked || isLoading
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setProductSearchOpen(true)}
                        disabled={
                          !isHeaderComplete || isProductsLocked || isLoading
                        }
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="col-span-4">
                    <Label htmlFor="nome-produto">Produto</Label>
                    <Input value={produtoAtual.nomeProduto} readOnly disabled />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor="unidade-produto">UN</Label>
                    <Input value={produtoAtual.unidade} readOnly disabled />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor="quantidade-produto">Qtd.</Label>
                    <Input
                      type="number"
                      value={produtoAtual.quantidade}
                      onChange={(e) =>
                        setProdutoAtual({
                          ...produtoAtual,
                          quantidade: e.target.value,
                        })
                      }
                      disabled={
                        !isHeaderComplete || isProductsLocked || isLoading
                      }
                    />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor="preco-produto">Preço</Label>
                    <Input
                      value={produtoAtual.preco}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const cents = parseCurrency(rawValue);
                        setProdutoAtual({
                          ...produtoAtual,
                          preco: formatCurrency(cents),
                        });
                      }}
                      disabled={
                        !isHeaderComplete || isProductsLocked || isLoading
                      }
                    />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor="desconto-produto">Desc.</Label>
                    <Input
                      value={produtoAtual.desconto}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const cents = parseCurrency(rawValue);
                        setProdutoAtual({
                          ...produtoAtual,
                          desconto: formatCurrency(cents),
                        });
                      }}
                      disabled={
                        !isHeaderComplete || isProductsLocked || isLoading
                      }
                    />
                  </div>

                  <div className="col-span-3">
                    <Button
                      type="button"
                      onClick={adicionarProduto}
                      disabled={
                        !isHeaderComplete || isProductsLocked || isLoading
                      }
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </div>
                </div>

                {produtos.length > 0 && (
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">
                            Produto
                          </th>
                          <th className="px-4 py-3 text-center font-medium">
                            UN
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Qtd.
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Preço UN
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Desc. UN
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Líquido UN
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Total
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Rateio
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Total c/ Rateio
                          </th>
                          <th className="px-4 py-3 text-center font-medium">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {produtosComRateio.map((produto, index) => (
                          <tr
                            key={index}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium">
                              {produto.nomeProduto}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {produto.unidade}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {produto.quantidade}
                            </td>
                            <td className="px-4 py-3 text-right">
                              R$ {formatCurrency(produto.precoUN)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              R$ {formatCurrency(produto.descontoUN)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              R$ {formatCurrency(produto.precoLiquidoUN)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              R$ {formatCurrency(produto.precoTotal)}
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground">
                              R$ {formatCurrency(produto.valorRateio || 0)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">
                              R${' '}
                              {formatCurrency(produto.valorTotalComRateio || 0)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {!isProductsLocked && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerProduto(index)}
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* FRETE E DESPESAS */}
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
                              <div className="flex gap-2 mt-2">
                                <label className="flex items-center gap-1">
                                  <input
                                    type="radio"
                                    value="CIF"
                                    checked={field.value === 'CIF'}
                                    onChange={(e) => {
                                      handleFinancialFieldChange(
                                        'tipoFrete',
                                        e.target.value,
                                      );
                                      if (e.target.value === 'CIF') {
                                        handleFinancialFieldChange(
                                          'valorFrete',
                                          '0,00',
                                        );
                                        handleFinancialFieldChange(
                                          'valorSeguro',
                                          '0,00',
                                        );
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
                                    onChange={(e) =>
                                      handleFinancialFieldChange(
                                        'tipoFrete',
                                        e.target.value,
                                      )
                                    }
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
                              <InputWithIcon
                                icon={<DollarSign className="h-4 w-4" />}
                                {...field}
                                onChange={(e) => {
                                  const parsed = parseCurrency(e.target.value);
                                  handleFinancialFieldChange(
                                    'valorFrete',
                                    formatCurrency(parsed),
                                  );
                                }}
                                disabled={
                                  !isHeaderComplete ||
                                  form.watch('tipoFrete') === 'CIF' ||
                                  isLoading
                                }
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
                              <InputWithIcon
                                icon={<DollarSign className="h-4 w-4" />}
                                {...field}
                                onChange={(e) => {
                                  const parsed = parseCurrency(e.target.value);
                                  handleFinancialFieldChange(
                                    'valorSeguro',
                                    formatCurrency(parsed),
                                  );
                                }}
                                disabled={
                                  !isHeaderComplete ||
                                  form.watch('tipoFrete') === 'CIF' ||
                                  isLoading
                                }
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
                                  handleFinancialFieldChange(
                                    'outrasDespesas',
                                    formatCurrency(parsed),
                                  );
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
                </div>

                {/* CONDIÇÃO DE PAGAMENTO */}
                <div className="border-t pt-6 space-y-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                      <Label>Condição de Pagamento *</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={
                            selectedPaymentTerm
                              ? `${selectedPaymentTerm.id} - ${selectedPaymentTerm.name}`
                              : ''
                          }
                          placeholder="Clique para selecionar a condição de pagamento"
                          readOnly
                          disabled={
                            produtos.length === 0 ||
                            isProductsLocked ||
                            isLoading ||
                            isPaymentTermFromCustomer
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPaymentTermSearchOpen(true)}
                          disabled={
                            produtos.length === 0 ||
                            isProductsLocked ||
                            isLoading ||
                            isPaymentTermFromCustomer
                          }
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      {isPaymentTermFromCustomer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Condição preenchida automaticamente do cadastro do
                          cliente
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Parcelas */}
                  {parcelas.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-3">
                        Parcelas Geradas
                      </h4>
                      <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                          <thead className="border-b bg-muted/50">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium">
                                Nº
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Forma de Pagamento
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Data Vencimento
                              </th>
                              <th className="px-4 py-3 text-right font-medium">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {parcelas.map((parcela) => (
                              <tr
                                key={parcela.num_parcela}
                                className="border-b hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-3">
                                  {parcela.num_parcela}
                                </td>
                                <td className="px-4 py-3">
                                  {parcela.forma_pagto_descricao}
                                </td>
                                <td className="px-4 py-3">
                                  {format(
                                    parseISO(parcela.data_vencimento),
                                    'dd/MM/yyyy',
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                  R$ {formatCurrency(parcela.valor_parcela)}
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
                            disabled={produtos.length === 0 || isLoading}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Digite observações sobre a venda"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="border-t pt-6">
                  <div className="flex gap-4 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/sales')}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        produtos.length === 0 ||
                        parcelas.length === 0 ||
                        !!duplicateError
                      }
                      onClick={form.handleSubmit(onSubmit)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {isEditing ? 'Atualizar' : 'Salvar'} Venda
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auditoria (apenas em modo edição) */}
          {isEditing && saleData && (
            <AuditSection
              form={form}
              data={{
                id: saleData.id,
                createdAt: saleData.createdAt,
                updatedAt: saleData.updatedAt,
              }}
              isEditing={isEditing}
            />
          )}
        </form>
      </Form>

      {/* Diálogos de pesquisa */}
      <SearchDialog
        open={customerSearchOpen}
        onOpenChange={setCustomerSearchOpen}
        title="Selecionar Cliente"
        entities={customers}
        isLoading={isLoading}
        onSelect={onSelectCustomer}
        onCreateNew={onCreateNewCustomer}
        onEdit={handleEditCustomer}
        displayColumns={[
          { key: 'razaoSocial', header: 'Razão Social' },
          { key: 'nomeFantasia', header: 'Nome Fantasia' },
          { key: 'cnpjCpf', header: 'CNPJ/CPF' },
          { key: 'telefone', header: 'Telefone' },
        ]}
        searchKeys={['razaoSocial', 'nomeFantasia', 'cnpjCpf']}
        entityType="clientes"
        description="Selecione o cliente da venda, crie um novo ou edite um existente."
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
        description="Selecione a condição de pagamento da venda."
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

      {/* Diálogo de criação/edição de cliente */}
      <CustomerCreationDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onSuccess={
          customerToEdit ? handleCustomerUpdated : handleCustomerCreated
        }
        customer={customerToEdit}
      />
    </div>
  );
}

export default SaleForm;

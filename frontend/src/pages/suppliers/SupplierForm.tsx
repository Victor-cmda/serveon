import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supplierApi, cityApi, paymentTermApi, countryApi } from '@/services/api';
import { City, Country } from '@/types/location';
import { PaymentTerm } from '@/types/payment-term';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import { Form } from '@/components/ui/form';
import AuditSection from '@/components/AuditSection';

import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CityCreationDialog from '@/components/dialogs/CityCreationDialog';
import PaymentTermCreationDialog from '@/components/dialogs/PaymentTermCreationDialog';
import CountryCreationDialog from '@/components/dialogs/CountryCreationDialog';

// Importa os componentes modulares
import GeneralDataSection from './components/GeneralDataSection';
import AddressSection from './components/AddressSection';
import ContactSection from './components/ContactSection';
import DocumentsSection from './components/DocumentsSection';
import PaymentSection from './components/PaymentSection';
import SupplierSpecificSection from './components/SupplierSpecificSection';
import FinancialDataSection from './components/FinancialDataSection';
import ObservationsSection from './components/ObservationsSection';

// Funções de validação personalizadas
const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  const calcDigit = (base: string): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * (base.length + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const digit1 = calcDigit(digits.slice(0, 9));
  const digit2 = calcDigit(digits.slice(0, 10));
  
  return digit1 === parseInt(digits[9]) && digit2 === parseInt(digits[10]);
};

const validateCNPJ = (cnpj: string): boolean => {
  if (!cnpj) return false;
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  
  const calcDigit = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  const digit1 = calcDigit(digits.slice(0, 12), weights1);
  const digit2 = calcDigit(digits.slice(0, 13), weights2);
  
  return digit1 === parseInt(digits[12]) && digit2 === parseInt(digits[13]);
};

// Formatadores de texto aprimorados
const formatters = {
  cpf: (value: string | undefined): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const cpf = digits.slice(0, 11);
    return cpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
      (_, p1, p2, p3, p4) => {
        if (p4) return `${p1}.${p2}.${p3}-${p4}`;
        if (p3) return `${p1}.${p2}.${p3}`;
        if (p2) return `${p1}.${p2}`;
        return p1;
      },
    );
  },
  cnpj: (value: string | undefined): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const cnpj = digits.slice(0, 14);
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
      (_, p1, p2, p3, p4, p5) => {
        if (p5) return `${p1}.${p2}.${p3}/${p4}-${p5}`;
        if (p4) return `${p1}.${p2}.${p3}/${p4}`;
        if (p3) return `${p1}.${p2}.${p3}`;
        if (p2) return `${p1}.${p2}`;
        return p1;
      },
    );
  },
  telefone: (value: string | undefined): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const tel = digits.slice(0, 11);
    if (tel.length > 10) {
      return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (tel.length > 6) {
      return tel.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        return p1;
      });
    } else {
      return tel.replace(/(\d{0,2})/, (_, p1) => {
        if (p1.length === 2) return `(${p1})`;
        return p1;
      });
    }
  },
  numero: (value: string | undefined): string => {
    if (!value) return '';
    // Permite números, letras e alguns caracteres especiais comuns em números de endereço
    return value.replace(/[^0-9a-zA-Z\s\-\/]/g, '').slice(0, 10);
  },
  inscricaoEstadual: (value: string | null | undefined): string => {
    if (!value) return '';
    // Remove caracteres especiais exceto letras, números, pontos e hífens
    return value.replace(/[^\w\.\-]/g, '').slice(0, 20);
  },
  rg: (value: string | undefined): string => {
    if (!value) return '';
    // Formato mais comum: 12.345.678-9 (permite variações por estado)
    const digits = value.replace(/\D/g, '');
    const rg = digits.slice(0, 9);
    return rg.replace(/(\d{2})(\d{3})(\d{3})(\d{0,1})/, (_, p1, p2, p3, p4) => {
      if (p4) return `${p1}.${p2}.${p3}-${p4}`;
      if (p3) return `${p1}.${p2}.${p3}`;
      if (p2) return `${p1}.${p2}`;
      return p1;
    });
  },
  text: (value: string | null | undefined, maxLength: number = 100): string => {
    if (!value) return '';
    return value.slice(0, maxLength);
  },
  email: (value: string | null | undefined): string => {
    if (!value) return '';
    // Remove espaços e limita o tamanho
    return value.replace(/\s/g, '').slice(0, 100);
  },
  website: (value: string | null | undefined): string => {
    if (!value) return '';
    // Remove espaços e limita o tamanho
    return value.replace(/\s/g, '').slice(0, 200);
  },
  clearFormat: (value: string | null | undefined): string => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  },
  currency: (value: number | undefined): string => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },
};

const formSchema = z.object({
  tipo: z.enum(['F', 'J']),
  isEstrangeiro: z.boolean().default(false),
  cnpjCpf: z.string()
    .min(1, 'CNPJ/CPF é obrigatório')
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 11;
    }, 'Documento deve ter pelo menos 11 dígitos'),
  razaoSocial: z.string()
    .min(2, 'Razão Social/Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Razão Social/Nome deve ter no máximo 100 caracteres')
    .refine((value) => value.trim().length > 0, 'Razão Social/Nome é obrigatório'),
  nomeFantasia: z.string()
    .max(100, 'Nome Fantasia/Apelido deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  inscricaoEstadual: z.string()
    .max(20, 'Inscrição Estadual/RG deve ter no máximo 20 caracteres')
    .nullable()
    .optional(),
  endereco: z.string()
    .max(100, 'Endereço deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  numero: z.string()
    .max(10, 'Número deve ter no máximo 10 caracteres')
    .nullable()
    .optional(),
  complemento: z.string()
    .max(50, 'Complemento deve ter no máximo 50 caracteres')
    .nullable()
    .optional(),
  bairro: z.string()
    .max(50, 'Bairro deve ter no máximo 50 caracteres')
    .nullable()
    .optional(),
  cidadeId: z.number().optional(),
  cep: z.string()
    .nullable()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, '');
      return digits.length === 0 || digits.length === 8;
    }, 'CEP deve ter 8 dígitos'),
  telefone: z.string()
    .nullable()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, '');
      return digits.length === 0 || digits.length >= 10;
    }, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string()
    .nullable()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }, 'Email inválido'),
  limiteCredito: z.number()
    .optional()
    .refine((value) => {
      return value === undefined || value >= 0;
    }, 'Limite de crédito deve ser maior ou igual a zero'),
  nacionalidadeId: z.number().optional(),
  ativo: z.boolean().default(true),
  website: z.string()
    .nullish()
    .default('')
    .transform(val => val || '')
    .refine((value) => {
      if (!value) return true;
      
      const trimmedWebsite = value.trim();
      if (!trimmedWebsite) return true;
      
      try {
        // Converte para lowercase para verificação de protocolo
        const lowerWebsite = trimmedWebsite.toLowerCase();
        const urlWithProtocol = lowerWebsite.startsWith('http://') || lowerWebsite.startsWith('https://') 
          ? trimmedWebsite 
          : `https://${trimmedWebsite}`;
        
        const url = new URL(urlWithProtocol);
        return url.hostname.includes('.');
      } catch {
        // Remove protocolo case-insensitive para regex
        const withoutProtocol = trimmedWebsite.replace(/^https?:\/\//i, '');
        const simpleRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|[0-9]{1,3})$/i;
        return simpleRegex.test(withoutProtocol);
      }
    }, 'URL inválida (ex: https://exemplo.com)')
    .refine((value) => {
      return !value || value.length <= 200;
    }, 'Website deve ter no máximo 200 caracteres'),
  observacoes: z.string()
    .nullish()
    .default('')
    .transform(val => val || '')
    .refine((value) => {
      return !value || value.length <= 500;
    }, 'Observações deve ter no máximo 500 caracteres'),
  responsavel: z.string()
    .nullish()
    .default('')
    .transform(val => val || '')
    .refine((value) => {
      return !value || value.length <= 100;
    }, 'Nome do responsável deve ter no máximo 100 caracteres'),
  celularResponsavel: z.string()
    .nullish()
    .default('')
    .transform(val => val || '')
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, '');
      return digits.length === 0 || digits.length >= 10;
    }, 'Celular deve ter pelo menos 10 dígitos'),
  condicaoPagamentoId: z.number().optional(),
}).refine((data) => {
  // Validação específica para CPF/CNPJ baseada no tipo
  if (data.isEstrangeiro) return true;
  
  if (data.tipo === 'F') {
    return validateCPF(data.cnpjCpf);
  } else {
    return validateCNPJ(data.cnpjCpf);
  }
}, {
  message: 'Documento inválido',
  path: ['cnpjCpf']
});

export default function SupplierForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [supplierData, setSupplierData] = useState<any>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [selectedPaymentTerm, setSelectedPaymentTerm] =
    useState<PaymentTerm | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [paymentTermSearchOpen, setPaymentTermSearchOpen] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [cityCreationOpen, setCityCreationOpen] = useState(false);
  const [stateCreationOpen, setStateCreationOpen] = useState(false);
  const [paymentTermCreationOpen, setPaymentTermCreationOpen] = useState(false);
  const [countryCreationOpen, setCountryCreationOpen] = useState(false);

  // Estados para edição de cidades e condições de pagamento
  const [cityToEdit, setCityToEdit] = useState<City | null>(null);
  const [paymentTermToEdit, setPaymentTermToEdit] =
    useState<PaymentTerm | null>(null);
  const [countryToEdit, setCountryToEdit] = useState<Country | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cnpjCpf: '',
      tipo: 'J' as const,
      isEstrangeiro: false,
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidadeId: undefined,
      cep: '',
      telefone: '',
      email: '',
      limiteCredito: undefined,
      nacionalidadeId: undefined,
      ativo: true,
      website: '',
      observacoes: '',
      responsavel: '',
      celularResponsavel: '',
      condicaoPagamentoId: undefined,
    },
  });
  const watchTipo = form.watch('tipo');
  const watchIsEstrangeiro = form.watch('isEstrangeiro');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const citiesData = await cityApi.getAll();
        setCities(citiesData);
        const paymentTermsData = await paymentTermApi.getAll();
        setPaymentTerms(paymentTermsData);
        const countriesData = await countryApi.getAll();
        setCountries(countriesData);
        if (id) {
          const supplier = await supplierApi.getById(Number(id));
          if (supplier) {
            setSupplierData(supplier);
            form.reset({
              ...supplier,
              tipo: supplier.tipo || 'J',
              isEstrangeiro: supplier.isEstrangeiro || false,
              cidadeId: supplier.cidadeId,
              nacionalidadeId: supplier.nacionalidadeId,
              limiteCredito: supplier.limiteCredito,
              ativo: supplier.ativo !== undefined ? supplier.ativo : true,
              condicaoPagamentoId: supplier.condicaoPagamentoId,
            });
            if (supplier.cidadeId) {
              const city = citiesData.find((c) => c.id === supplier.cidadeId);
              if (city) {
                setSelectedCity(city);
              }
            }
            if (supplier.nacionalidadeId) {
              const country = countriesData.find((c) => c.id === supplier.nacionalidadeId);
              if (country) {
                setSelectedCountry(country);
              }
            }
            if (supplier.condicaoPagamentoId) {
              const paymentTerm = paymentTermsData.find(
                (pt) => pt.id === supplier.condicaoPagamentoId,
              );
              if (paymentTerm) {
                setSelectedPaymentTerm(paymentTerm);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const formattedData = {
        ...values,
        cnpjCpf: formatters.clearFormat(values.cnpjCpf),
        telefone: formatters.clearFormat(values.telefone),
        celularResponsavel: formatters.clearFormat(values.celularResponsavel),
        cep: formatters.clearFormat(values.cep),
        cidadeId: values.cidadeId || undefined,
        nacionalidadeId: values.nacionalidadeId || undefined,
        limiteCredito: values.limiteCredito || undefined,
        condicaoPagamentoId: values.condicaoPagamentoId || undefined,
        inscricaoEstadual: values.inscricaoEstadual || undefined,
        nomeFantasia: values.nomeFantasia || undefined,
        endereco: values.endereco || undefined,
        numero: values.numero || undefined,
        complemento: values.complemento || undefined,
        bairro: values.bairro || undefined,
        email: values.email || undefined,
      };
      Object.keys(formattedData).forEach((key) => {
        const typedKey = key as keyof typeof formattedData;
        if (formattedData[typedKey] === undefined) {
          delete formattedData[typedKey];
        }
      });
      if (isEditing) {
        await supplierApi.update(Number(id), formattedData);
        toast.success('Fornecedor atualizado com sucesso');
      } else {
        await supplierApi.create(formattedData);
        toast.success('Fornecedor criado com sucesso');
      }

      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/suppliers');
      }
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast.error('Erro ao salvar fornecedor');
    } finally {
      setIsLoading(false);
    }
  }
  async function onCitySelected(city: City) {
    setSelectedCity(city);
    form.setValue('cidadeId', city.id);
    setCitySearchOpen(false);
  }

  async function onPaymentTermSelected(term: PaymentTerm) {
    setSelectedPaymentTerm(term);
    form.setValue('condicaoPagamentoId', term.id);
    setPaymentTermSearchOpen(false);
  }

  async function onCountrySelected(country: Country) {
    setSelectedCountry(country);
    form.setValue('nacionalidadeId', country.id);
    setCountrySearchOpen(false);
  }

  async function onStateCreated() {
    try {
      const citiesData = await cityApi.getAll();
      setCities(citiesData);
      setStateCreationOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar estados após criação:', error);
      toast.error('Erro ao atualizar estados após criação');
    }
  }

  // Funções para edição de cidades
  const handleEditCity = (city: City) => {
    setCityToEdit(city);
    setCitySearchOpen(false);
    setCityCreationOpen(true);
  };

  const handleCityUpdated = (updatedCity: City) => {
    setCities((prev) =>
      prev.map((city) => (city.id === updatedCity.id ? updatedCity : city)),
    );

    if (selectedCity && selectedCity.id === updatedCity.id) {
      setSelectedCity(updatedCity);
    }

    setCityToEdit(null);
    toast.success(`Cidade ${updatedCity.nome} atualizada com sucesso!`);
  };
  const handleCityCreated = (newCity: City) => {
    setCities((prev) => [...prev, newCity]);
    setCityCreationOpen(false);
    setCitySearchOpen(true);
    toast.success(
      `Cidade ${newCity.nome} criada com sucesso! Selecione-a na lista.`,
    );
  };

  // Funções para edição de condições de pagamento
  const handleEditPaymentTerm = (paymentTerm: PaymentTerm) => {
    setPaymentTermToEdit(paymentTerm);
    setPaymentTermSearchOpen(false);
    setPaymentTermCreationOpen(true);
  };
  const handlePaymentTermCreated = (newPaymentTerm: PaymentTerm) => {
    setPaymentTerms((prev) => [...prev, newPaymentTerm]);
    setPaymentTermCreationOpen(false);
    setPaymentTermSearchOpen(true);
    toast.success(
      `Condição de pagamento ${newPaymentTerm.name} criada com sucesso! Selecione-a na lista.`,
    );
  };

  const handlePaymentTermUpdated = (updatedPaymentTerm: PaymentTerm) => {
    setPaymentTerms((prev) =>
      prev.map((term) =>
        term.id === updatedPaymentTerm.id ? updatedPaymentTerm : term,
      ),
    );

    if (
      selectedPaymentTerm &&
      selectedPaymentTerm.id === updatedPaymentTerm.id
    ) {
      setSelectedPaymentTerm(updatedPaymentTerm);
    }

    setPaymentTermToEdit(null);
    toast.success(
      `Condição de pagamento ${updatedPaymentTerm.name} atualizada com sucesso!`,
    );
  };

  // Funções para edição de países
  const handleEditCountry = (country: Country) => {
    setCountryToEdit(country);
    setCountrySearchOpen(false);
    setCountryCreationOpen(true);
  };

  const handleCountryCreated = (newCountry: Country) => {
    setCountries((prev) => [...prev, newCountry]);
    setCountryCreationOpen(false);
    setCountrySearchOpen(true);
    toast.success(
      `País ${newCountry.nome} criado com sucesso! Selecione-o na lista.`,
    );
  };

  const handleCountryUpdated = (updatedCountry: Country) => {
    setCountries((prev) =>
      prev.map((country) =>
        country.id === updatedCountry.id ? updatedCountry : country,
      ),
    );

    if (selectedCountry && selectedCountry.id === updatedCountry.id) {
      setSelectedCountry(updatedCountry);
    }

    setCountryToEdit(null);
    toast.success(
      `País ${updatedCountry.nome} atualizado com sucesso!`,
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/suppliers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? 'Edite as informações do fornecedor abaixo'
                : 'Preencha as informações para criar um novo fornecedor'}
            </p>
          </div>
        </div>

        {/* AuditSection no header */}
        <AuditSection
          form={form}
          data={supplierData}
          variant="header"
          isEditing={isEditing}
          statusFieldName="ativo" // Campo de status é 'ativo' para Supplier
        />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Informações do Fornecedor
              </h3>
              <p className="text-sm text-muted-foreground">
                Preencha todas as informações necessárias do fornecedor
              </p>
            </div>
            <div className="p-6 pt-0 space-y-6">
              <GeneralDataSection
                form={form}
                isLoading={isLoading}
                watchTipo={watchTipo}
                formatters={formatters}
              />

              <AddressSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
                selectedCity={selectedCity}
                setCitySearchOpen={setCitySearchOpen}
                setSelectedCity={setSelectedCity}
              />
              
              <ContactSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
              />

              <SupplierSpecificSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
              />

              <FinancialDataSection
                form={form}
                isLoading={isLoading}
                selectedCountry={selectedCountry}
                setCountrySearchOpen={setCountrySearchOpen}
              />

              <PaymentSection
                form={form}
                isLoading={isLoading}
                selectedPaymentTerm={selectedPaymentTerm}
                setPaymentTermSearchOpen={setPaymentTermSearchOpen}
              />

              <DocumentsSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
                watchTipo={watchTipo}
                watchIsEstrangeiro={watchIsEstrangeiro}
              />

              <ObservationsSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link to="/suppliers">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Salvar'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>{' '}
      <SearchDialog
        title="Selecione uma cidade"
        open={citySearchOpen}
        onOpenChange={setCitySearchOpen}
        entities={cities}
        isLoading={isLoading}
        onSelect={onCitySelected}
        onCreateNew={() => {
          setCityToEdit(null);
          setCitySearchOpen(false);
          setCityCreationOpen(true);
        }}
        onEdit={handleEditCity}
        searchKeys={['nome', 'uf', 'estadoNome']}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'estadoNome', header: 'Estado' },
          { key: 'uf', header: 'UF' },
        ]}
        entityType="cidades"
        description="Selecione uma cidade para o cadastro do fornecedor ou edite uma cidade existente."
      />{' '}
      <SearchDialog
        title="Selecione uma condição de pagamento"
        open={paymentTermSearchOpen}
        onOpenChange={setPaymentTermSearchOpen}
        entities={paymentTerms}
        isLoading={isLoading}
        onSelect={onPaymentTermSelected}
        onCreateNew={() => {
          setPaymentTermToEdit(null);
          setPaymentTermSearchOpen(false);
          setPaymentTermCreationOpen(true);
        }}
        onEdit={handleEditPaymentTerm}
        searchKeys={['name', 'description']}
        displayColumns={[
          { key: 'name', header: 'Nome' },
          { key: 'description', header: 'Descrição' },
          {
            key: (term) => term.installments?.length?.toString() || '0',
            header: 'Parcelas',
          },
        ]}
        entityType="condições de pagamento"
        description="Selecione uma condição de pagamento para o cadastro do fornecedor ou cadastre uma nova."
      />

      <SearchDialog
        title="Selecione uma nacionalidade"
        open={countrySearchOpen}
        onOpenChange={setCountrySearchOpen}
        entities={countries}
        isLoading={isLoading}
        onSelect={onCountrySelected}
        onCreateNew={() => {
          setCountryToEdit(null);
          setCountrySearchOpen(false);
          setCountryCreationOpen(true);
        }}
        onEdit={handleEditCountry}
        searchKeys={['nome', 'sigla', 'codigo']}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'sigla', header: 'Sigla' },
          { key: 'codigo', header: 'Código' },
        ]}
        entityType="países"
        description="Selecione uma nacionalidade para o fornecedor ou cadastre um novo país."
      />

      {/* Diálogos de criação */}
      <StateCreationDialog
        open={stateCreationOpen}
        onOpenChange={setStateCreationOpen}
        onSuccess={() => {
          onStateCreated();
        }}
      />{' '}
      <CityCreationDialog
        open={cityCreationOpen}
        onOpenChange={setCityCreationOpen}
        onSuccess={cityToEdit ? handleCityUpdated : handleCityCreated}
        selectedStateId={undefined}
        city={cityToEdit}
      />
      <PaymentTermCreationDialog
        open={paymentTermCreationOpen}
        onOpenChange={setPaymentTermCreationOpen}
        onSuccess={
          paymentTermToEdit
            ? handlePaymentTermUpdated
            : handlePaymentTermCreated
        }
        paymentTerm={paymentTermToEdit}
      />

      <CountryCreationDialog
        open={countryCreationOpen}
        onOpenChange={setCountryCreationOpen}
        onSuccess={
          countryToEdit
            ? handleCountryUpdated
            : handleCountryCreated
        }
        country={countryToEdit}
      />
    </div>
  );
}

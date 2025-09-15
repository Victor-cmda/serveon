import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supplierApi, cityApi, paymentTermApi, countryApi } from '@/services/api';
import { Supplier } from '@/types/supplier';
import { City, Country } from '@/types/location';
import { PaymentTerm } from '@/types/payment-term';
import { SearchDialog } from '@/components/SearchDialog';
import CityCreationDialog from './CityCreationDialog';
import PaymentTermCreationDialog from './PaymentTermCreationDialog';
import CountryCreationDialog from './CountryCreationDialog';

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

// Formatadores
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
  clearFormat: (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  },
};

const formSchema = z.object({
  fornecedor: z.string()
    .min(2, 'Nome do fornecedor deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do fornecedor deve ter no máximo 255 caracteres'),
  apelido: z.string()
    .min(1, 'Apelido é obrigatório')
    .max(255, 'Apelido deve ter no máximo 255 caracteres'),
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
    .max(100, 'Razão Social/Nome deve ter no máximo 100 caracteres'),
  nomeFantasia: z.string()
    .max(100, 'Nome Fantasia/Apelido deve ter no máximo 100 caracteres')
    .optional(),
  inscricaoEstadual: z.string()
    .max(20, 'Inscrição Estadual/RG deve ter no máximo 20 caracteres')
    .optional(),
  endereco: z.string()
    .max(100, 'Endereço deve ter no máximo 100 caracteres')
    .optional(),
  numero: z.string()
    .max(10, 'Número deve ter no máximo 10 caracteres')
    .optional(),
  complemento: z.string()
    .max(50, 'Complemento deve ter no máximo 50 caracteres')
    .optional(),
  bairro: z.string()
    .max(50, 'Bairro deve ter no máximo 50 caracteres')
    .optional(),
  cidadeId: z.number().optional(),
  cep: z.string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, '');
      return digits.length === 0 || digits.length === 8;
    }, 'CEP deve ter 8 dígitos'),
  telefone: z.string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, '');
      return digits.length === 0 || digits.length >= 10;
    }, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string()
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
  website: z.string().optional(),
  observacoes: z.string().optional(),
  responsavel: z.string().optional(),
  celularResponsavel: z.string().optional(),
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

interface SupplierCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (supplier: Supplier) => void;
  supplier?: Supplier | null; // Fornecedor para edição
}

const SupplierCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  supplier,
}: SupplierCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<PaymentTerm | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  
  // Estados para dialogs
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [paymentTermSearchOpen, setPaymentTermSearchOpen] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [cityCreationOpen, setCityCreationOpen] = useState(false);
  const [paymentTermCreationOpen, setPaymentTermCreationOpen] = useState(false);
  const [countryCreationOpen, setCountryCreationOpen] = useState(false);
  
  // Estados para edição
  const [cityToEdit, setCityToEdit] = useState<City | null>(null);
  const [paymentTermToEdit, setPaymentTermToEdit] = useState<PaymentTerm | null>(null);
  const [countryToEdit, setCountryToEdit] = useState<Country | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fornecedor: '',
      apelido: '',
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
    if (open) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          const [citiesData, paymentTermsData, countriesData] = await Promise.all([
            cityApi.getAll(),
            paymentTermApi.getAll(),
            countryApi.getAll(),
          ]);
          
          setCities(citiesData);
          setPaymentTerms(paymentTermsData);
          setCountries(countriesData);

          if (supplier) {
            // Carregando para edição
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

            // Configurar entidades selecionadas
            if (supplier.cidadeId) {
              const city = citiesData.find((c) => c.id === supplier.cidadeId);
              if (city) setSelectedCity(city);
            }

            if (supplier.nacionalidadeId) {
              const country = countriesData.find((c) => c.id === supplier.nacionalidadeId);
              if (country) setSelectedCountry(country);
            }

            if (supplier.condicaoPagamentoId) {
              const paymentTerm = paymentTermsData.find((pt) => pt.id === supplier.condicaoPagamentoId);
              if (paymentTerm) setSelectedPaymentTerm(paymentTerm);
            }
          } else {
            // Reset para criação
            form.reset({
              fornecedor: '',
              apelido: '',
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
            });
            setSelectedCity(null);
            setSelectedPaymentTerm(null);
            setSelectedCountry(null);
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
          toast.error('Erro ao carregar dados');
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [open, form, supplier]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
      };

      // Remove campos undefined
      Object.keys(formattedData).forEach((key) => {
        const typedKey = key as keyof typeof formattedData;
        if (formattedData[typedKey] === undefined) {
          delete formattedData[typedKey];
        }
      });

      let savedSupplier;

      if (supplier) {
        // Edição
        savedSupplier = await supplierApi.update(supplier.id, formattedData);
        toast.success(`Fornecedor ${values.fornecedor} atualizado com sucesso!`);
      } else {
        // Criação
        savedSupplier = await supplierApi.create(formattedData);
        toast.success(`Fornecedor ${values.fornecedor} criado com sucesso!`);
      }

      onSuccess(savedSupplier);
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Erro ao salvar fornecedor:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao salvar o fornecedor.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para seleção de entidades
  const onCitySelected = (city: City) => {
    setSelectedCity(city);
    form.setValue('cidadeId', city.id);
    setCitySearchOpen(false);
  };

  const onPaymentTermSelected = (term: PaymentTerm) => {
    setSelectedPaymentTerm(term);
    form.setValue('condicaoPagamentoId', term.id);
    setPaymentTermSearchOpen(false);
  };

  const onCountrySelected = (country: Country) => {
    setSelectedCountry(country);
    form.setValue('nacionalidadeId', country.id);
    setCountrySearchOpen(false);
  };

  // Handlers para edição de entidades
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
    toast.success(`Cidade ${newCity.nome} criada com sucesso! Selecione-a na lista.`);
  };

  const handleEditPaymentTerm = (paymentTerm: PaymentTerm) => {
    setPaymentTermToEdit(paymentTerm);
    setPaymentTermSearchOpen(false);
    setPaymentTermCreationOpen(true);
  };

  const handlePaymentTermCreated = (newPaymentTerm: PaymentTerm) => {
    setPaymentTerms((prev) => [...prev, newPaymentTerm]);
    setPaymentTermCreationOpen(false);
    setPaymentTermSearchOpen(true);
    toast.success(`Condição de pagamento ${newPaymentTerm.name} criada com sucesso! Selecione-a na lista.`);
  };

  const handlePaymentTermUpdated = (updatedPaymentTerm: PaymentTerm) => {
    setPaymentTerms((prev) =>
      prev.map((term) =>
        term.id === updatedPaymentTerm.id ? updatedPaymentTerm : term,
      ),
    );

    if (selectedPaymentTerm && selectedPaymentTerm.id === updatedPaymentTerm.id) {
      setSelectedPaymentTerm(updatedPaymentTerm);
    }

    setPaymentTermToEdit(null);
    toast.success(`Condição de pagamento ${updatedPaymentTerm.name} atualizada com sucesso!`);
  };

  const handleEditCountry = (country: Country) => {
    setCountryToEdit(country);
    setCountrySearchOpen(false);
    setCountryCreationOpen(true);
  };

  const handleCountryCreated = (newCountry: Country) => {
    setCountries((prev) => [...prev, newCountry]);
    setCountryCreationOpen(false);
    setCountrySearchOpen(true);
    toast.success(`País ${newCountry.nome} criado com sucesso! Selecione-o na lista.`);
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
    toast.success(`País ${updatedCountry.nome} atualizado com sucesso!`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[65vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {supplier ? 'Editar fornecedor' : 'Adicionar novo fornecedor'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {supplier
                ? 'Altere os campos abaixo para atualizar o fornecedor.'
                : 'Preencha os campos abaixo para cadastrar um novo fornecedor.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              {/* Dados Gerais */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dados Gerais</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fornecedor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Fornecedor *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do fornecedor"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apelido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apelido *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Apelido do fornecedor"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="F">Pessoa Física</SelectItem>
                            <SelectItem value="J">Pessoa Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isEstrangeiro"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Estrangeiro</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Ativo</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Documentos */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Documentos</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cnpjCpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchTipo === 'F' ? 'CPF' : 'CNPJ'} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              watchTipo === 'F'
                                ? '000.000.000-00'
                                : '00.000.000/0000-00'
                            }
                            {...field}
                            value={
                              watchTipo === 'F'
                                ? formatters.cpf(field.value)
                                : formatters.cnpj(field.value)
                            }
                            onChange={(e) => {
                              const formatted =
                                watchTipo === 'F'
                                  ? formatters.cpf(e.target.value)
                                  : formatters.cnpj(e.target.value);
                              field.onChange(formatted);
                            }}
                            disabled={isLoading || watchIsEstrangeiro}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="razaoSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchTipo === 'F' ? 'Nome Completo' : 'Razão Social'} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              watchTipo === 'F'
                                ? 'Nome completo'
                                : 'Razão social'
                            }
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nomeFantasia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchTipo === 'F' ? 'Apelido' : 'Nome Fantasia'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              watchTipo === 'F'
                                ? 'Apelido'
                                : 'Nome fantasia'
                            }
                            {...field}
                            value={field.value || ''}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inscricaoEstadual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchTipo === 'F' ? 'RG' : 'Inscrição Estadual'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              watchTipo === 'F'
                                ? 'RG'
                                : 'Inscrição estadual'
                            }
                            {...field}
                            value={field.value || ''}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contato</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            value={formatters.telefone(field.value)}
                            onChange={(e) => {
                              const formatted = formatters.telefone(e.target.value);
                              field.onChange(formatted);
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                            value={field.value || ''}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Cidade */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Localização</h3>
                
                <FormField
                  control={form.control}
                  name="cidadeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            value={selectedCity ? `${selectedCity.nome} - ${selectedCity.uf}` : ''}
                            readOnly
                            placeholder="Selecione uma cidade"
                            className="cursor-pointer"
                            onClick={() => setCitySearchOpen(true)}
                            disabled={isLoading}
                          />
                          <input type="hidden" {...field} />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => setCitySearchOpen(true)}
                          disabled={isLoading}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Condição de Pagamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Condições Comerciais</h3>
                
                <FormField
                  control={form.control}
                  name="condicaoPagamentoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição de Pagamento</FormLabel>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            value={selectedPaymentTerm ? selectedPaymentTerm.name : ''}
                            readOnly
                            placeholder="Selecione uma condição de pagamento"
                            className="cursor-pointer"
                            onClick={() => setPaymentTermSearchOpen(true)}
                            disabled={isLoading}
                          />
                          <input type="hidden" {...field} />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => setPaymentTermSearchOpen(true)}
                          disabled={isLoading}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* SearchDialogs */}
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
        description="Selecione uma cidade para o fornecedor."
      />

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
        description="Selecione uma condição de pagamento para o fornecedor."
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
        description="Selecione uma nacionalidade para o fornecedor."
      />

      {/* Creation Dialogs */}
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
    </>
  );
};

export default SupplierCreationDialog;
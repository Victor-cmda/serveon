import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supplierApi, cityApi, paymentTermApi } from '@/services/api';
import { City } from '@/types/location';
import { PaymentTerm } from '@/types/payment-term';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import { Form } from '@/components/ui/form';

import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CityCreationDialog from '@/components/dialogs/CityCreationDialog';
import PaymentTermCreationDialog from '@/components/dialogs/PaymentTermCreationDialog';

// Importa os componentes modulares
import GeneralDataSection from './components/GeneralDataSection';
import AddressSection from './components/AddressSection';
import ContactSection from './components/ContactSection';
import DocumentsSection from './components/DocumentsSection';
import PaymentSection from './components/PaymentSection';
import SupplierSpecificSection from './components/SupplierSpecificSection';

// Formatadores de texto
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
    } else {
      return tel.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1.length === 2) return `(${p1})`;
        return p1;
      });
    }
  },
  cep: (value: string | undefined): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const cep = digits.slice(0, 8);
    return cep.replace(/(\d{5})(\d{0,3})/, (_, p1, p2) => {
      if (p2) return `${p1}-${p2}`;
      return p1;
    });
  },
  numero: (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/[^0-9a-zA-Z/-]/g, '');
  },
  inscricaoEstadual: (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/[^\w]/g, '');
  },
  clearFormat: (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  },
};

const formSchema = z.object({
  cnpjCpf: z.string().min(1, 'CNPJ/CPF é obrigatório'),
  tipo: z.enum(['F', 'J']),
  isEstrangeiro: z.boolean().default(false),
  razaoSocial: z.string().min(1, 'Razão Social/Nome é obrigatório'),
  nomeFantasia: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidadeId: z.number().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  ativo: z.boolean().default(true),
  website: z.string().optional(),
  observacoes: z.string().optional(),
  responsavel: z.string().optional(),
  celularResponsavel: z.string().optional(),
  condicaoPagamentoId: z.number().optional(),
});

export default function SupplierForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [selectedPaymentTerm, setSelectedPaymentTerm] =
    useState<PaymentTerm | null>(null);

  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [paymentTermSearchOpen, setPaymentTermSearchOpen] = useState(false);
  const [cityCreationOpen, setCityCreationOpen] = useState(false);
  const [stateCreationOpen, setStateCreationOpen] = useState(false);
  const [paymentTermCreationOpen, setPaymentTermCreationOpen] = useState(false);

  // Estados para edição de cidades e condições de pagamento
  const [cityToEdit, setCityToEdit] = useState<City | null>(null);
  const [paymentTermToEdit, setPaymentTermToEdit] = useState<PaymentTerm | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cnpjCpf: '',
      tipo: 'J' as const,
      isEstrangeiro: false,
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidadeId: undefined,
      cep: '',
      telefone: '',
      email: '',
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
        if (id) {
          const supplier = await supplierApi.getById(Number(id));
          if (supplier) {
            form.reset({
              ...supplier,
              tipo: supplier.tipo || 'J',
              isEstrangeiro: supplier.isEstrangeiro || false,
              cidadeId: supplier.cidadeId,
              ativo: supplier.ativo !== undefined ? supplier.ativo : true,
              condicaoPagamentoId: supplier.condicaoPagamentoId,
            });
            if (supplier.cidadeId) {
              const city = citiesData.find((c) => c.id === supplier.cidadeId);
              if (city) {
                setSelectedCity(city);
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
        condicaoPagamentoId: values.condicaoPagamentoId || undefined,
      };
      Object.keys(formattedData).forEach((key) => {
        if ((formattedData as any)[key] === undefined) {
          delete (formattedData as any)[key];
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

  async function onStateCreated() {
    try {
      const citiesData = await cityApi.getAll();
      setCities(citiesData);
      setStateCreationOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar estados após criação:', error);
      toast.error('Erro ao atualizar estados após criação');    }
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
    toast.success(`Cidade ${newCity.nome} criada com sucesso! Selecione-a na lista.`);
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
    toast.success(`Condição de pagamento ${newPaymentTerm.name} criada com sucesso! Selecione-a na lista.`);
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
    toast.success(`Condição de pagamento ${updatedPaymentTerm.name} atualizada com sucesso!`);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing
              ? 'Atualize as informações do fornecedor conforme necessário'
              : 'Preencha as informações para cadastrar um novo fornecedor'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link to="/suppliers">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </div>
      <Form {...form}>
        {' '}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Dados Gerais</h2>
                <GeneralDataSection
                  form={form}
                  isLoading={isLoading}
                  watchTipo={watchTipo}
                  id={id}
                />
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Documentos</h2>
                <DocumentsSection
                  form={form}
                  isLoading={isLoading}
                  formatters={formatters}
                  watchTipo={watchTipo}
                  watchIsEstrangeiro={watchIsEstrangeiro}
                />
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Endereço</h2>
                <AddressSection
                  form={form}
                  isLoading={isLoading}
                  formatters={formatters}
                  selectedCity={selectedCity}
                  watchIsEstrangeiro={watchIsEstrangeiro}
                  setCitySearchOpen={setCitySearchOpen}
                />
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Contato</h2>
                <ContactSection
                  form={form}
                  isLoading={isLoading}
                  formatters={formatters}
                />
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">
                  Informações Adicionais
                </h2>
                <SupplierSpecificSection
                  form={form}
                  isLoading={isLoading}
                  formatters={formatters}
                />
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Pagamento</h2>
                <PaymentSection
                  form={form}
                  isLoading={isLoading}
                  selectedPaymentTerm={selectedPaymentTerm}
                  setPaymentTermSearchOpen={setPaymentTermSearchOpen}
                />
              </div>

              <div className="flex justify-end pt-4 mt-2 border-t">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 px-6 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Fornecedor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>{' '}      <SearchDialog
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
      />      <SearchDialog
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
      {/* Diálogos de criação */}
      <StateCreationDialog
        open={stateCreationOpen}
        onOpenChange={setStateCreationOpen}
        onSuccess={() => {
          onStateCreated();
        }}
      />      <CityCreationDialog
        open={cityCreationOpen}
        onOpenChange={setCityCreationOpen}
        onSuccess={
          cityToEdit
            ? handleCityUpdated
            : handleCityCreated
        }
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
    </div>
  );
}

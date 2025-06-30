import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { stateApi, countryApi } from '@/services/api';
import { Country } from '@/types/location';
import { toast } from 'sonner';
import CountryCreationDialog from '@/components/dialogs/CountryCreationDialog';
import { SearchDialog } from '@/components/SearchDialog';
import AuditSection from '@/components/AuditSection';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome do estado é obrigatório e deve ter pelo menos 2 caracteres'),
  uf: z.string().length(2, 'UF deve ter exatamente 2 caracteres').toUpperCase(),
  paisId: z.number().min(1, 'Selecione um país válido'),
  ativo: z.boolean().default(true),
});

const StateForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [countryToEdit, setCountryToEdit] = useState<Country | null>(null);
  const [stateData, setStateData] = useState<any>(null);
  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      uf: '',
      paisId: 0,
      ativo: true,
    },
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await countryApi.getAll();
        setCountries(data);
      } catch (error) {
        console.error('Erro ao buscar países:', error);
        toast.error('Não foi possível carregar a lista de países.');
      }
    };

    fetchCountries();
  }, []);
  useEffect(() => {
    const fetchState = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const state = await stateApi.getById(Number(id));
        setStateData(state);
        form.reset({
          nome: state.nome,
          uf: state.uf,
          paisId: state.paisId,
          ativo: state.ativo,
        });
      } catch (error) {
        console.error('Erro ao buscar estado:', error);
        toast.error('Não foi possível carregar os dados do estado.');
        navigate('/states');
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();
  }, [id, navigate, form]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const countryId = params.get('countryId');

    if (countryId) {
      form.setValue('paisId', Number(countryId));
    }
  }, [location.search, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      let createdOrUpdatedId: number | undefined;

      // Format the data to handle empty strings
      const formattedData = {
        nome: data.nome.trim(),
        uf: data.uf.trim(),
        paisId: data.paisId,      };      if (id) {
        await stateApi.update(Number(id), formattedData);
        toast.success('Estado atualizado com sucesso!');
        createdOrUpdatedId = Number(id);
      } else {
        const createdState = await stateApi.create(formattedData);
        toast.success('Estado criado com sucesso!');
        createdOrUpdatedId = createdState.id;
      }
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        // Handle cascading form returns, pass the created/updated entity ID back to the parent form
        const returnWithParams = `${returnUrl}?createdEntity=state&createdId=${createdOrUpdatedId}`;
        navigate(returnWithParams);
      } else {
        // Only navigate to list view if not part of a cascading form
        navigate('/states');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar estado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao salvar o estado.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };  const handleCountryCreated = (newCountry: Country) => {
    setCountries((prev) => [...prev, newCountry]);
    setCountryDialogOpen(false);
    setCountrySearchOpen(true);
    toast.success(`País ${newCountry.nome} criado com sucesso! Selecione-o na lista.`);
  };

  const handleCountryUpdated = (updatedCountry: Country) => {
    // Atualiza o país na lista de países
    setCountries((prev) =>
      prev.map((country) =>
        country.id === updatedCountry.id ? updatedCountry : country,
      ),
    );
    setCountryToEdit(null);
  };

  const handleEditCountry = (country: Country) => {
    setCountryToEdit(country);
    setCountrySearchOpen(false);
    setCountryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/states">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id ? 'Editar Estado' : 'Novo Estado'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações do estado abaixo'
                : 'Preencha as informações para criar um novo estado'}
            </p>
          </div>
        </div>
        
        {/* AuditSection no header */}
        <AuditSection 
          form={form} 
          data={stateData}
          variant="header" 
          isEditing={!!id}
          statusFieldName="ativo" // Campo de status é 'ativo' para State
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Dados Gerais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Informações básicas do estado
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paisId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <div className="flex gap-2">
                          <div className="w-full flex-1">
                            <Input
                              value={
                                countries.find((c) => c.id === field.value)?.nome ||
                                ''
                              }
                              readOnly
                              placeholder="Selecione um país"
                              className="cursor-pointer"
                              onClick={() => setCountrySearchOpen(true)}
                            />
                            <input type="hidden" {...field} />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => setCountrySearchOpen(true)}
                            disabled={isLoading}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Estado *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do estado"
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
                    name="uf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: SP"
                            {...field}
                            maxLength={2}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link to="/states">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Atualizar' : 'Salvar'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>

      {/* Dialogs */}
      <CountryCreationDialog
        open={countryDialogOpen}
        onOpenChange={setCountryDialogOpen}
        onSuccess={countryToEdit ? handleCountryUpdated : handleCountryCreated}
        country={countryToEdit}
      />

      <SearchDialog
        open={countrySearchOpen}
        onOpenChange={setCountrySearchOpen}
        title="Selecionar País"
        entities={countries}
        isLoading={isLoading}
        onSelect={(country) => {
          form.setValue('paisId', country.id);
          setCountrySearchOpen(false);
        }}
        onCreateNew={() => {
          setCountrySearchOpen(false);
          setCountryDialogOpen(true);
        }}
        onEdit={handleEditCountry}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'sigla', header: 'Sigla' },
          { key: 'codigo', header: 'Código' },
        ]}
        searchKeys={['nome', 'sigla', 'codigo']}
        entityType="paises"
        description="Selecione um país para associar ao estado ou edite um país existente."
      />
    </div>
  );
};

export default StateForm;

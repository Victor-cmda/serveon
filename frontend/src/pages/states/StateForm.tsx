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
import { CreateStateDto, UpdateStateDto, Country } from '@/types/location';
import { toast } from 'sonner';
import CountryCreationDialog from '@/components/dialogs/CountryCreationDialog';
import { SearchDialog } from '@/components/SearchDialog';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome do estado é obrigatório e deve ter pelo menos 2 caracteres'),
  uf: z.string().length(2, 'UF deve ter exatamente 2 caracteres').toUpperCase(),
  paisId: z.string().uuid('Selecione um país válido'),
});

const StateForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [countryToEdit, setCountryToEdit] = useState<Country | null>(null);
  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      uf: '',
      paisId: '',
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
        const state = await stateApi.getById(id);
        form.reset({
          nome: state.nome,
          uf: state.uf,
          paisId: state.paisId,
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
      form.setValue('paisId', countryId);
    }
  }, [location.search, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      let createdOrUpdatedId: string;

      // Format the data to handle empty strings
      const formattedData = {
        nome: data.nome.trim(),
        uf: data.uf.trim(),
        paisId: data.paisId
      };

      if (id) {
        await stateApi.update(id, formattedData);
        toast.success('Estado atualizado com sucesso!');
        createdOrUpdatedId = id;
      } else {
        const createdState = await stateApi.create(formattedData);
        toast.success('Estado criado com sucesso!');
        createdOrUpdatedId = createdState.id;
      }      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        // Handle cascading form returns, pass the created/updated entity ID back to the parent form
        const returnWithParams = `${returnUrl}?createdEntity=state&createdId=${createdOrUpdatedId}`;
        navigate(returnWithParams);
      } else {
        // Only navigate to list view if not part of a cascading form
        navigate('/states');
      }
    } catch (error: any) {
      console.error('Erro ao salvar estado:', error);
      toast.error(error.message || 'Ocorreu um erro ao salvar o estado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryCreated = (newCountry: Country) => {
    setCountries((prev) => [...prev, newCountry]);
    form.setValue('paisId', newCountry.id);
    setCountryDialogOpen(false);
  };

  const handleCountryUpdated = (updatedCountry: Country) => {
    // Atualiza o país na lista de países
    setCountries((prev) => 
      prev.map((country) => 
        country.id === updatedCountry.id ? updatedCountry : country
      )
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
        <h1 className="text-2xl font-bold tracking-tight">
          {id ? 'Editar Estado' : 'Novo Estado'}
        </h1>
        <Button variant="outline" asChild>
          <Link to="/states">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="rounded-md border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="paisId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">País</FormLabel>
                  <div className="flex gap-2">
                    <div className="w-full flex-1">
                      <Input
                        value={
                          countries.find((c) => c.id === field.value)?.nome ||
                          ''
                        }
                        readOnly
                        placeholder="Selecione um país"
                        className="cursor-pointer h-11 text-base"
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
                      className="h-11 w-11"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Nome do Estado
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: São Paulo"
                      {...field}
                      disabled={isLoading}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    UF (2 caracteres)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: SP"
                      {...field}
                      maxLength={2}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                      disabled={isLoading}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 text-base"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                <Save className="mr-2 h-5 w-5" /> Salvar
              </Button>
            </div>
          </form>
        </Form>
      </div>

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

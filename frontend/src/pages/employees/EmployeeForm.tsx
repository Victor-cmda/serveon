import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2, Search, MapPin, Users, Briefcase } from 'lucide-react';
import { employeeApi } from '../../services/api';
import { toast } from '../../lib/toast';
import type { Department } from '../../types/department';
import type { Position } from '../../types/position';
import type { City } from '../../types/location';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { SearchDialog } from '../../components/SearchDialog';
import DepartmentCreationDialog from '../../components/dialogs/DepartmentCreationDialog';
import CityCreationDialog from '../../components/dialogs/CityCreationDialog';

const employeeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos'),
  email: z.string().email('Email inválido').max(100, 'Email deve ter no máximo 100 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  rg: z.string().max(20, 'RG deve ter no máximo 20 caracteres').optional(),
  cidadeId: z.number().optional(),
  cargoId: z.number().optional(),
  departamentoId: z.number().optional(),
  dataAdmissao: z.string().min(1, 'Data de admissão é obrigatória'),
  dataDemissao: z.string().optional(),
  ativo: z.boolean().default(true),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const defaultValues: EmployeeFormData = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  rg: '',
  cidadeId: undefined,
  cargoId: undefined,
  departamentoId: undefined,
  dataAdmissao: '',
  dataDemissao: '',
  ativo: true,
};

// Predefined options for cargo and departamento - Removido, agora carregamos do banco
// const cargos = [...] - Removido
// const departamentos = [...] - Removido

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();

  // Estados para entidades selecionadas
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Estados para diálogos de pesquisa
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [positionSearchOpen, setPositionSearchOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);

  // Estados para diálogos de criação
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [cityDialogOpen, setCityDialogOpen] = useState(false);

  // Estados para edição
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);
  const [cityToEdit, setCityToEdit] = useState<City | null>(null);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  useEffect(() => {
    loadDepartments();
    loadPositions();
    loadCities();
    if (id) {
      loadEmployee();
    }
  }, [id]);

  useEffect(() => {
    // Filtrar cargos quando departamento é selecionado
    if (selectedDepartmentId) {
      loadPositionsByDepartment(selectedDepartmentId);
    } else {
      loadPositions();
    }
  }, [selectedDepartmentId]);  const loadDepartments = async () => {
    try {
      const data = await employeeApi.getActiveDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os departamentos',
      });
    }
  };

  const loadCities = async () => {
    try {
      const data = await employeeApi.getActiveCities();
      setCities(data);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar as cidades',
      });
    }
  };

  const loadPositions = useCallback(async () => {
    try {
      const data = await employeeApi.getActivePositions();
      setPositions(data);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os cargos',
      });
    }
  }, []);

  const loadPositionsByDepartment = useCallback(async (departmentId: number) => {
    try {
      const data = await employeeApi.getPositionsByDepartment(departmentId);
      setPositions(data);
    } catch (error) {
      console.error('Erro ao carregar cargos do departamento:', error);
      // Fallback para todos os cargos
      loadPositions();
    }
  }, [loadPositions]);

  const loadEmployee = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await employeeApi.getById(parseInt(id));
      
      // Format dates for input fields
      const dataAdmissao = data.dataAdmissao ? new Date(data.dataAdmissao).toISOString().split('T')[0] : '';
      const dataDemissao = data.dataDemissao ? new Date(data.dataDemissao).toISOString().split('T')[0] : '';
      
      // Definir departamento selecionado para filtrar cargos
      if (data.departamentoId) {
        setSelectedDepartmentId(data.departamentoId);
        const department = departments.find(d => d.id === data.departamentoId);
        setSelectedDepartment(department || null);
      }

      // Definir cargo selecionado
      if (data.cargoId) {
        const position = positions.find(p => p.id === data.cargoId);
        setSelectedPosition(position || null);
      }

      // Definir cidade selecionada
      if (data.cidadeId) {
        const city = cities.find(c => c.id === data.cidadeId);
        setSelectedCity(city || null);
      }

      form.reset({
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        telefone: data.telefone || '',
        rg: data.rg || '',
        cargoId: data.cargoId,
        departamentoId: data.departamentoId,
        cidadeId: data.cidadeId,
        dataAdmissao,
        dataDemissao,
        ativo: data.ativo,
      });
    } catch (error) {
      console.error('Erro ao carregar funcionário:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os dados do funcionário',
      });
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate, departments, positions, cities]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setLoading(true);
      
      const submitData = {
        ...data,
        telefone: data.telefone || undefined,
        dataDemissao: data.dataDemissao || undefined,
      };

      if (id) {
        await employeeApi.update(parseInt(id), submitData);        toast.success('Sucesso', {
          description: 'Funcionário atualizado com sucesso',
        });
      } else {
        await employeeApi.create(submitData);        toast.success('Sucesso', {
          description: 'Funcionário criado com sucesso',
        });
      }
      
      navigate('/employees');
    } catch (error: unknown) {
      console.error('Erro ao salvar funcionário:', error);
      
      let errorMessage = 'Erro ao salvar funcionário';
      if (error instanceof Error) {
        if (error.message.includes('CPF')) {
          errorMessage = 'Este CPF já está cadastrado';
        } else if (error.message.includes('email')) {
          errorMessage = 'Este email já está cadastrado';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error('Erro', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  // Funções de seleção das entidades
  const onSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
    form.setValue('departamentoId', department.id);
    setSelectedDepartmentId(department.id);
    // Limpar cargo quando departamento muda
    form.setValue('cargoId', undefined);
    setSelectedPosition(null);
    setDepartmentSearchOpen(false);
  };

  const onSelectPosition = (position: Position) => {
    setSelectedPosition(position);
    form.setValue('cargoId', position.id);
    setPositionSearchOpen(false);
  };

  const onSelectCity = (city: City) => {
    setSelectedCity(city);
    form.setValue('cidadeId', city.id);
    setCitySearchOpen(false);
  };

  // Funções de criação de novas entidades
  const onCreateNewDepartment = () => {
    setDepartmentToEdit(null);
    setDepartmentDialogOpen(true);
    setDepartmentSearchOpen(false);
  };

  const onCreateNewCity = () => {
    setCityToEdit(null);
    setCityDialogOpen(true);
    setCitySearchOpen(false);
  };

  // Funções de edição
  const handleEditDepartment = (department: Department) => {
    setDepartmentToEdit(department);
    setDepartmentDialogOpen(true);
    setDepartmentSearchOpen(false);
  };

  const handleEditCity = (city: City) => {
    setCityToEdit(city);
    setCityDialogOpen(true);
    setCitySearchOpen(false);
  };

  // Funções de sucesso após criação/edição
  const handleDepartmentCreated = (department: Department) => {
    setDepartments(prev => [...prev, department]);
    setSelectedDepartment(department);
    form.setValue('departamentoId', department.id);
    setSelectedDepartmentId(department.id);
    setDepartmentDialogOpen(false);
  };

  const handleDepartmentUpdated = (department: Department) => {
    setDepartments(prev => prev.map(d => d.id === department.id ? department : d));
    if (selectedDepartment?.id === department.id) {
      setSelectedDepartment(department);
    }
    setDepartmentDialogOpen(false);
  };

  const handleCityCreated = (city: City) => {
    setCities(prev => [...prev, city]);
    setSelectedCity(city);
    form.setValue('cidadeId', city.id);
    setCityDialogOpen(false);
  };

  const handleCityUpdated = (city: City) => {
    setCities(prev => prev.map(c => c.id === city.id ? city : c));
    if (selectedCity?.id === city.id) {
      setSelectedCity(city);
    }
    setCityDialogOpen(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/employees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações do funcionário abaixo'
                : 'Preencha as informações para criar um novo funcionário'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Informações Pessoais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dados pessoais do funcionário
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  {id && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel className="text-base font-medium">Código</FormLabel>
                        <FormControl>
                          <Input 
                            value={id} 
                            disabled 
                            className="bg-muted h-11 text-base font-mono text-muted-foreground" 
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Código único do funcionário
                        </p>
                      </FormItem>
                      <div></div> {/* Espaço vazio para manter o grid */}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite o nome completo" 
                              {...field} 
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="12345678901"
                              {...field}
                              disabled={loading || !!id} // CPF não pode ser editado
                              onChange={(e) => field.onChange(formatCPF(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="funcionario@empresa.com"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="11987654321"
                              {...field}
                              disabled={loading}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o RG"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cidadeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <div className="flex w-full items-center gap-2">
                                <div className="relative flex-grow">
                                  <Input
                                    value={selectedCity?.nome || ''}
                                    readOnly
                                    placeholder="Selecione uma cidade"
                                    className="cursor-pointer h-10 text-base pl-9"
                                    onClick={() => setCitySearchOpen(true)}
                                  />
                                  <input
                                    type="hidden"
                                    name={field.name}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e);
                                    }}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                  />
                                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setCitySearchOpen(true)}
                                  className="h-10 w-10"
                                >
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                          </div>
                          {selectedCity && (
                            <div className="mt-1">
                              <Badge variant="outline">
                                {selectedCity.nome} - {selectedCity.uf}
                              </Badge>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Informações Profissionais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dados profissionais do funcionário
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departamentoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <div className="flex w-full items-center gap-2">
                                <div className="relative flex-grow">
                                  <Input
                                    value={selectedDepartment?.nome || ''}
                                    readOnly
                                    placeholder="Selecione um departamento"
                                    className="cursor-pointer h-10 text-base pl-9"
                                    onClick={() => setDepartmentSearchOpen(true)}
                                  />
                                  <input
                                    type="hidden"
                                    name={field.name}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e);
                                    }}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                  />
                                  <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDepartmentSearchOpen(true)}
                                  className="h-10 w-10"
                                >
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                          </div>
                          {selectedDepartment && (
                            <div className="mt-1">
                              <Badge variant="outline">
                                {selectedDepartment.nome}
                              </Badge>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cargoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <div className="flex w-full items-center gap-2">
                                <div className="relative flex-grow">
                                  <Input
                                    value={selectedPosition?.nome || ''}
                                    readOnly
                                    placeholder="Selecione um cargo"
                                    className="cursor-pointer h-10 text-base pl-9"
                                    onClick={() => setPositionSearchOpen(true)}
                                  />
                                  <input
                                    type="hidden"
                                    name={field.name}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e);
                                    }}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                  />
                                  <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setPositionSearchOpen(true)}
                                  className="h-10 w-10"
                                >
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                          </div>
                          {selectedPosition && (
                            <div className="mt-1">
                              <Badge variant="outline">
                                {selectedPosition.nome}
                                {selectedPosition.departamentoNome && ` (${selectedPosition.departamentoNome})`}
                              </Badge>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dataAdmissao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Admissão *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {id && (
                      <FormField
                        control={form.control}
                        name="dataDemissao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Demissão</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>                  {id && (
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={loading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base font-medium">
                              Funcionário Ativo
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Desative para ocultar o funcionário das listagens
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link to="/employees">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Atualizar' : 'Salvar'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>

      {/* Diálogos de Pesquisa */}
      <SearchDialog
        open={departmentSearchOpen}
        onOpenChange={setDepartmentSearchOpen}
        title="Selecionar Departamento"
        entities={departments}
        isLoading={loading}
        onSelect={onSelectDepartment}
        onCreateNew={onCreateNewDepartment}
        onEdit={handleEditDepartment}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'descricao', header: 'Descrição' },
        ]}
        searchKeys={['nome', 'descricao']}
        entityType="departamentos"
        description="Selecione um departamento para o funcionário ou crie um novo."
      />

      <SearchDialog
        open={positionSearchOpen}
        onOpenChange={setPositionSearchOpen}
        title="Selecionar Cargo"
        entities={positions}
        isLoading={loading}
        onSelect={onSelectPosition}
        onCreateNew={() => {}} // Cargo não tem criação direta
        onEdit={() => {}} // Cargo não tem edição direta
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'departamentoNome', header: 'Departamento' },
        ]}
        searchKeys={['nome', 'departamentoNome']}
        entityType="cargos"
        description="Selecione um cargo para o funcionário."
      />

      <SearchDialog
        open={citySearchOpen}
        onOpenChange={setCitySearchOpen}
        title="Selecionar Cidade"
        entities={cities}
        isLoading={loading}
        onSelect={onSelectCity}
        onCreateNew={onCreateNewCity}
        onEdit={handleEditCity}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'uf', header: 'UF' },
        ]}
        searchKeys={['nome', 'uf']}
        entityType="cidades"
        description="Selecione uma cidade para o funcionário ou crie uma nova."
      />

      {/* Diálogos de Criação */}
      <DepartmentCreationDialog
        open={departmentDialogOpen}
        onOpenChange={setDepartmentDialogOpen}
        onSuccess={departmentToEdit ? handleDepartmentUpdated : handleDepartmentCreated}
        department={departmentToEdit}
      />

      <CityCreationDialog
        open={cityDialogOpen}
        onOpenChange={setCityDialogOpen}
        onSuccess={cityToEdit ? handleCityUpdated : handleCityCreated}
        city={cityToEdit}
      />
    </div>
  );
};

export default EmployeeForm;

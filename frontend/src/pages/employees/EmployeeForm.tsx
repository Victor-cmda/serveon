import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { employeeApi } from '../../services/api';
import { toast } from '../../lib/toast';
import type { Department } from '../../types/department';
import type { Position } from '../../types/position';
import type { City } from '../../types/location';
import {
  Form,
} from '../../components/ui/form';
import AuditSection from '@/components/AuditSection';
import { Button } from '../../components/ui/button';
import { SearchDialog } from '../../components/SearchDialog';
import DepartmentCreationDialog from '../../components/dialogs/DepartmentCreationDialog';
import PositionCreationDialog from '../../components/dialogs/PositionCreationDialog';
import CityCreationDialog from '../../components/dialogs/CityCreationDialog';
import { clearFormat } from './utils/validationUtils';

// Componentes modulares
import EmployeePersonalSection from './components/EmployeePersonalSection';
import EmployeeDocumentsSection from './components/EmployeeDocumentsSection';
import EmployeeContactSection from './components/EmployeeContactSection';
import EmployeeAddressSection from './components/EmployeeAddressSection';
import EmployeeProfessionalSection from './components/EmployeeProfessionalSection';

const employeeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length === 11;
    }, 'CPF deve conter exatamente 11 dígitos')
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      // Validação básica de CPF (evitar sequências como 111.111.111-11)
      return !/^(\d)\1{10}$/.test(digits);
    }, 'CPF inválido'),
  email: z.string().email('Email inválido').max(100, 'Email deve ter no máximo 100 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  celular: z.string().max(20, 'Celular deve ter no máximo 20 caracteres').optional(),
  rg: z.string().max(20, 'RG deve ter no máximo 20 caracteres').optional(),
  orgaoEmissor: z.string().max(20, 'Órgão emissor deve ter no máximo 20 caracteres').optional(),
  dataNascimento: z.string().optional(),
  estadoCivil: z.string().optional(),
  nacionalidade: z.string().max(30, 'Nacionalidade deve ter no máximo 30 caracteres').optional(),
  
  // Endereço
  cep: z.string().max(10, 'CEP deve ter no máximo 10 caracteres').optional(),
  endereco: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional(),
  numero: z.string().max(10, 'Número deve ter no máximo 10 caracteres').optional(),
  complemento: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
  bairro: z.string().max(100, 'Bairro deve ter no máximo 100 caracteres').optional(),
  cidadeId: z.number().optional(),
  
  // Profissional
  cargoId: z.number().optional(),
  departamentoId: z.number().optional(),
  dataAdmissao: z.string().min(1, 'Data de admissão é obrigatória'),
  dataDemissao: z.string().optional(),
  salario: z.number().min(0, 'Salário deve ser maior ou igual a zero').optional(),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
  
  ativo: z.boolean().default(true),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const defaultValues: EmployeeFormData = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  celular: '',
  rg: '',
  orgaoEmissor: '',
  dataNascimento: '',
  estadoCivil: '',
  nacionalidade: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidadeId: undefined,
  cargoId: undefined,
  departamentoId: undefined,
  dataAdmissao: '',
  dataDemissao: '',
  salario: undefined,
  observacoes: '',
  ativo: true,
};

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
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
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [cityDialogOpen, setCityDialogOpen] = useState(false);

  // Estados para edição
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);
  const [positionToEdit, setPositionToEdit] = useState<Position | null>(null);
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
      setEmployeeData(data);
      
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
        if (city) {
          setSelectedCity(city);
        } else if (data.cidadeNome) {
          // Criar objeto cidade temporário com os dados disponíveis do funcionário
          const tempCity: City = {
            id: data.cidadeId,
            nome: data.cidadeNome,
            estadoId: 0, // Valor padrão
            estadoNome: data.estadoNome || 'N/A',
            uf: data.uf || 'N/A',
            paisNome: 'Brasil', // Valor padrão
            ativo: true,
            createdAt: '',
            updatedAt: ''
          };
          setSelectedCity(tempCity);
        } else {
          setSelectedCity(null);
        }
      }

      form.reset({
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        telefone: data.telefone || '',
        celular: data.celular || '',
        rg: data.rg || '',
        orgaoEmissor: data.orgaoEmissor || '',
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toISOString().split('T')[0] : '',
        estadoCivil: data.estadoCivil || '',
        nacionalidade: data.nacionalidade || '',
        cep: data.cep || '',
        endereco: data.endereco || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cargoId: data.cargoId,
        departamentoId: data.departamentoId,
        cidadeId: data.cidadeId,
        dataAdmissao,
        dataDemissao,
        salario: data.salario,
        observacoes: data.observacoes || '',
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
        // Limpar formatação de campos que devem conter apenas dígitos
        cpf: clearFormat(data.cpf),
        telefone: data.telefone ? clearFormat(data.telefone) : undefined,
        celular: data.celular ? clearFormat(data.celular) : undefined,
        cep: data.cep ? clearFormat(data.cep) : undefined,
        rg: data.rg ? clearFormat(data.rg) : undefined,
        // Outros campos opcionais
        orgaoEmissor: data.orgaoEmissor || undefined,
        dataNascimento: data.dataNascimento || undefined,
        estadoCivil: data.estadoCivil || undefined,
        nacionalidade: data.nacionalidade || undefined,
        endereco: data.endereco || undefined,
        numero: data.numero || undefined,
        complemento: data.complemento || undefined,
        bairro: data.bairro || undefined,
        cidadeId: data.cidadeId || undefined,
        cargoId: data.cargoId || undefined,
        departamentoId: data.departamentoId || undefined,
        dataDemissao: data.dataDemissao || undefined,
        salario: data.salario || undefined,
        observacoes: data.observacoes || undefined,
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
  };

  const onCreateNewPosition = () => {
    setPositionToEdit(null);
    setPositionDialogOpen(true);
  };

  const onCreateNewCity = () => {
    setCityToEdit(null);
    setCityDialogOpen(true);
  };

  // Funções de edição
  const handleEditDepartment = (department: Department) => {
    setDepartmentToEdit(department);
    setDepartmentDialogOpen(true);
  };

  const handleEditPosition = (position: Position) => {
    setPositionToEdit(position);
    setPositionDialogOpen(true);
  };

  const handleEditCity = (city: City) => {
    setCityToEdit(city);
    setCityDialogOpen(true);
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

  const handlePositionCreated = (position: Position) => {
    setPositions(prev => [...prev, position]);
    setSelectedPosition(position);
    form.setValue('cargoId', position.id);
    setPositionDialogOpen(false);
  };

  const handlePositionUpdated = (position: Position) => {
    setPositions(prev => prev.map(p => p.id === position.id ? position : p));
    if (selectedPosition?.id === position.id) {
      setSelectedPosition(position);
    }
    setPositionDialogOpen(false);
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
        
        {/* AuditSection no header */}
        <AuditSection 
          form={form} 
          data={employeeData}
          variant="header" 
          isEditing={!!id}
          statusFieldName="ativo" // Campo de status é 'ativo' para Employee
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Informações do Funcionário
              </h3>
              <p className="text-sm text-muted-foreground">
                Preencha todas as informações necessárias do funcionário
              </p>
            </div>
            <div className="p-6 pt-0 space-y-6">
              {/* Seção Informações Pessoais */}
              <EmployeePersonalSection
                form={form}
                isLoading={loading}
                id={id}
              />

              {/* Seção Informações Profissionais */}
              <EmployeeProfessionalSection
                form={form}
                isLoading={loading}
                selectedDepartment={selectedDepartment}
                selectedPosition={selectedPosition}
                setDepartmentSearchOpen={setDepartmentSearchOpen}
                setPositionSearchOpen={setPositionSearchOpen}
              />

              {/* Seção Endereço */}
              <EmployeeAddressSection
                form={form}
                isLoading={loading}
                selectedCity={selectedCity}
                setCitySearchOpen={setCitySearchOpen}
              />

              {/* Seção Documentos */}
              <EmployeeDocumentsSection
                form={form}
                isLoading={loading}
                id={id}
              />

              {/* Seção Contato */}
              <EmployeeContactSection
                form={form}
                isLoading={loading}
              />

              
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
        onCreateNew={onCreateNewPosition}
        onEdit={handleEditPosition}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'departamentoNome', header: 'Departamento' },
        ]}
        searchKeys={['nome', 'departamentoNome']}
        entityType="cargos"
        description="Selecione um cargo para o funcionário ou crie um novo."
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

      <PositionCreationDialog
        open={positionDialogOpen}
        onOpenChange={setPositionDialogOpen}
        onSuccess={positionToEdit ? handlePositionUpdated : handlePositionCreated}
        position={positionToEdit}
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

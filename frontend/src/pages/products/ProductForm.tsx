import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { productApi, categoryApi, brandApi, unitMeasureApi } from '../../services/api';
import { Category } from '../../types/category';
import { Brand } from '../../types/brand';
import { UnitMeasure } from '../../types/unit-measure';
import { toast } from 'sonner';
import { Form } from '../../components/ui/form';
import { SearchDialog } from '../../components/SearchDialog';
import AuditSection from '@/components/AuditSection';

// Componentes modulares
import ProductGeneralSection from './components/ProductGeneralSection';
import ProductAdditionalSection from './components/ProductAdditionalSection';

// Diálogos de criação
import CategoryCreationDialog from '../../components/dialogs/CategoryCreationDialog';
import BrandCreationDialog from '../../components/dialogs/BrandCreationDialog';
import UnitMeasureCreationDialog from '../../components/dialogs/UnitMeasureCreationDialog';

const formSchema = z.object({
  id: z.number().optional(),
  produto: z.string().min(2, 'Nome do produto é obrigatório'),
  descricao: z.string().nullable().optional(),
  codigoBarras: z.string().nullable().optional(),
  referencia: z.string().nullable().optional(),
  valorVenda: z.number().min(0, 'Valor de venda deve ser maior ou igual a zero').optional(),
  valorCompra: z.number().min(0, 'Valor de compra deve ser maior ou igual a zero').optional(),
  // Campos de estoque desabilitados - Será gerenciado por módulo específico no futuro
  quantidadeMinima: z.number().min(0, 'Quantidade mínima deve ser maior ou igual a zero').optional().default(0),
  quantidade: z.number().min(0, 'Quantidade atual deve ser maior ou igual a zero').optional().default(0),
  categoriaId: z.number().min(1, 'Categoria é obrigatória'),
  marcaId: z.number().nullable().optional(),
  unidadeMedidaId: z.number().min(1, 'Unidade de medida é obrigatória'),
  ativo: z.boolean().default(true),
  percentualLucro: z.number().min(0, 'Percentual de lucro deve ser maior ou igual a zero').nullable().optional(),
  pesoLiquido: z.number().min(0, 'Peso líquido deve ser maior ou igual a zero').nullable().optional(),
  pesoBruto: z.number().min(0, 'Peso bruto deve ser maior ou igual a zero').nullable().optional(),
  ncm: z.string().nullable().optional(),
  cest: z.string().nullable().optional(),
  gtin: z.string().nullable().optional(),
  gtinTributavel: z.string().nullable().optional(),
  unidade: z.string().nullable().optional(),
  valorUnitario: z.number().min(0, 'Valor unitário deve ser maior ou igual a zero').nullable().optional(),
  situacao: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  mode?: 'page' | 'dialog';
  productId?: number;
  initialData?: Partial<any>;
  onSuccess?: (product: any) => void;
  onCancel?: () => void;
}

const ProductForm = ({
  mode = 'page',
  productId,
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = mode === 'dialog' ? productId : paramId ? Number(paramId) : undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  
  // Estados para entidades relacionadas
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  
  // Estados para entidades selecionadas
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedUnitMeasure, setSelectedUnitMeasure] = useState<UnitMeasure | null>(null);
  
  // Estados para diálogos de pesquisa
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [brandSearchOpen, setBrandSearchOpen] = useState(false);
  const [unitMeasureSearchOpen, setUnitMeasureSearchOpen] = useState(false);
  
  // Estados para diálogos de criação
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [unitMeasureDialogOpen, setUnitMeasureDialogOpen] = useState(false);
  
  // Estados para edição
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);
  const [unitMeasureToEdit, setUnitMeasureToEdit] = useState<UnitMeasure | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      produto: '',
      descricao: '',
      codigoBarras: '',
      referencia: '',
      valorVenda: 0,
      valorCompra: 0,
      quantidadeMinima: 0,
      quantidade: 0,
      ativo: true,
      percentualLucro: 0,
      pesoLiquido: 0,
      pesoBruto: 0,
      valorUnitario: 0,
      observacoes: '',
      ncm: '',
      cest: '',
      gtin: '',
      gtinTributavel: '',
      unidade: '',
      situacao: '',
    },
  });

  // Funções para carregar dados
  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const loadBrands = async () => {
    try {
      const data = await brandApi.getAll();
      setBrands(data);
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
      toast.error('Erro ao carregar marcas');
    }
  };

  const loadUnitMeasures = async () => {
    try {
      const data = await unitMeasureApi.getAll();
      setUnitMeasures(data);
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
      toast.error('Erro ao carregar unidades de medida');
    }
  };

  // Funções para seleção de entidades
  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    form.setValue('categoriaId', category.id);
    setCategorySearchOpen(false);
  };

  const onSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    form.setValue('marcaId', brand.id);
    setBrandSearchOpen(false);
  };

  const onSelectUnitMeasure = (unitMeasure: UnitMeasure) => {
    setSelectedUnitMeasure(unitMeasure);
    form.setValue('unidadeMedidaId', unitMeasure.id);
    setUnitMeasureSearchOpen(false);
  };

  // Funções para criação de novas entidades
  const onCreateNewCategory = () => {
    setCategoryToEdit(null);
    setCategoryDialogOpen(true);
    setCategorySearchOpen(false);
  };

  const onCreateNewBrand = () => {
    setBrandToEdit(null);
    setBrandDialogOpen(true);
    setBrandSearchOpen(false);
  };

  const onCreateNewUnitMeasure = () => {
    setUnitMeasureToEdit(null);
    setUnitMeasureDialogOpen(true);
    setUnitMeasureSearchOpen(false);
  };

  // Funções para edição de entidades
  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setCategoryDialogOpen(true);
    setCategorySearchOpen(false);
  };

  const handleEditBrand = (brand: Brand) => {
    setBrandToEdit(brand);
    setBrandDialogOpen(true);
    setBrandSearchOpen(false);
  };

  const handleEditUnitMeasure = (unitMeasure: UnitMeasure) => {
    setUnitMeasureToEdit(unitMeasure);
    setUnitMeasureDialogOpen(true);
    setUnitMeasureSearchOpen(false);
  };

  // Funções para quando uma entidade é criada/atualizada
  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
    setSelectedCategory(newCategory);
    form.setValue('categoriaId', newCategory.id);
    setCategoryDialogOpen(false);
    toast.success('Categoria criada com sucesso!');
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    if (selectedCategory?.id === updatedCategory.id) {
      setSelectedCategory(updatedCategory);
    }
    setCategoryDialogOpen(false);
    toast.success('Categoria atualizada com sucesso!');
  };

  const handleBrandCreated = (newBrand: Brand) => {
    setBrands((prev) => [...prev, newBrand]);
    setSelectedBrand(newBrand);
    form.setValue('marcaId', newBrand.id);
    setBrandDialogOpen(false);
    toast.success('Marca criada com sucesso!');
  };

  const handleBrandUpdated = (updatedBrand: Brand) => {
    setBrands((prev) =>
      prev.map((brand) => (brand.id === updatedBrand.id ? updatedBrand : brand))
    );
    if (selectedBrand?.id === updatedBrand.id) {
      setSelectedBrand(updatedBrand);
    }
    setBrandDialogOpen(false);
    toast.success('Marca atualizada com sucesso!');
  };

  const handleUnitMeasureCreated = (newUnitMeasure: UnitMeasure) => {
    setUnitMeasures((prev) => [...prev, newUnitMeasure]);
    setSelectedUnitMeasure(newUnitMeasure);
    form.setValue('unidadeMedidaId', newUnitMeasure.id);
    setUnitMeasureDialogOpen(false);
    toast.success('Unidade de medida criada com sucesso!');
  };

  const handleUnitMeasureUpdated = (updatedUnitMeasure: UnitMeasure) => {
    setUnitMeasures((prev) =>
      prev.map((unit) => (unit.id === updatedUnitMeasure.id ? updatedUnitMeasure : unit))
    );
    if (selectedUnitMeasure?.id === updatedUnitMeasure.id) {
      setSelectedUnitMeasure(updatedUnitMeasure);
    }
    setUnitMeasureDialogOpen(false);
    toast.success('Unidade de medida atualizada com sucesso!');
  };

  useEffect(() => {
    loadCategories();
    loadBrands();
    loadUnitMeasures();
  }, []);

  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        setIsLoading(true);
        try {
          const product = await productApi.getById(Number(id));
          setProductData(product);
          
          // Preenche o formulário
          form.reset({
            ...product,
            id: product.id,
            descricao: product.descricao || '',
            codigoBarras: product.codigoBarras || '',
            referencia: product.referencia || '',
            observacoes: product.observacoes || '',
            ncm: product.ncm || '',
            cest: product.cest || '',
            gtin: product.gtin || '',
            gtinTributavel: product.gtinTributavel || '',
            unidade: product.unidade || '',
            situacao: product.situacao || '',
            valorVenda: product.valorVenda || 0,
            valorCompra: product.valorCompra || 0,
            percentualLucro: product.percentualLucro || 0,
            pesoLiquido: product.pesoLiquido || 0,
            pesoBruto: product.pesoBruto || 0,
            valorUnitario: product.valorUnitario || 0,
            quantidadeMinima: product.quantidadeMinima || 0,
            quantidade: product.quantidade || 0,
          });

          // Define as entidades selecionadas
          if (product.categoriaId) {
            const category = categories.find(c => c.id === product.categoriaId);
            if (category) setSelectedCategory(category);
          }

          if (product.marcaId) {
            const brand = brands.find(b => b.id === product.marcaId);
            if (brand) setSelectedBrand(brand);
          }

          if (product.unidadeMedidaId) {
            const unitMeasure = unitMeasures.find(u => u.id === product.unidadeMedidaId);
            if (unitMeasure) setSelectedUnitMeasure(unitMeasure);
          }

        } catch (error) {
          console.error('Erro ao carregar produto:', error);
          toast.error('Erro ao carregar produto');
          navigate('/products');
        } finally {
          setIsLoading(false);
        }
      };

      // Só carrega o produto se as entidades já foram carregadas
      if (categories.length > 0 && unitMeasures.length > 0) {
        loadProduct();
      }
    }
  }, [id, form, navigate, categories, brands, unitMeasures]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Limpar valores null/undefined para string vazia quando necessário
      const cleanedData = {
        ...data,
        descricao: data.descricao || undefined,
        codigoBarras: data.codigoBarras || undefined,
        referencia: data.referencia || undefined,
        observacoes: data.observacoes || undefined,
        ncm: data.ncm || undefined,
        cest: data.cest || undefined,
        gtin: data.gtin || undefined,
        gtinTributavel: data.gtinTributavel || undefined,
        unidade: data.unidade || undefined,
        situacao: data.situacao || undefined,
        marcaId: data.marcaId || undefined,
        valorCompra: data.valorCompra || undefined,
        valorVenda: data.valorVenda || undefined,
        percentualLucro: data.percentualLucro || undefined,
        pesoLiquido: data.pesoLiquido || undefined,
        pesoBruto: data.pesoBruto || undefined,
        valorUnitario: data.valorUnitario || undefined,
        quantidadeMinima: data.quantidadeMinima || 0,
        quantidade: data.quantidade || 0,
      };

      let result;
      if (id) {
        result = await productApi.update(Number(id), cleanedData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        result = await productApi.create(cleanedData);
        toast.success('Produto criado com sucesso!');
      }

      if (mode === 'dialog' && onSuccess) {
        onSuccess(result);
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {mode === 'page' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {id ? 'Editar Produto' : 'Novo Produto'}
              </h1>
              <p className="text-muted-foreground">
                {id
                  ? 'Edite as informações do produto abaixo'
                  : 'Preencha as informações para criar um novo produto'}
              </p>
            </div>
          </div>
          
          <AuditSection
            form={form}
            data={productData}
            variant="header"
            isEditing={!!id}
            statusFieldName="ativo" // Campo de status é 'ativo' para Product
          />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            {mode === 'page' && (
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Informações do Produto
                </h3>
                <p className="text-sm text-muted-foreground">
                  Preencha todas as informações necessárias do produto
                </p>
              </div>
            )}
            <div className={mode === 'dialog' ? 'p-4 space-y-4' : 'p-6 pt-0 space-y-6'}>
              <ProductGeneralSection
                form={form}
                isLoading={isLoading}
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                selectedUnitMeasure={selectedUnitMeasure}
                setCategorySearchOpen={setCategorySearchOpen}
                setBrandSearchOpen={setBrandSearchOpen}
                setUnitMeasureSearchOpen={setUnitMeasureSearchOpen}
                id={id?.toString()}
              />
              
              <ProductAdditionalSection
                form={form}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {mode === 'page' ? (
              <>
                <Link to="/products">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {id ? 'Atualizar' : 'Salvar'}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {id ? 'Atualizar' : 'Salvar'}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>

      {/* Diálogos de Pesquisa */}
      <SearchDialog
        open={categorySearchOpen}
        onOpenChange={setCategorySearchOpen}
        title="Selecionar Categoria"
        entities={categories}
        isLoading={isLoading}
        onSelect={onSelectCategory}
        onCreateNew={onCreateNewCategory}
        onEdit={handleEditCategory}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'descricao', header: 'Descrição' },
        ]}
        searchKeys={['nome', 'descricao']}
        entityType="categorias"
        description="Selecione uma categoria para o produto ou crie uma nova."
      />

      <SearchDialog
        open={brandSearchOpen}
        onOpenChange={setBrandSearchOpen}
        title="Selecionar Marca"
        entities={brands}
        isLoading={isLoading}
        onSelect={onSelectBrand}
        onCreateNew={onCreateNewBrand}
        onEdit={handleEditBrand}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'descricao', header: 'Descrição' },
        ]}
        searchKeys={['nome', 'descricao']}
        entityType="marcas"
        description="Selecione uma marca para o produto ou crie uma nova."
      />

      <SearchDialog
        open={unitMeasureSearchOpen}
        onOpenChange={setUnitMeasureSearchOpen}
        title="Selecionar Unidade de Medida"
        entities={unitMeasures}
        isLoading={isLoading}
        onSelect={onSelectUnitMeasure}
        onCreateNew={onCreateNewUnitMeasure}
        onEdit={handleEditUnitMeasure}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'sigla', header: 'Sigla' },
        ]}
        searchKeys={['nome', 'sigla']}
        entityType="unidades de medida"
        description="Selecione uma unidade de medida para o produto ou crie uma nova."
      />

      {/* Diálogos de Criação */}
      <CategoryCreationDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSuccess={categoryToEdit ? handleCategoryUpdated : handleCategoryCreated}
        category={categoryToEdit}
      />

      <BrandCreationDialog
        open={brandDialogOpen}
        onOpenChange={setBrandDialogOpen}
        onSuccess={brandToEdit ? handleBrandUpdated : handleBrandCreated}
        brand={brandToEdit}
      />

      <UnitMeasureCreationDialog
        open={unitMeasureDialogOpen}
        onOpenChange={setUnitMeasureDialogOpen}
        onSuccess={unitMeasureToEdit ? handleUnitMeasureUpdated : handleUnitMeasureCreated}
        unitMeasure={unitMeasureToEdit}
      />
    </div>
  );
};

export default ProductForm;

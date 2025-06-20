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

// Componentes modulares
import ProductGeneralSection from './components/ProductGeneralSection';
import ProductAdditionalSection from './components/ProductAdditionalSection';

const formSchema = z.object({
  id: z.number().optional(),
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(2, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  codigoBarras: z.string().optional(),
  preco: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  custoMedio: z.number().min(0, 'Custo médio deve ser maior ou igual a zero'),
  estoqueMinimo: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a zero'),
  estoqueMaximo: z.number().min(0, 'Estoque máximo deve ser maior ou igual a zero'),
  estoqueAtual: z.number().min(0, 'Estoque atual deve ser maior ou igual a zero'),
  categoriaId: z.number().min(1, 'Categoria é obrigatória'),
  marcaId: z.number().optional(),
  unidadeMedidaId: z.number().min(1, 'Unidade de medida é obrigatória'),
  ativo: z.boolean().default(true),
  dataUltimaVenda: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      codigoBarras: '',
      preco: 0,
      custoMedio: 0,
      estoqueMinimo: 0,
      estoqueMaximo: 0,
      estoqueAtual: 0,
      categoriaId: 0,
      marcaId: undefined,
      unidadeMedidaId: 0,
      ativo: true,
      dataUltimaVenda: '',
      observacoes: '',
    },
  });

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryApi.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Não foi possível carregar a lista de categorias');
    }
  };

  const fetchBrands = async () => {
    try {
      const brandsData = await brandApi.getAll();
      setBrands(brandsData);
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
      toast.error('Não foi possível carregar a lista de marcas');
    }
  };

  const fetchUnitMeasures = async () => {
    try {
      const unitMeasuresData = await unitMeasureApi.getAll();
      setUnitMeasures(unitMeasuresData);
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
      toast.error('Não foi possível carregar a lista de unidades de medida');
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const product = await productApi.getById(Number(id));        form.reset({
          id: product.id || 0,
          codigo: product.codigo || '',
          nome: product.nome || '',
          descricao: product.descricao || '',
          codigoBarras: product.codigoBarras || '',
          preco: product.preco || product.valorVenda || 0,
          custoMedio: product.valorCompra || 0,
          estoqueMinimo: product.quantidadeMinima || 0,
          estoqueMaximo: product.quantidade || 0,
          estoqueAtual: product.quantidade || 0,
          categoriaId: product.categoriaId || 0,
          marcaId: product.marcaId,
          unidadeMedidaId: product.unidadeMedidaId || 0,
          ativo: product.ativo !== false,
          dataUltimaVenda: '',
          observacoes: product.observacoes || '',
        });
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast.error('Não foi possível carregar os dados do produto');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };

    Promise.all([fetchCategories(), fetchBrands(), fetchUnitMeasures()]);
    fetchProduct();
  }, [id, form, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);      const productData = {
        nome: data.nome,
        codigo: data.codigo || undefined,
        codigoBarras: data.codigoBarras || undefined,
        descricao: data.descricao || undefined,
        observacoes: data.observacoes || undefined,
        valorVenda: data.preco,
        valorCompra: data.custoMedio,
        quantidadeMinima: data.estoqueMinimo,
        quantidade: data.estoqueAtual,
        categoriaId: data.categoriaId,
        marcaId: data.marcaId || undefined,
        unidadeMedidaId: data.unidadeMedidaId,
        ativo: data.ativo,
      };

      if (id) {
        await productApi.update(Number(id), productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productApi.create(productData);
        toast.success('Produto criado com sucesso!');
      }

      navigate('/products');
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast.error(
        error?.response?.data?.message ||
          'Erro ao salvar produto. Tente novamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">        <div className="flex items-center space-x-4">
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
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            {/* Seção de Dados Gerais */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Dados Gerais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Informações básicas do produto
                </p>
              </div>
              <div className="p-6 pt-0">
                <ProductGeneralSection
                  form={form}
                  isLoading={isLoading}
                  categories={categories}
                  brands={brands}
                  unitMeasures={unitMeasures}
                  id={id}
                />
              </div>
            </div>

            {/* Seção de Informações Adicionais */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Informações Adicionais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Preços, estoque e outras informações
                </p>
              </div>
              <div className="p-6 pt-0">                <ProductAdditionalSection
                  form={form}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>          <div className="flex justify-end space-x-4">
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
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;

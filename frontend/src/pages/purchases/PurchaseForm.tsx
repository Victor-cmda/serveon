import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, X } from 'lucide-react';
import { BasicInfoSection } from './components/BasicInfoSection';
import { ItemsSection } from './components/ItemsSection';
import { FinancialSection } from './components/FinancialSection';
import { InstallmentsSection } from './components/InstallmentsSection';
import { validatePurchaseForm } from './utils/validationUtils';
import { purchaseApi } from '@/services/api';
import type { Purchase, PurchaseItem, PurchaseInstallment, CreatePurchaseData, UpdatePurchaseData } from '@/types/purchase';

interface PurchaseFormProps {
  mode: 'create' | 'edit' | 'view';
}

export function PurchaseForm({ mode }: PurchaseFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  // Estados do formulário
  const [formData, setFormData] = useState<Partial<Purchase>>({
    codigo: '',
    modelo: '',
    serie: '',
    codigoFornecedor: '',
    fornecedorId: 0,
    dataEmissao: '',
    dataChegada: '',
    condicaoPagamentoId: 0,
    funcionarioId: 0,
    tipoFrete: 'CIF',
    valorFrete: 0,
    valorSeguro: 0,
    outrasDespesas: 0,
    totalProdutos: 0,
    valorDesconto: 0,
    totalAPagar: 0,
    status: 'PENDENTE',
    transportadoraId: undefined,
    observacoes: '',
  });

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [installments, setInstallments] = useState<PurchaseInstallment[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para dados auxiliares
  const [suppliers, setSuppliers] = useState<Array<{ id: number; nome: string; codigo?: string }>>([]);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ id: number; nome: string; codigo?: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: number; nome: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: number; nome: string; codigo?: string; preco?: number }>>([]);

  // Carregar dados iniciais
  useEffect(() => {
    loadAuxiliaryData();
    
    if (id && (isEditing || isViewing)) {
      loadPurchase(parseInt(id));
    }
  }, [id, isEditing, isViewing]);

  const loadAuxiliaryData = async () => {
    try {
      setIsLoading(true);
      
      const [suppliersRes, paymentMethodsRes, employeesRes, productsRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/payment-methods'),
        fetch('/api/employees'),
        fetch('/api/products'),
      ]);

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);
      }

      if (paymentMethodsRes.ok) {
        const paymentMethodsData = await paymentMethodsRes.json();
        setPaymentMethods(paymentMethodsData);
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json();
        setEmployees(employeesData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      toast.error('Erro ao carregar dados necessários para o formulário');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchase = async (purchaseId: number) => {
    try {
      setIsLoading(true);
      const purchase = await purchaseApi.getById(purchaseId);
      
      setFormData(purchase);
      // Assumindo que os itens e parcelas virão em propriedades separadas ou serão carregados separadamente
      // setItems(purchase.itens || []);
      // setInstallments(purchase.parcelas || []);
      setItems([]);
      setInstallments([]);
    } catch (error) {
      console.error('Erro ao carregar compra:', error);
      toast.error('Erro ao carregar dados da compra');
      navigate('/purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldUpdate = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando ele for modificado
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleItemsUpdate = (newItems: PurchaseItem[]) => {
    setItems(newItems);
  };

  const handleInstallmentsUpdate = (newInstallments: PurchaseInstallment[]) => {
    setInstallments(newInstallments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validatePurchaseForm(formData);
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        // Mapear erros para campos específicos (simplificado)
        if (error.includes('Fornecedor')) newErrors.fornecedorId = error;
        if (error.includes('Data de emissão')) newErrors.dataEmissao = error;
        if (error.includes('Data de chegada')) newErrors.dataChegada = error;
        if (error.includes('Condição de pagamento')) newErrors.condicaoPagamentoId = error;
        if (error.includes('Funcionário')) newErrors.funcionarioId = error;
      });
      
      setErrors(newErrors);
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const submitData: CreatePurchaseData | UpdatePurchaseData = {
        ...formData,
        itens: items,
        parcelas: installments,
      };

      if (isCreating) {
        await purchaseApi.create(submitData as CreatePurchaseData);
        toast.success('Compra criada com sucesso!');
      } else if (isEditing) {
        await purchaseApi.update(parseInt(id!), submitData as UpdatePurchaseData);
        toast.success('Compra atualizada com sucesso!');
      }

      navigate('/purchases');
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      toast.error('Erro ao salvar compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/purchases');
  };

  const getPageTitle = () => {
    if (isCreating) return 'Nova Compra';
    if (isEditing) return 'Editar Compra';
    return 'Visualizar Compra';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            {formData.numeroSequencial && (
              <p className="text-sm text-gray-600">Nº {formData.numeroSequencial}</p>
            )}
          </div>
        </div>
        
        {!isViewing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <BasicInfoSection
          data={formData}
          onUpdate={handleFieldUpdate}
          suppliers={suppliers}
          paymentMethods={paymentMethods}
          employees={employees}
          isLoading={isLoading}
          errors={errors}
        />

        <div className="border-t my-6"></div>

        {/* Itens da Compra */}
        <ItemsSection
          data={formData}
          items={items}
          onUpdateItems={handleItemsUpdate}
          onUpdateTotals={handleFieldUpdate}
          products={products}
          isLoading={isLoading}
        />

        <div className="border-t my-6"></div>

        {/* Informações Financeiras */}
        <FinancialSection
          data={formData}
          onUpdate={handleFieldUpdate}
          isLoading={isLoading}
          errors={errors}
        />

        <div className="border-t my-6"></div>

        {/* Parcelas */}
        <InstallmentsSection
          data={formData}
          installments={installments}
          onUpdateInstallments={handleInstallmentsUpdate}
          paymentMethods={paymentMethods}
          isLoading={isLoading}
          errors={errors}
        />
      </form>
    </div>
  );
}

export default PurchaseForm;
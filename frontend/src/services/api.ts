import {
  Country,
  State,
  City,
  CreateCountryDto,
  UpdateCountryDto,
  CreateStateDto,
  UpdateStateDto,
  CreateCityDto,
  UpdateCityDto,
} from '../types/location';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../types/customer';
import {
  PaymentMethod,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from '../types/payment-method';
import {
  PaymentTerm,
  CreatePaymentTermDto,
  UpdatePaymentTermDto,
} from '../types/payment-term';
import {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '../types/supplier';
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../types/department';
import {
  Position,
  CreatePositionDto,
  UpdatePositionDto,
} from '../types/position';
import {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '../types/employee';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from '../types/product';
import {
  Sale,
  CreateSaleDto,
  UpdateSaleDto,
} from '../types/sale';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types/category';
import {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
} from '../types/brand';
import {
  UnitMeasure,
  CreateUnitMeasureDto,
  UpdateUnitMeasureDto,
} from '../types/unit-measure';
import {
  Transporter,
  CreateTransporterDto,
  UpdateTransporterDto,
} from '../types/transporter';
import {
  Purchase,
  CreatePurchaseData,
  UpdatePurchaseData,
} from '../types/purchase';
import {
  AccountPayable,
  CreateAccountPayableDto,
  UpdateAccountPayableDto,
  PayAccountDto,
  AccountPayableFilters,
} from '../types/account-payable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error: ${response.status} ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const countryApi = {
  getAll: async (): Promise<Country[]> => {
    const response = await fetch(`${API_URL}/countries`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Country> => {
    const response = await fetch(`${API_URL}/countries/${id}`);
    return handleResponse(response);
  },

  create: async (country: CreateCountryDto): Promise<Country> => {
    const response = await fetch(`${API_URL}/countries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(country),
    });
    return handleResponse(response);
  },

  update: async (id: number, country: UpdateCountryDto): Promise<Country> => {
    const response = await fetch(`${API_URL}/countries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(country),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/countries/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export const stateApi = {
  getAll: async (): Promise<State[]> => {
    const response = await fetch(`${API_URL}/states`);
    return handleResponse(response);
  },

  getByCountry: async (countryId: number): Promise<State[]> => {
    const response = await fetch(`${API_URL}/states?paisId=${countryId}`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<State> => {
    const response = await fetch(`${API_URL}/states/${id}`);
    return handleResponse(response);
  },

  create: async (state: CreateStateDto): Promise<State> => {
    const response = await fetch(`${API_URL}/states`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    return handleResponse(response);
  },

  update: async (id: number, state: UpdateStateDto): Promise<State> => {
    const response = await fetch(`${API_URL}/states/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/states/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export const cityApi = {
  getAll: async (): Promise<City[]> => {
    const response = await fetch(`${API_URL}/cities`);
    return handleResponse(response);
  },

  getByState: async (stateId: number): Promise<City[]> => {
    const response = await fetch(`${API_URL}/cities/estado/${stateId}`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<City> => {
    const response = await fetch(`${API_URL}/cities/${id}`);
    return handleResponse(response);
  },

  getByIbgeCode: async (code: string): Promise<City> => {
    const response = await fetch(`${API_URL}/cities/ibge/${code}`);
    return handleResponse(response);
  },

  create: async (city: CreateCityDto): Promise<City> => {
    const response = await fetch(`${API_URL}/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(city),
    });
    return handleResponse(response);
  },

  update: async (id: number, city: UpdateCityDto): Promise<City> => {
    const response = await fetch(`${API_URL}/cities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(city),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/cities/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_URL}/customers`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await fetch(`${API_URL}/customers/${id}`);
    return handleResponse(response);
  },

  getByCountry: async (countryId: number): Promise<Customer[]> => {
    const response = await fetch(`${API_URL}/customers/country/${countryId}`);
    return handleResponse(response);
  },

  create: async (customer: CreateCustomerDto): Promise<Customer> => {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    return handleResponse(response);
  },

  update: async (
    id: number,
    customer: UpdateCustomerDto,
  ): Promise<Customer> => {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export const supplierApi = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await fetch(`${API_URL}/suppliers`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await fetch(`${API_URL}/suppliers/${id}`);
    return handleResponse(response);
  },

  create: async (supplier: CreateSupplierDto): Promise<Supplier> => {
    const response = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });
    return handleResponse(response);
  },

  update: async (
    id: number,
    supplier: UpdateSupplierDto,
  ): Promise<Supplier> => {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export const paymentMethodApi = {
  getAll: async (): Promise<PaymentMethod[]> => {
    const response = await fetch(`${API_URL}/payment-methods`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<PaymentMethod> => {
    const response = await fetch(`${API_URL}/payment-methods/${id}`);
    return handleResponse(response);
  },

  create: async (paymentMethod: CreatePaymentMethodDto): Promise<PaymentMethod> => {
    const response = await fetch(`${API_URL}/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentMethod),
    });
    return handleResponse(response);
  },

  update: async (id: number, paymentMethod: UpdatePaymentMethodDto): Promise<PaymentMethod> => {
    const response = await fetch(`${API_URL}/payment-methods/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentMethod),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/payment-methods/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// Função para transformar dados de payment term entre frontend (isActive) e backend (ativo)
const transformPaymentTermToBackend = (data: CreatePaymentTermDto | UpdatePaymentTermDto) => {
  const { ativo, installments, ...rest } = data as any;
  return {
    ...rest,
    ativo: ativo, // Transformar isActive para ativo para o backend
    installments: installments?.map((inst: any) => {
      const { ativo: instIsActive, percentageValue, interestRate, ...instRest } = inst;
      return {
        ...instRest,
        ativo: instIsActive, // Transformar isActive para ativo nas parcelas
        percentageValue: typeof percentageValue === 'string' ? parseFloat(percentageValue) : percentageValue,
        interestRate: typeof interestRate === 'string' ? parseFloat(interestRate) : interestRate,
      };
    }),
  };
};

const transformPaymentTermFromBackend = (data: any): PaymentTerm => {
  const { ativo, installments, ...rest } = data;
  return {
    ...rest,
    ativo: ativo,
    installments: installments?.map((inst: any) => {
      const { ativo: instAtivo, percentageValue, interestRate, ...instRest } = inst;
      return {
        ...instRest,
        ativo: instAtivo,
        percentageValue: typeof percentageValue === 'string' ? parseFloat(percentageValue) : percentageValue,
        interestRate: typeof interestRate === 'string' ? parseFloat(interestRate) : interestRate,
      };
    }) || [],
  };
};

export const paymentTermApi = {
  getAll: async (): Promise<PaymentTerm[]> => {
    const response = await fetch(`${API_URL}/payment-terms`);
    const data = await handleResponse(response);
    return data.map(transformPaymentTermFromBackend);
  },

  getById: async (id: number): Promise<PaymentTerm> => {
    const response = await fetch(`${API_URL}/payment-terms/${id}`);
    const data = await handleResponse(response);
    return transformPaymentTermFromBackend(data);
  },

  create: async (paymentTerm: CreatePaymentTermDto): Promise<PaymentTerm> => {
    const response = await fetch(`${API_URL}/payment-terms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformPaymentTermToBackend(paymentTerm)),
    });
    const data = await handleResponse(response);
    return transformPaymentTermFromBackend(data);
  },

  update: async (id: number, paymentTerm: UpdatePaymentTermDto): Promise<PaymentTerm> => {
    const response = await fetch(`${API_URL}/payment-terms/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformPaymentTermToBackend(paymentTerm)),
    });
    const data = await handleResponse(response);
    return transformPaymentTermFromBackend(data);
  },
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/payment-terms/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await fetch(`${API_URL}/employees`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await fetch(`${API_URL}/employees/${id}`);
    return handleResponse(response);
  },

  create: async (employee: CreateEmployeeDto): Promise<Employee> => {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    return handleResponse(response);
  },

  update: async (
    id: number,
    employee: UpdateEmployeeDto,
  ): Promise<Employee> => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Novos métodos para buscar departamentos e cargos
  getActiveDepartments: async (): Promise<Department[]> => {
    const response = await fetch(`${API_URL}/employees/departments/active`);
    return handleResponse(response);
  },

  getActivePositions: async (): Promise<Position[]> => {
    const response = await fetch(`${API_URL}/employees/positions/active`);
    return handleResponse(response);
  },

  getPositionsByDepartment: async (departmentId: number): Promise<Position[]> => {
    const response = await fetch(`${API_URL}/employees/positions/by-department/${departmentId}`);
    return handleResponse(response);
  },

  getActiveCities: async (): Promise<City[]> => {
    const response = await fetch(`${API_URL}/employees/cities/active`);
    return handleResponse(response);
  },
};

// API para Departamentos
export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await fetch(`${API_URL}/departments`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Department> => {
    const response = await fetch(`${API_URL}/departments/${id}`);
    return handleResponse(response);
  },

  create: async (department: CreateDepartmentDto): Promise<Department> => {
    const response = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(department),
    });
    return handleResponse(response);
  },

  update: async (
    id: number,
    department: UpdateDepartmentDto,
  ): Promise<Department> => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(department),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para Cargos
export const positionApi = {
  getAll: async (): Promise<Position[]> => {
    const response = await fetch(`${API_URL}/positions`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Position> => {
    const response = await fetch(`${API_URL}/positions/${id}`);
    return handleResponse(response);
  },

  getByDepartment: async (departmentId: number): Promise<Position[]> => {
    const response = await fetch(`${API_URL}/positions/by-department/${departmentId}`);
    return handleResponse(response);
  },

  create: async (position: CreatePositionDto): Promise<Position> => {
    const response = await fetch(`${API_URL}/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(position),
    });
    return handleResponse(response);
  },

  update: async (
    id: number,
    position: UpdatePositionDto,
  ): Promise<Position> => {
    const response = await fetch(`${API_URL}/positions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(position),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/positions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para Produtos
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  },

  create: async (product: CreateProductDto): Promise<Product> => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  update: async (id: number, product: UpdateProductDto): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para Categorias
export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await fetch(`${API_URL}/categories`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Category> => {
    const response = await fetch(`${API_URL}/categories/${id}`);
    return handleResponse(response);
  },

  create: async (category: CreateCategoryDto): Promise<Category> => {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    return handleResponse(response);
  },

  update: async (id: number, category: UpdateCategoryDto): Promise<Category> => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para Marcas
export const brandApi = {
  getAll: async (): Promise<Brand[]> => {
    const response = await fetch(`${API_URL}/brands`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Brand> => {
    const response = await fetch(`${API_URL}/brands/${id}`);
    return handleResponse(response);
  },

  create: async (brand: CreateBrandDto): Promise<Brand> => {
    const response = await fetch(`${API_URL}/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brand),
    });
    return handleResponse(response);
  },

  update: async (id: number, brand: UpdateBrandDto): Promise<Brand> => {
    const response = await fetch(`${API_URL}/brands/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brand),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/brands/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para Unidades de Medida
export const unitMeasureApi = {
  getAll: async (): Promise<UnitMeasure[]> => {
    const response = await fetch(`${API_URL}/unit-measures`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<UnitMeasure> => {
    const response = await fetch(`${API_URL}/unit-measures/${id}`);
    return handleResponse(response);
  },

  create: async (unitMeasure: CreateUnitMeasureDto): Promise<UnitMeasure> => {
    const response = await fetch(`${API_URL}/unit-measures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitMeasure),
    });
    return handleResponse(response);
  },

  update: async (id: number, unitMeasure: UpdateUnitMeasureDto): Promise<UnitMeasure> => {
    const response = await fetch(`${API_URL}/unit-measures/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitMeasure),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/unit-measures/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para Transportadoras
export const transporterApi = {
  getAll: async (): Promise<Transporter[]> => {
    const response = await fetch(`${API_URL}/transporters`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Transporter> => {
    const response = await fetch(`${API_URL}/transporters/${id}`);
    return handleResponse(response);
  },

  create: async (transporter: CreateTransporterDto): Promise<Transporter> => {
    const response = await fetch(`${API_URL}/transporters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transporter),
    });
    return handleResponse(response);
  },

  update: async (
    id: number,
    transporter: UpdateTransporterDto,
  ): Promise<Transporter> => {
    const response = await fetch(`${API_URL}/transporters/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transporter),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/transporters/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para Compras
export const purchaseApi = {
  getAll: async (): Promise<Purchase[]> => {
    const response = await fetch(`${API_URL}/purchases`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Purchase> => {
    const response = await fetch(`${API_URL}/purchases/${id}`);
    return handleResponse(response);
  },

  checkExists: async (
    numeroPedido: string,
    modelo: string,
    serie: string,
    fornecedorId: string,
  ): Promise<{ exists: boolean }> => {
    const params = new URLSearchParams({
      numeroPedido,
      modelo,
      serie,
      fornecedorId,
    });
    const response = await fetch(`${API_URL}/purchases/check-exists?${params}`);
    return handleResponse(response);
  },

  create: async (purchase: CreatePurchaseData): Promise<Purchase> => {
    const response = await fetch(`${API_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchase),
    });
    return handleResponse(response);
  },

  update: async (
    id: number,
    purchase: UpdatePurchaseData,
  ): Promise<Purchase> => {
    const response = await fetch(`${API_URL}/purchases/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchase),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/purchases/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  approve: async (id: number): Promise<Purchase> => {
    const response = await fetch(`${API_URL}/purchases/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  deny: async (id: number, motivo?: string): Promise<Purchase> => {
    const response = await fetch(`${API_URL}/purchases/${id}/deny`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ motivo }),
    });
    return handleResponse(response);
  },
};

// Sales API
export const salesApi = {
  getAll: async (): Promise<Sale[]> => {
    const response = await fetch(`${API_URL}/sales`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Sale> => {
    const response = await fetch(`${API_URL}/sales/${id}`);
    return handleResponse(response);
  },

  checkExists: async (
    numeroPedido: string,
    modelo: string,
    serie: string,
    clienteId: string,
  ): Promise<{ exists: boolean }> => {
    const params = new URLSearchParams({
      numeroPedido,
      modelo,
      serie,
      clienteId,
    });
    const response = await fetch(`${API_URL}/sales/check-exists?${params}`);
    return handleResponse(response);
  },

  create: async (sale: CreateSaleDto): Promise<Sale> => {
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sale),
    });
    return handleResponse(response);
  },

  update: async (id: number, sale: UpdateSaleDto): Promise<Sale> => {
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sale),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  approve: async (id: number): Promise<Sale> => {
    const response = await fetch(`${API_URL}/sales/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  deny: async (id: number, motivo?: string): Promise<Sale> => {
    const response = await fetch(`${API_URL}/sales/${id}/deny`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ motivo }),
    });
    return handleResponse(response);
  },
};

// Accounts Payable API
export const accountsPayableApi = {
  getAll: async (filters?: AccountPayableFilters): Promise<AccountPayable[]> => {
    const params = new URLSearchParams();
    if (filters?.fornecedorId) params.append('fornecedorId', filters.fornecedorId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.append('dataFim', filters.dataFim);

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/accounts-payable?${queryString}` : `${API_URL}/accounts-payable`;
    
    const response = await fetch(url);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<AccountPayable> => {
    const response = await fetch(`${API_URL}/accounts-payable/${id}`);
    return handleResponse(response);
  },

  getOverdue: async (): Promise<AccountPayable[]> => {
    const response = await fetch(`${API_URL}/accounts-payable/overdue`);
    return handleResponse(response);
  },

  getBySupplier: async (fornecedorId: number): Promise<AccountPayable[]> => {
    const response = await fetch(`${API_URL}/accounts-payable/supplier/${fornecedorId}`);
    return handleResponse(response);
  },

  getByPeriod: async (dataInicio: string, dataFim: string): Promise<AccountPayable[]> => {
    const params = new URLSearchParams({
      dataInicio,
      dataFim,
    });
    const response = await fetch(`${API_URL}/accounts-payable/period?${params}`);
    return handleResponse(response);
  },

  create: async (data: CreateAccountPayableDto): Promise<AccountPayable> => {
    const response = await fetch(`${API_URL}/accounts-payable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateAccountPayableDto): Promise<AccountPayable> => {
    const response = await fetch(`${API_URL}/accounts-payable/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  pay: async (id: number, data: PayAccountDto): Promise<AccountPayable> => {
    const response = await fetch(`${API_URL}/accounts-payable/${id}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  cancel: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/accounts-payable/${id}/cancel`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  updateOverdueStatus: async (): Promise<number> => {
    const response = await fetch(`${API_URL}/accounts-payable/update-overdue-status`, {
      method: 'POST',
    });
    return handleResponse(response);
  },
};

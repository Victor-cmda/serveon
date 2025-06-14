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

const API_URL = import.meta.env.VITE_API_URL || '/api';

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

export const paymentTermApi = {
  getAll: async (): Promise<PaymentTerm[]> => {
    const response = await fetch(`${API_URL}/payment-terms`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<PaymentTerm> => {
    const response = await fetch(`${API_URL}/payment-terms/${id}`);
    return handleResponse(response);
  },

  create: async (paymentTerm: CreatePaymentTermDto): Promise<PaymentTerm> => {
    const response = await fetch(`${API_URL}/payment-terms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentTerm),
    });
    return handleResponse(response);
  },

  update: async (id: number, paymentTerm: UpdatePaymentTermDto): Promise<PaymentTerm> => {
    const response = await fetch(`${API_URL}/payment-terms/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentTerm),
    });
    return handleResponse(response);
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

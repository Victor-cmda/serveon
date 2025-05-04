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

  getById: async (id: string): Promise<Country> => {
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

  update: async (id: string, country: UpdateCountryDto): Promise<Country> => {
    const response = await fetch(`${API_URL}/countries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(country),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
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

  getByCountry: async (countryId: string): Promise<State[]> => {
    const response = await fetch(`${API_URL}/states?paisId=${countryId}`);
    return handleResponse(response);
  },

  getById: async (id: string): Promise<State> => {
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

  update: async (id: string, state: UpdateStateDto): Promise<State> => {
    const response = await fetch(`${API_URL}/states/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
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

  getByState: async (stateId: string): Promise<City[]> => {
    const response = await fetch(`${API_URL}/cities/estado/${stateId}`);
    return handleResponse(response);
  },

  getById: async (id: string): Promise<City> => {
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

  update: async (id: string, city: UpdateCityDto): Promise<City> => {
    const response = await fetch(`${API_URL}/cities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(city),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
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

  getById: async (id: string): Promise<Customer> => {
    const response = await fetch(`${API_URL}/customers/${id}`);
    return handleResponse(response);
  },

  getByCountry: async (countryId: string): Promise<Customer[]> => {
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
    id: string,
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

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/customers/${id}`, {
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

  getById: async (id: string): Promise<PaymentMethod> => {
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

  update: async (id: string, paymentMethod: UpdatePaymentMethodDto): Promise<PaymentMethod> => {
    const response = await fetch(`${API_URL}/payment-methods/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentMethod),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
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

import {
    Country,
    State,
    City,
    CreateCountryDto,
    UpdateCountryDto,
    CreateStateDto,
    UpdateStateDto,
    CreateCityDto,
    UpdateCityDto
} from '../types/location';

const API_URL = '/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
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
    }
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
    }
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
    }
};
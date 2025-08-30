import { cityApi } from './api';
import { City } from '../types/location';

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia?: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface CEPValidationResult {
  isValid: boolean;
  data?: {
    cep: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    ibge: string;
    ddd: string;
    cidadeEncontrada?: City; // Cidade encontrada no cadastro
  };
  error?: string;
}

export const cepApi = {
  /**
   * Busca cidade no cadastro local por código IBGE ou nome/UF
   */
  findCityInDatabase: async (cityName: string, uf: string, ibgeCode?: string): Promise<City | null> => {
    try {
      // Primeiro tenta buscar pelo código IBGE se disponível
      if (ibgeCode) {
        try {
          const cityByIbge = await cityApi.getByIbgeCode(ibgeCode);
          if (cityByIbge && cityByIbge.ativo) {
            return cityByIbge;
          }
        } catch (error) {
          console.log('Cidade não encontrada pelo código IBGE:', ibgeCode);
        }
      }

      // Se não encontrou pelo IBGE, busca todas as cidades e filtra
      const allCities = await cityApi.getAll();
      
      // Busca por nome exato e UF
      const cityFound = allCities.find(city => 
        city.ativo &&
        city.nome.toLowerCase() === cityName.toLowerCase() &&
        city.uf?.toLowerCase() === uf.toLowerCase()
      );

      return cityFound || null;
    } catch (error) {
      console.error('Erro ao buscar cidade no banco:', error);
      return null;
    }
  },

  /**
   * Valida e busca informações de um CEP usando a API ViaCEP
   * @param cep CEP a ser validado (pode estar formatado ou não)
   * @returns Promise com resultado da validação e dados do endereço
   */
  validateAndFetch: async (cep: string): Promise<CEPValidationResult> => {
    try {
      // Remove formatação do CEP
      const cleanCEP = cep.replace(/\D/g, '');

      // Valida formato básico
      if (cleanCEP.length !== 8) {
        return {
          isValid: false,
          error: 'CEP deve conter exatamente 8 dígitos',
        };
      }

      // Valida padrão de CEP (não pode ser sequencial como 11111111)
      if (/^(\d)\1+$/.test(cleanCEP)) {
        return {
          isValid: false,
          error: 'CEP inválido',
        };
      }

      // Chama a API ViaCEP
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCEP}/json/`,
      );

      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data: ViaCEPResponse = await response.json();

      // Verifica se a API retornou erro
      if (data.erro) {
        return {
          isValid: false,
          error: 'CEP não encontrado',
        };
      }

      // Retorna dados formatados
      const result: CEPValidationResult = {
        isValid: true,
        data: {
          cep: data.cep,
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf,
          ibge: data.ibge,
          ddd: data.ddd,
        },
      };

      // Busca a cidade no cadastro local
      try {
        const cidadeEncontrada = await cepApi.findCityInDatabase(
          data.localidade,
          data.uf,
          data.ibge
        );
        
        if (cidadeEncontrada) {
          result.data!.cidadeEncontrada = cidadeEncontrada;
        }
      } catch (error) {
        console.warn('Erro ao buscar cidade no cadastro local:', error);
        // Não bloqueia o resultado principal se houver erro na busca local
      }

      return result;
    } catch (error) {
      console.error('Erro ao validar CEP:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro ao validar CEP',
      };
    }
  },

  /**
   * Valida apenas o formato do CEP sem fazer consulta à API
   * @param cep CEP a ser validado
   * @returns boolean indicando se o formato é válido
   */
  validateFormat: (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8 && !/^(\d)\1+$/.test(cleanCEP);
  },
};

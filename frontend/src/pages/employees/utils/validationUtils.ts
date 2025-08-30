import { cepApi } from '../../../services/cepApi';

// Formatadores
export const formatCPF = (value: string | undefined): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  const cpf = digits.slice(0, 11);
  return cpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
    (_, p1, p2, p3, p4) => {
      if (p4) return `${p1}.${p2}.${p3}-${p4}`;
      if (p3) return `${p1}.${p2}.${p3}`;
      if (p2) return `${p1}.${p2}`;
      return p1;
    },
  );
};

export const formatPhone = (value: string | undefined): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  const tel = digits.slice(0, 11);
  if (tel.length > 10) {
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (tel.length > 6) {
    return tel.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => {
      if (p3) return `(${p1}) ${p2}-${p3}`;
      if (p2) return `(${p1}) ${p2}`;
      return p1;
    });
  } else {
    return tel.replace(/(\d{0,2})/, (_, p1) => {
      if (p1.length === 2) return `(${p1})`;
      return p1;
    });
  }
};

export const formatCEP = (value: string | undefined): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  const cep = digits.slice(0, 8);
  return cep.replace(/(\d{5})(\d{0,3})/, (_, p1, p2) => {
    if (p2) return `${p1}-${p2}`;
    return p1;
  });
};

export const formatRG = (value: string | undefined): string => {
  if (!value) return '';
  // Formato mais comum: 12.345.678-9 (permite variações por estado)
  const digits = value.replace(/\D/g, '');
  const rg = digits.slice(0, 9);
  return rg.replace(/(\d{2})(\d{3})(\d{3})(\d{0,1})/, (_, p1, p2, p3, p4) => {
    if (p4) return `${p1}.${p2}.${p3}-${p4}`;
    if (p3) return `${p1}.${p2}.${p3}`;
    if (p2) return `${p1}.${p2}`;
    return p1;
  });
};

export const formatText = (value: string | undefined, maxLength: number = 100): string => {
  if (!value) return '';
  return value.slice(0, maxLength).toUpperCase();
};

export const formatEmail = (value: string | undefined): string => {
  if (!value) return '';
  // Remove espaços e mantém em lowercase para email
  return value.replace(/\s/g, '').slice(0, 100).toLowerCase();
};

export const formatOrgaoEmissor = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-Z\/\s]/g, '').slice(0, 20).toUpperCase();
};

export const formatNumber = (value: string | undefined): string => {
  if (!value) return '';
  // Permite números, letras e alguns caracteres especiais comuns em números de endereço
  return value.replace(/[^0-9a-zA-Z\s\-\/]/g, '').slice(0, 10).toUpperCase();
};

export const clearFormat = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Algoritmo de validação do CPF
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Email é opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCEP = (cep: string): boolean => {
  if (!cep) return true; // CEP é opcional
  const digits = cep.replace(/\D/g, '');
  return digits.length === 8;
};

export const validateCEPWithAPI = async (cep: string): Promise<{ isValid: boolean; error?: string }> => {
  if (!cep) return { isValid: true }; // CEP é opcional
  
  try {
    const result = await cepApi.validateAndFetch(cep);
    return {
      isValid: result.isValid,
      error: result.error
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Erro ao validar CEP'
    };
  }
};

export const validateTelefone = (telefone: string): boolean => {
  if (!telefone) return true; // Telefone é opcional
  const digits = telefone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

export const validateRG = (rg: string): boolean => {
  if (!rg) return true; // RG é opcional
  const digits = rg.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 9; // RG geralmente tem 7-9 dígitos
};

// Função para determinar se um campo é válido e retornar classe CSS apropriada
export const getFieldValidationClass = (
  fieldValue: string | undefined,
  fieldName: string
): string => {
  if (!fieldValue) return '';
  
  let isValid = true;
  
  switch (fieldName) {
    case 'cpf':
      isValid = validateCPF(fieldValue);
      break;
    case 'email':
      isValid = validateEmail(fieldValue);
      break;
    case 'cep':
      isValid = validateCEP(fieldValue);
      break;
    case 'telefone':
    case 'celular':
      isValid = validateTelefone(fieldValue);
      break;
    case 'rg':
      isValid = validateRG(fieldValue);
      break;
  }
  
  return isValid ? 'border-green-300 focus:border-green-500' : 'border-red-300 focus:border-red-500';
};

// Função para obter mensagem de validação em tempo real
export const getValidationMessage = (
  fieldValue: string | undefined,
  fieldName: string
): string => {
  if (!fieldValue) return '';
  
  switch (fieldName) {
    case 'cpf':
      const digits = fieldValue.replace(/\D/g, '');
      if (digits.length < 11) return `CPF incompleto (${digits.length}/11 dígitos)`;
      if (!validateCPF(fieldValue)) return 'CPF inválido';
      return '✓ CPF válido';
    case 'email':
      if (!validateEmail(fieldValue)) return 'Formato de email inválido';
      return '✓ Email válido';
    case 'cep':
      const cepDigits = fieldValue.replace(/\D/g, '');
      if (cepDigits.length > 0 && cepDigits.length < 8) {
        return `CEP incompleto (${cepDigits.length}/8 dígitos)`;
      }
      if (cepDigits.length === 8) return '✓ CEP válido';
      break;
    case 'telefone':
    case 'celular':
      const telDigits = fieldValue.replace(/\D/g, '');
      if (telDigits.length > 0 && telDigits.length < 10) {
        return `Telefone incompleto (${telDigits.length}/10-11 dígitos)`;
      }
      if (telDigits.length >= 10) return '✓ Telefone válido';
      break;
    case 'rg':
      const rgDigits = fieldValue.replace(/\D/g, '');
      if (rgDigits.length > 0 && rgDigits.length < 7) {
        return `RG incompleto (${rgDigits.length}/7-9 dígitos)`;
      }
      if (rgDigits.length >= 7) return '✓ RG válido';
      break;
  }
  
  return '';
};

export const formatDisplayCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatDisplayPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const formatDisplayCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
};

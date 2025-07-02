// Utilitários de validação para o formulário de fornecedores

export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  const calcDigit = (base: string): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * (base.length + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const digit1 = calcDigit(digits.slice(0, 9));
  const digit2 = calcDigit(digits.slice(0, 10));
  
  return digit1 === parseInt(digits[9]) && digit2 === parseInt(digits[10]);
};

export const validateCNPJ = (cnpj: string): boolean => {
  if (!cnpj) return false;
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  
  const calcDigit = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  const digit1 = calcDigit(digits.slice(0, 12), weights1);
  const digit2 = calcDigit(digits.slice(0, 13), weights2);
  
  return digit1 === parseInt(digits[12]) && digit2 === parseInt(digits[13]);
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

export const validateInscricaoEstadual = (ie: string): boolean => {
  if (!ie) return true; // IE é opcional
  return ie.trim().length >= 6; // IE geralmente tem pelo menos 6 caracteres
};

export const validateWebsite = (website: string): boolean => {
  if (!website) return true; // Website é opcional
  
  // Remove espaços em branco
  const trimmedWebsite = website.trim();
  if (!trimmedWebsite) return true;
  
  try {
    // Converte para lowercase para verificação de protocolo
    const lowerWebsite = trimmedWebsite.toLowerCase();
    const urlWithProtocol = lowerWebsite.startsWith('http://') || lowerWebsite.startsWith('https://') 
      ? trimmedWebsite 
      : `https://${trimmedWebsite}`;
    
    // Tenta criar um objeto URL
    const url = new URL(urlWithProtocol);
    
    // Verifica se tem pelo menos um ponto no hostname (domínio válido)
    return url.hostname.includes('.');
  } catch {
    // Se não conseguir criar URL, tenta regex mais simples case-insensitive
    const withoutProtocol = trimmedWebsite.replace(/^https?:\/\//i, '');
    const simpleRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|[0-9]{1,3})$/i;
    return simpleRegex.test(withoutProtocol);
  }
};

// Função para determinar se um campo é válido e retornar classe CSS apropriada
export const getFieldValidationClass = (
  fieldValue: string | undefined,
  fieldName: string,
  tipo?: 'F' | 'J',
  isEstrangeiro?: boolean
): string => {
  if (!fieldValue) return '';
  
  let isValid = true;
  
  switch (fieldName) {
    case 'cnpjCpf':
      if (!isEstrangeiro) {
        isValid = tipo === 'F' ? validateCPF(fieldValue) : validateCNPJ(fieldValue);
      }
      break;
    case 'email':
      isValid = validateEmail(fieldValue);
      break;
    case 'cep':
      isValid = validateCEP(fieldValue);
      break;
    case 'telefone':
    case 'celularResponsavel':
      isValid = validateTelefone(fieldValue);
      break;
    case 'inscricaoEstadual':
      if (!isEstrangeiro) {
        isValid = tipo === 'F' ? validateRG(fieldValue) : validateInscricaoEstadual(fieldValue);
      }
      break;
    case 'website':
      isValid = validateWebsite(fieldValue);
      break;
  }
  
  return isValid ? 'border-green-300 focus:border-green-500' : 'border-red-300 focus:border-red-500';
};

// Função para obter mensagem de validação em tempo real
export const getValidationMessage = (
  fieldValue: string | undefined,
  fieldName: string,
  tipo?: 'F' | 'J',
  isEstrangeiro?: boolean
): string => {
  if (!fieldValue) return '';
  
  switch (fieldName) {
    case 'cnpjCpf':
      if (!isEstrangeiro) {
        const digits = fieldValue.replace(/\D/g, '');
        if (tipo === 'F') {
          if (digits.length < 11) return `CPF incompleto (${digits.length}/11 dígitos)`;
          if (!validateCPF(fieldValue)) return 'CPF inválido';
          return '✓ CPF válido';
        } else {
          if (digits.length < 14) return `CNPJ incompleto (${digits.length}/14 dígitos)`;
          if (!validateCNPJ(fieldValue)) return 'CNPJ inválido';
          return '✓ CNPJ válido';
        }
      }
      break;
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
    case 'celularResponsavel':
      const telDigits = fieldValue.replace(/\D/g, '');
      if (telDigits.length > 0 && telDigits.length < 10) {
        return `Telefone incompleto (${telDigits.length}/10-11 dígitos)`;
      }
      if (telDigits.length >= 10) return '✓ Telefone válido';
      break;
    case 'inscricaoEstadual':
      if (!isEstrangeiro) {
        if (tipo === 'F') {
          const rgDigits = fieldValue.replace(/\D/g, '');
          if (rgDigits.length > 0 && rgDigits.length < 7) {
            return `RG incompleto (${rgDigits.length}/7-9 dígitos)`;
          }
          if (rgDigits.length >= 7) return '✓ RG válido';
        } else {
          if (fieldValue.trim().length > 0 && fieldValue.trim().length < 6) {
            return `Inscrição Estadual incompleta (mín. 6 caracteres)`;
          }
          if (fieldValue.trim().length >= 6) return '✓ Inscrição Estadual válida';
        }
      } else {
        if (fieldValue.trim().length > 0) return '✓ Documento válido';
      }
      break;
    case 'website':
      if (!validateWebsite(fieldValue)) return 'URL inválida (ex: https://exemplo.com)';
      return '✓ Website válido';
      break;
  }
  
  return '';
};

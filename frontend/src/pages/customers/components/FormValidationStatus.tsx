import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { validateCPF, validateCNPJ, validateEmail, validateCEP, validateTelefone, validateRG, validateInscricaoEstadual } from '../utils/validationUtils';

interface FormValidationStatusProps {
  form: UseFormReturn<any>;
  watchTipo: 'F' | 'J';
  watchIsEstrangeiro: boolean;
}

const FormValidationStatus = ({ form, watchTipo, watchIsEstrangeiro }: FormValidationStatusProps) => {
  const values = form.getValues();
  const errors = form.formState.errors;
  
  const validations = [
    {
      field: 'razaoSocial',
      label: watchTipo === 'J' ? 'Razão Social' : 'Nome Completo',
      isValid: values.razaoSocial && values.razaoSocial.trim().length >= 2,
      isRequired: true
    },
    {
      field: 'cnpjCpf',
      label: watchTipo === 'J' ? 'CNPJ' : 'CPF',
      isValid: watchIsEstrangeiro || (watchTipo === 'F' ? validateCPF(values.cnpjCpf) : validateCNPJ(values.cnpjCpf)),
      isRequired: true
    },
    {
      field: 'inscricaoEstadual',
      label: watchTipo === 'J' ? 'Inscrição Estadual' : 'RG',
      isValid: !values.inscricaoEstadual || (watchTipo === 'F' ? validateRG(values.inscricaoEstadual) : validateInscricaoEstadual(values.inscricaoEstadual)),
      isRequired: false
    },
    {
      field: 'email',
      label: 'Email',
      isValid: !values.email || validateEmail(values.email),
      isRequired: false
    },
    {
      field: 'telefone',
      label: 'Telefone',
      isValid: !values.telefone || validateTelefone(values.telefone),
      isRequired: false
    },
    {
      field: 'cep',
      label: 'CEP',
      isValid: !values.cep || validateCEP(values.cep),
      isRequired: false
    }
  ];

  const requiredFields = validations.filter(v => v.isRequired);
  const optionalFields = validations.filter(v => !v.isRequired && values[v.field]);
  
  const requiredValid = requiredFields.filter(v => v.isValid).length;
  const requiredTotal = requiredFields.length;
  const optionalValid = optionalFields.filter(v => v.isValid).length;
  const optionalTotal = optionalFields.length;

  const hasErrors = Object.keys(errors).length > 0;

  const getStatusIcon = (isValid: boolean, hasValue: boolean, isRequired: boolean) => {
    if (!hasValue && !isRequired) return null;
    if (isValid) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (hasValue && !isValid) return <XCircle className="h-4 w-4 text-red-500" />;
    if (!hasValue && isRequired) return <AlertCircle className="h-4 w-4 text-amber-500" />;
    return null;
  };

  return (
    <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        Status de Validação do Formulário
        {!hasErrors && requiredValid === requiredTotal && optionalValid === optionalTotal ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-500" />
        )}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div>
          <div className="font-medium text-slate-700 mb-1">Campos Obrigatórios:</div>
          {requiredFields.map((validation) => (
            <div key={validation.field} className="flex items-center gap-2 py-1">
              {getStatusIcon(validation.isValid, !!values[validation.field], validation.isRequired)}
              <span className={validation.isValid ? 'text-green-700' : 'text-slate-600'}>
                {validation.label}
              </span>
            </div>
          ))}
        </div>
        
        {optionalFields.length > 0 && (
          <div>
            <div className="font-medium text-slate-700 mb-1">Campos Opcionais Preenchidos:</div>
            {optionalFields.map((validation) => (
              <div key={validation.field} className="flex items-center gap-2 py-1">
                {getStatusIcon(validation.isValid, !!values[validation.field], validation.isRequired)}
                <span className={validation.isValid ? 'text-green-700' : 'text-red-700'}>
                  {validation.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex gap-4 text-xs text-slate-600 pt-2 border-t">
        <span>Obrigatórios: {requiredValid}/{requiredTotal}</span>
        {optionalTotal > 0 && <span>Opcionais: {optionalValid}/{optionalTotal}</span>}
      </div>
    </div>
  );
};

export default FormValidationStatus;

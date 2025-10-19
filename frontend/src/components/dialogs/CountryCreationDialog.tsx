import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Country } from '@/types/location';
import CountryForm from '@/pages/countries/CountryForm';

interface CountryCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (country: Country) => void;
  country?: Country | null;
}

const CountryCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  country,
}: CountryCreationDialogProps) => {
  const handleSuccess = (createdCountry: Country) => {
    onSuccess(createdCountry);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] max-h-[90vh] p-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {country ? 'Editar país' : 'Adicionar novo país'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {country
              ? 'Altere os campos abaixo para atualizar o país.'
              : 'Preencha os campos abaixo para cadastrar um novo país.'}
          </DialogDescription>
        </DialogHeader>

        <CountryForm
          mode="dialog"
          countryId={country?.id}
          initialData={
            country
              ? {
                  nome: country.nome,
                  sigla: country.sigla,
                  codigo: country.codigo,
                  ativo: country.ativo,
                }
              : undefined
          }
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CountryCreationDialog;

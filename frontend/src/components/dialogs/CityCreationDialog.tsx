import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { City } from '@/types/location';
import CityForm from '@/pages/cities/CityForm';

interface CityCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (city: City) => void;
  selectedStateId?: number;
  city?: City | null;
}

const CityCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  selectedStateId,
  city,
}: CityCreationDialogProps) => {
  const handleSuccess = (createdCity: City) => {
    onSuccess(createdCity);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[65vw] 2xl:max-w-[55vw] max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {city ? 'Editar cidade' : 'Adicionar nova cidade'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {city
              ? 'Altere os campos abaixo para atualizar a cidade.'
              : 'Preencha os campos abaixo para cadastrar uma nova cidade.'}
          </DialogDescription>
        </DialogHeader>

        <CityForm
          mode="dialog"
          cityId={city?.id}
          initialData={
            city
              ? {
                  nome: city.nome,
                  codigoIbge: city.codigoIbge,
                  estadoId: city.estadoId,
                  ativo: city.ativo,
                }
              : { estadoId: selectedStateId }
          }
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CityCreationDialog;

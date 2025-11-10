import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UnitMeasure } from '@/types/unit-measure';
import UnitMeasureForm from '@/pages/unit-measures/UnitMeasureForm';

interface UnitMeasureCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (unitMeasure: UnitMeasure) => void;
  unitMeasure?: UnitMeasure | null;
}

const UnitMeasureCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  unitMeasure,
}: UnitMeasureCreationDialogProps) => {
  const handleSuccess = (createdUnitMeasure: UnitMeasure) => {
    onSuccess(createdUnitMeasure);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {unitMeasure
              ? 'Editar unidade de medida'
              : 'Adicionar nova unidade de medida'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {unitMeasure
              ? 'Altere os campos abaixo para atualizar a unidade de medida.'
              : 'Preencha os campos abaixo para cadastrar uma nova unidade de medida.'}
          </DialogDescription>
        </DialogHeader>

        <UnitMeasureForm
          mode="dialog"
          unitMeasureId={unitMeasure?.id}
          initialData={
            unitMeasure
              ? {
                  nome: unitMeasure.nome,
                  sigla: unitMeasure.sigla,
                  ativo: unitMeasure.ativo,
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

export default UnitMeasureCreationDialog;

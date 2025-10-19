import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { State } from '@/types/location';
import StateForm from '@/pages/states/StateForm';

interface StateCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (state: State) => void;
  selectedCountryId?: number;
  state?: State | null;
}

const StateCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  selectedCountryId,
  state,
}: StateCreationDialogProps) => {
  const handleSuccess = (createdState: State) => {
    onSuccess(createdState);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] 2xl:max-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {state ? 'Editar estado' : 'Adicionar novo estado'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {state
              ? 'Altere os campos abaixo para atualizar o estado.'
              : 'Preencha os campos abaixo para cadastrar um novo estado.'}
          </DialogDescription>
        </DialogHeader>

        <StateForm
          mode="dialog"
          stateId={state?.id}
          initialData={
            state
              ? {
                  nome: state.nome,
                  uf: state.uf,
                  paisId: state.paisId,
                  ativo: state.ativo,
                }
              : { paisId: selectedCountryId }
          }
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StateCreationDialog;

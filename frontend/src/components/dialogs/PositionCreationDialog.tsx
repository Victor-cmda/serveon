import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Position } from '@/types/position';
import PositionForm from '@/pages/positions/PositionForm';

interface PositionCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (position: Position) => void;
  position?: Position | null;
}

const PositionCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  position,
}: PositionCreationDialogProps) => {
  const handleSuccess = (savedPosition: Position) => {
    onSuccess(savedPosition);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {position ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
          <DialogDescription>
            {position
              ? 'Altere os campos abaixo para atualizar o cargo.'
              : 'Preencha os campos abaixo para cadastrar um novo cargo.'}
          </DialogDescription>
        </DialogHeader>
        <PositionForm
          key={position?.id || 'new'}
          mode="dialog"
          positionId={position?.id}
          initialData={position || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PositionCreationDialog;

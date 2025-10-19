import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
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
  const [isDialogOpen, setIsDialogOpen] = useState(open);

  useEffect(() => {
    setIsDialogOpen(open);
  }, [open]);

  const handleSuccess = (savedPosition: Position) => {
    setIsDialogOpen(false);
    onOpenChange(false);
    onSuccess(savedPosition);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {position ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
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

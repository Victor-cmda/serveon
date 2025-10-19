import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentMethod } from '@/types/payment-method';
import PaymentMethodForm from '@/pages/payment-methods/PaymentMethodForm';

interface PaymentMethodCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (paymentMethod: PaymentMethod) => void;
  paymentMethod?: PaymentMethod | null;
}

const PaymentMethodCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  paymentMethod,
}: PaymentMethodCreationDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(open);

  useEffect(() => {
    setIsDialogOpen(open);
  }, [open]);

  const handleSuccess = (savedPaymentMethod: PaymentMethod) => {
    setIsDialogOpen(false);
    onOpenChange(false);
    onSuccess(savedPaymentMethod);
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
            {paymentMethod
              ? 'Editar Método de Pagamento'
              : 'Novo Método de Pagamento'}
          </DialogTitle>
        </DialogHeader>
        <PaymentMethodForm
          key={paymentMethod?.id || 'new'}
          mode="dialog"
          paymentMethodId={paymentMethod?.id}
          initialData={paymentMethod || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodCreationDialog;

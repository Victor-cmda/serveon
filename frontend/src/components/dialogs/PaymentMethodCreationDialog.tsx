import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const handleSuccess = (savedPaymentMethod: PaymentMethod) => {
    onSuccess(savedPaymentMethod);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paymentMethod
              ? 'Editar Método de Pagamento'
              : 'Novo Método de Pagamento'}
          </DialogTitle>
          <DialogDescription>
            {paymentMethod
              ? 'Altere os campos abaixo para atualizar o método de pagamento.'
              : 'Preencha os campos abaixo para cadastrar um novo método de pagamento.'}
          </DialogDescription>
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

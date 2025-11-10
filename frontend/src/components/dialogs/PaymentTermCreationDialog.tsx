import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentTerm } from '@/types/payment-term';
import PaymentTermForm from '@/pages/payment-terms/PaymentTermForm';

interface PaymentTermCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (paymentTerm: PaymentTerm) => void;
  paymentTerm?: PaymentTerm | null;
}

const PaymentTermCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  paymentTerm,
}: PaymentTermCreationDialogProps) => {
  const handleSuccess = (savedPaymentTerm: PaymentTerm) => {
    onSuccess(savedPaymentTerm);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paymentTerm
              ? 'Editar Condição de Pagamento'
              : 'Nova Condição de Pagamento'}
          </DialogTitle>
          <DialogDescription>
            {paymentTerm
              ? 'Altere os campos abaixo para atualizar a condição de pagamento.'
              : 'Preencha os campos abaixo para cadastrar uma nova condição de pagamento. Configure as parcelas, métodos de pagamento e demais informações.'}
          </DialogDescription>
        </DialogHeader>
        <PaymentTermForm
          mode="dialog"
          paymentTermId={paymentTerm?.id}
          initialData={paymentTerm || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentTermCreationDialog;

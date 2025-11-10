import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Transporter } from '@/types/transporter';
import TransporterForm from '@/pages/transporters/TransporterForm';

interface TransporterCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (transporter: Transporter) => void;
  transporter?: Transporter | null;
}

const TransporterCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  transporter,
}: TransporterCreationDialogProps) => {
  const handleSuccess = (createdTransporter: Transporter) => {
    onSuccess(createdTransporter);
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
            {transporter
              ? 'Editar transportadora'
              : 'Adicionar nova transportadora'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {transporter
              ? 'Altere os campos abaixo para atualizar a transportadora.'
              : 'Preencha os campos abaixo para cadastrar uma nova transportadora.'}
          </DialogDescription>
        </DialogHeader>

        <TransporterForm
          mode="dialog"
          transporterId={transporter?.id}
          initialData={transporter || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TransporterCreationDialog;

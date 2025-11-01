import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Customer } from '@/types/customer';
import CustomerForm from '@/pages/customers/CustomerForm';

interface CustomerCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customer: Customer) => void;
  customer?: Customer | null;
}

const CustomerCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  customer,
}: CustomerCreationDialogProps) => {
  const handleSuccess = (createdCustomer: Customer) => {
    onSuccess(createdCustomer);
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
            {customer ? 'Editar cliente' : 'Adicionar novo cliente'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {customer
              ? 'Altere os campos abaixo para atualizar o cliente.'
              : 'Preencha os campos abaixo para cadastrar um novo cliente.'}
          </DialogDescription>
        </DialogHeader>

        <CustomerForm
          mode="dialog"
          customerId={customer?.id}
          initialData={
            customer
              ? {
                  cnpjCpf: customer.cnpjCpf,
                  tipo: customer.tipo,
                  isEstrangeiro: customer.isEstrangeiro,
                  razaoSocial: customer.razaoSocial,
                  nomeFantasia: customer.nomeFantasia,
                  inscricaoEstadual: customer.inscricaoEstadual,
                  endereco: customer.endereco,
                  numero: customer.numero,
                  complemento: customer.complemento,
                  bairro: customer.bairro,
                  cidadeId: customer.cidadeId,
                  cep: customer.cep,
                  telefone: customer.telefone,
                  email: customer.email,
                  ativo: customer.ativo,
                  condicaoPagamentoId: customer.condicaoPagamentoId,
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

export default CustomerCreationDialog;

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Supplier } from '@/types/supplier';
import SupplierForm from '@/pages/suppliers/SupplierForm';

interface SupplierCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (supplier: Supplier) => void;
  supplier?: Supplier | null;
}

const SupplierCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  supplier,
}: SupplierCreationDialogProps) => {
  const handleSuccess = (createdSupplier: Supplier) => {
    onSuccess(createdSupplier);
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
            {supplier ? 'Editar fornecedor' : 'Adicionar novo fornecedor'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {supplier
              ? 'Altere os campos abaixo para atualizar o fornecedor.'
              : 'Preencha os campos abaixo para cadastrar um novo fornecedor.'}
          </DialogDescription>
        </DialogHeader>

        <SupplierForm
          mode="dialog"
          supplierId={supplier?.id}
          initialData={
            supplier
              ? {
                  cnpjCpf: supplier.cnpjCpf,
                  tipo: supplier.tipo,
                  isEstrangeiro: supplier.isEstrangeiro,
                  razaoSocial: supplier.razaoSocial,
                  nomeFantasia: supplier.nomeFantasia,
                  inscricaoEstadual: supplier.inscricaoEstadual,
                  endereco: supplier.endereco,
                  numero: supplier.numero,
                  complemento: supplier.complemento,
                  bairro: supplier.bairro,
                  cidadeId: supplier.cidadeId,
                  cep: supplier.cep,
                  telefone: supplier.telefone,
                  email: supplier.email,
                  limiteCredito: supplier.limiteCredito,
                  nacionalidadeId: supplier.nacionalidadeId,
                  ativo: supplier.ativo,
                  website: supplier.website,
                  observacoes: supplier.observacoes,
                  responsavel: supplier.responsavel,
                  celularResponsavel: supplier.celularResponsavel,
                  condicaoPagamentoId: supplier.condicaoPagamentoId,
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

export default SupplierCreationDialog;

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Brand } from '@/types/brand';
import BrandForm from '@/pages/brands/BrandForm';

interface BrandCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (brand: Brand) => void;
  brand?: Brand | null;
}

const BrandCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  brand,
}: BrandCreationDialogProps) => {
  const handleSuccess = (createdBrand: Brand) => {
    onSuccess(createdBrand);
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
            {brand ? 'Editar marca' : 'Adicionar nova marca'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {brand
              ? 'Altere os campos abaixo para atualizar a marca.'
              : 'Preencha os campos abaixo para cadastrar uma nova marca.'}
          </DialogDescription>
        </DialogHeader>

        <BrandForm
          mode="dialog"
          brandId={brand?.id}
          initialData={
            brand
              ? {
                  nome: brand.nome,
                  descricao: brand.descricao,
                  ativo: brand.ativo,
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

export default BrandCreationDialog;

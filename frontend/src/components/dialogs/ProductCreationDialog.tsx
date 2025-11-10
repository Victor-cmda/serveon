import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import ProductForm from '@/pages/products/ProductForm';
import { Product } from '@/types/product';

interface ProductCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (product: Product) => void;
  product?: Product | null;
}

const ProductCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  product,
}: ProductCreationDialogProps) => {
  const handleSuccess = (savedProduct: Product) => {
    onSuccess(savedProduct);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <ProductForm
          mode="dialog"
          productId={product?.id}
          initialData={product || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductCreationDialog;

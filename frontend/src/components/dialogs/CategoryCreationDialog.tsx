import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Category } from '@/types/category';
import CategoryForm from '@/pages/categories/CategoryForm';

interface CategoryCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (category: Category) => void;
  category?: Category | null;
}

const CategoryCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  category,
}: CategoryCreationDialogProps) => {
  const handleSuccess = (createdCategory: Category) => {
    onSuccess(createdCategory);
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
            {category ? 'Editar categoria' : 'Adicionar nova categoria'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {category
              ? 'Altere os campos abaixo para atualizar a categoria.'
              : 'Preencha os campos abaixo para cadastrar uma nova categoria.'}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          mode="dialog"
          categoryId={category?.id}
          initialData={
            category
              ? {
                  nome: category.nome,
                  descricao: category.descricao,
                  ativo: category.ativo,
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

export default CategoryCreationDialog;

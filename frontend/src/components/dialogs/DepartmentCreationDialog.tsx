import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Department } from '@/types/department';
import DepartmentForm from '@/pages/departments/DepartmentForm';

interface DepartmentCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (department: Department) => void;
  department?: Department | null;
}

const DepartmentCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  department,
}: DepartmentCreationDialogProps) => {
  const handleSuccess = (savedDepartment: Department) => {
    onSuccess(savedDepartment);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {department ? 'Editar Departamento' : 'Novo Departamento'}
          </DialogTitle>
          <DialogDescription>
            {department
              ? 'Altere os campos abaixo para atualizar o departamento.'
              : 'Preencha os campos abaixo para cadastrar um novo departamento.'}
          </DialogDescription>
        </DialogHeader>
        <DepartmentForm
          key={department?.id || 'new'}
          mode="dialog"
          departmentId={department?.id}
          initialData={department || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentCreationDialog;
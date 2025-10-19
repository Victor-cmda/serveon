import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
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
  const [isDialogOpen, setIsDialogOpen] = useState(open);

  useEffect(() => {
    setIsDialogOpen(open);
  }, [open]);

  const handleSuccess = (savedDepartment: Department) => {
    setIsDialogOpen(false);
    onOpenChange(false);
    onSuccess(savedDepartment);
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
            {department ? 'Editar Departamento' : 'Novo Departamento'}
          </DialogTitle>
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
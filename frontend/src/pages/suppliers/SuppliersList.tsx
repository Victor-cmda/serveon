import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supplierApi } from '@/services/api';
import { Supplier } from '@/types/supplier';
import { toast } from 'sonner';

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null,
  );

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (search) {
      const searchLower = search.toLowerCase();
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.razaoSocial.toLowerCase().includes(searchLower) ||
          (supplier.nomeFantasia &&
            supplier.nomeFantasia.toLowerCase().includes(searchLower)) ||
          supplier.cnpjCpf.toLowerCase().includes(searchLower) ||
          (supplier.cidadeNome &&
            supplier.cidadeNome.toLowerCase().includes(searchLower)) ||
          (supplier.responsavel &&
            supplier.responsavel.toLowerCase().includes(searchLower)),
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [search, suppliers]);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await supplierApi.getAll();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar a lista de fornecedores',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;

    try {
      await supplierApi.delete(supplierToDelete.id);
      setSuppliers(
        suppliers.filter((s) => s.id !== supplierToDelete.id),
      );
      toast.success('Sucesso', {
        description: `Fornecedor ${supplierToDelete.razaoSocial} removido com sucesso.`,
      });
      fetchSuppliers();
    } catch (error: any) {
      console.error('Erro ao excluir fornecedor:', error);
      toast.error('Erro', {
        description:
          error.message ||
          'Não foi possível excluir o fornecedor. Verifique se não há referências.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };  const formatCpfCnpj = (doc: string, tipo: 'F' | 'J') => {
    if (tipo === 'F') {
      if (doc.length === 11) {
        return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
    } else {
      if (doc.length === 14) {
        return doc.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          '$1.$2.$3/$4-$5',
        );
      }
    }
    return doc;
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Fornecedores</h1>
        <Button asChild>
          <Link to="/suppliers/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Input
            type="search"
            placeholder="Buscar fornecedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome/Razão Social</TableHead>
              <TableHead>Nome Fantasia</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhum fornecedor encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    {supplier.razaoSocial}
                  </TableCell>
                  <TableCell>{supplier.nomeFantasia || '-'}</TableCell>
                  <TableCell>
                    {formatCpfCnpj(supplier.cnpjCpf, supplier.tipo)}
                  </TableCell>
                  <TableCell>
                    {supplier.tipo === 'F' ? 'Física' : 'Jurídica'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/suppliers/edit/${supplier.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(supplier)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fornecedor{' '}
              {supplierToDelete?.razaoSocial}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersList;

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
  };

  const formatCnpjCpf = (cnpjCpf: string) => {
    if (!cnpjCpf) return '';
    cnpjCpf = cnpjCpf.replace(/[^\d]/g, '');
    if (cnpjCpf.length <= 11) {
      return cnpjCpf.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4',
      );
    } else {
      return cnpjCpf.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5',
      );
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-8 py-4">
        <h1 className="text-xl font-semibold">Fornecedores</h1>
        <Button asChild>
          <Link to="/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6">
          <Input
            placeholder="Buscar fornecedor..."
            className="max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social / Nome</TableHead>
                <TableHead>CNPJ / CPF</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center"
                  >
                    Nenhum fornecedor encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="font-medium">{supplier.razaoSocial}</div>
                      {supplier.nomeFantasia && (
                        <div className="text-sm text-muted-foreground">
                          {supplier.nomeFantasia}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCnpjCpf(supplier.cnpjCpf)}
                    </TableCell>
                    <TableCell>
                      {supplier.cidadeNome}
                      {supplier.uf && (
                        <span className="text-sm text-muted-foreground">
                          {' '}
                          ({supplier.uf})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatPhoneNumber(supplier.telefone || '')}
                    </TableCell>
                    <TableCell>
                      {supplier.responsavel}
                      {supplier.celularResponsavel && (
                        <div className="text-sm text-muted-foreground">
                          {formatPhoneNumber(supplier.celularResponsavel)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {supplier.ativo ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Ativo
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          Inativo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link to={`/suppliers/${supplier.id}`}>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fornecedor{' '}
              <strong>{supplierToDelete?.razaoSocial}</strong>?
              <br />
              Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersList;

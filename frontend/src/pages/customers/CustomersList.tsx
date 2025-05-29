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
import { customerApi } from '@/services/api';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';

const CustomersList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (search) {
      const searchLower = search.toLowerCase();
      const filtered = customers.filter(
        (customer) =>
          customer.razaoSocial.toLowerCase().includes(searchLower) ||
          (customer.nomeFantasia &&
            customer.nomeFantasia.toLowerCase().includes(searchLower)) ||
          customer.cnpjCpf.toLowerCase().includes(searchLower) ||
          (customer.cidadeNome &&
            customer.cidadeNome.toLowerCase().includes(searchLower)),
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [search, customers]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerApi.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar a lista de clientes',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      await customerApi.delete(Number(customerToDelete.cnpjCpf));
      setCustomers(
        customers.filter((c) => c.cnpjCpf !== customerToDelete.cnpjCpf),
      );
      toast.success('Sucesso', {
        description: `Cliente ${customerToDelete.razaoSocial} removido com sucesso.`,
      });
      fetchCustomers();
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro', {
        description:
          error.message ||
          'Não foi possível excluir o cliente. Verifique se não há referências.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const formatCpfCnpj = (doc: string, tipo: 'F' | 'J') => {
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
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <Button asChild>
          <Link to="/customers/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Input
            type="search"
            placeholder="Buscar clientes..."
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
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.cnpjCpf}>
                  <TableCell className="font-medium">
                    {customer.razaoSocial}
                  </TableCell>
                  <TableCell>{customer.nomeFantasia || '-'}</TableCell>
                  <TableCell>
                    {formatCpfCnpj(customer.cnpjCpf, customer.tipo)}
                  </TableCell>
                  <TableCell>
                    {customer.tipo === 'F' ? 'Física' : 'Jurídica'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/customers/edit/${customer.cnpjCpf}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(customer)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cliente{' '}
              {customerToDelete?.razaoSocial}? Esta ação não pode ser desfeita.
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

export default CustomersList;

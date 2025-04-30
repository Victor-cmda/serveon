import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Search, CreditCard } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { paymentMethodApi } from '@/services/api';
import { PaymentMethod } from '@/types/payment-method';
import { toast } from 'sonner';

const PaymentMethodsList = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [filteredPaymentMethods, setFilteredPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = paymentMethods.filter(
        (method) =>
          method.description.toLowerCase().includes(search.toLowerCase()) ||
          (method.code && method.code.toLowerCase().includes(search.toLowerCase())) ||
          (method.type && method.type.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredPaymentMethods(filtered);
    } else {
      setFilteredPaymentMethods(paymentMethods);
    }
  }, [search, paymentMethods]);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const data = await paymentMethodApi.getAll();
      setPaymentMethods(data);
      setFilteredPaymentMethods(data);
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar a lista de métodos de pagamento.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!methodToDelete) return;

    try {
      await paymentMethodApi.delete(methodToDelete.id);
      setPaymentMethods(paymentMethods.filter((m) => m.id !== methodToDelete.id));
      toast.success('Sucesso', {
        description: `Método de pagamento "${methodToDelete.description}" removido com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao excluir método de pagamento:', error);
      toast.error('Erro', {
        description:
          error.message ||
          'Não foi possível excluir o método de pagamento. Verifique se não está sendo usado em parcelas.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setMethodToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Métodos de Pagamento</h1>
        <Button asChild>
          <Link to="/payment-methods/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Método
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar métodos de pagamento..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
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
            ) : filteredPaymentMethods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhum método de pagamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredPaymentMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      {method.description}
                    </div>
                  </TableCell>
                  <TableCell>{method.code || "-"}</TableCell>
                  <TableCell>{method.type || "-"}</TableCell>
                  <TableCell>
                    <Badge className={method.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {method.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/payment-methods/edit/${method.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(method)}
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
              Tem certeza que deseja excluir o método de pagamento "{methodToDelete?.description}"?
              Esta ação não pode ser desfeita.
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

export default PaymentMethodsList;

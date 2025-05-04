import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Search, FileText } from 'lucide-react';
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
import { paymentTermApi } from '@/services/api';
import { PaymentTerm } from '@/types/payment-term';
import { toast } from 'sonner';

const PaymentTermsList = () => {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [filteredPaymentTerms, setFilteredPaymentTerms] = useState<PaymentTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState<PaymentTerm | null>(null);

  useEffect(() => {
    fetchPaymentTerms();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = paymentTerms.filter(
        (term) =>
          term.name.toLowerCase().includes(search.toLowerCase()) ||
          (term.description && term.description.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredPaymentTerms(filtered);
    } else {
      setFilteredPaymentTerms(paymentTerms);
    }
  }, [search, paymentTerms]);

  const fetchPaymentTerms = async () => {
    setIsLoading(true);
    try {
      const data = await paymentTermApi.getAll();
      setPaymentTerms(data);
      setFilteredPaymentTerms(data);
    } catch (error) {
      console.error('Erro ao buscar condições de pagamento:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar a lista de condições de pagamento.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (term: PaymentTerm) => {
    setTermToDelete(term);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!termToDelete) return;

    try {
      await paymentTermApi.delete(termToDelete.id);
      setPaymentTerms(paymentTerms.filter((t) => t.id !== termToDelete.id));
      toast.success('Sucesso', {
        description: `Condição de pagamento "${termToDelete.name}" removida com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao excluir condição de pagamento:', error);
      toast.error('Erro', {
        description:
          error.message ||
          'Não foi possível excluir a condição de pagamento. Verifique se não está sendo usada em pedidos.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTermToDelete(null);
    }
  };

  const calculateTotalInstallments = (term: PaymentTerm) => {
    return term.installments.length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Condições de Pagamento</h1>
        <Button asChild>
          <Link to="/payment-terms/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Condição
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar condições de pagamento..."
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
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Parcelas</TableHead>
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
            ) : filteredPaymentTerms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhuma condição de pagamento encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredPaymentTerms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      {term.name}
                    </div>
                  </TableCell>
                  <TableCell>{term.description || "-"}</TableCell>
                  <TableCell>{calculateTotalInstallments(term)}</TableCell>
                  <TableCell>
                    <Badge className={term.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {term.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/payment-terms/edit/${term.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(term)}
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
              Tem certeza que deseja excluir a condição de pagamento "{termToDelete?.name}"?
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

export default PaymentTermsList;
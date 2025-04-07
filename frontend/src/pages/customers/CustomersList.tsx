import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { customerApi } from '@/services/api';
import { countryApi } from '@/services/api';
import { Customer } from '@/types/customer';
import { Country } from '@/types/location';
import { toast } from 'sonner';

const CustomersList = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [showEstrangeiros, setShowEstrangeiros] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    useEffect(() => {
        fetchCustomers();
        fetchCountries();
    }, []);

    useEffect(() => {
        let filtered = customers;
        
        // Processar cada cliente para identificar se é estrangeiro
        filtered = filtered.map(customer => {
            const isEstrangeiro = !customer.cidadeId;
            return { ...customer, isEstrangeiro };
        });

        // Filtro por país
        if (selectedCountry) {
            // Para clientes estrangeiros, verificamos campos de endereço
            // Para clientes brasileiros, verificamos cidadeId e a cidade relacionada
            filtered = filtered.filter(customer => {
                if (customer.isEstrangeiro) {
                    // Buscar um país pelo ID no array de países, depois verificar se o cliente está nesse país
                    // Isso é simplificado pois não temos um campo direto de país no cliente estrangeiro
                    return customer.complemento?.includes(selectedCountry) || false;
                } else {
                    // Para clientes brasileiros, seria necessário ter o país na resposta
                    // Simplificando aqui, assumindo que todos clientes com cidadeId são do Brasil
                    const brasilId = countries.find(country => country.sigla === 'BR')?.id;
                    return selectedCountry === brasilId && !!customer.cidadeId;
                }
            });
        }
        
        // Filtro específico para clientes estrangeiros
        if (showEstrangeiros !== undefined) {
            filtered = filtered.filter(customer => customer.isEstrangeiro === showEstrangeiros);
        }

        // Filtro por texto
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                customer =>
                    customer.razaoSocial.toLowerCase().includes(searchLower) ||
                    (customer.nomeFantasia && customer.nomeFantasia.toLowerCase().includes(searchLower)) ||
                    customer.cnpjCpf.toLowerCase().includes(searchLower) ||
                    (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
                    (customer.cidadeNome && customer.cidadeNome.toLowerCase().includes(searchLower))
            );
        }
        
        setFilteredCustomers(filtered);
    }, [search, customers, selectedCountry, showEstrangeiros, countries]);

    const processCustomers = (data: Customer[]) => {
        return data.map(customer => {
            // Determinar se é estrangeiro pela ausência de cidadeId
            const isEstrangeiro = !customer.cidadeId;
            
            // Extrair tipo de documento da inscrição estadual se for estrangeiro
            let tipoDocumento = '';
            if (isEstrangeiro && customer.inscricaoEstadual) {
                const parts = customer.inscricaoEstadual.split(':');
                if (parts.length > 1) {
                    tipoDocumento = parts[0];
                }
            }
            
            return { 
                ...customer, 
                isEstrangeiro,
                tipoDocumento
            };
        });
    };

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await customerApi.getAll();
            const processedData = processCustomers(data);
            setCustomers(processedData);
            setFilteredCustomers(processedData);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            toast.error("Erro", {
                description: "Não foi possível carregar a lista de clientes"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const fetchCountries = async () => {
        try {
            const data = await countryApi.getAll();
            setCountries(data);
        } catch (error) {
            console.error('Erro ao buscar países:', error);
            toast.error("Erro", {
                description: "Não foi possível carregar a lista de países"
            });
        }
    };
    
    const handleCountryFilter = (value: string) => {
        setSelectedCountry(value);
    };
    
    const handleEstrangeiroFilter = (value: string) => {
        const isEstrangeiro = value === 'estrangeiro';
        setShowEstrangeiros(isEstrangeiro);
    };
    
    const clearFilters = () => {
        setSelectedCountry('');
        setShowEstrangeiros(false);
        setSearch('');
    };

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return;

        try {
            await customerApi.delete(customerToDelete.cnpjCpf);
            setCustomers(customers.filter(c => c.cnpjCpf !== customerToDelete.cnpjCpf));
            toast.success("Sucesso", {
                description: `Cliente ${customerToDelete.razaoSocial} removido com sucesso.`
            });
        } catch (error: any) {
            console.error('Erro ao excluir cliente:', error);
            toast.error("Erro", {
                description: error.message || "Não foi possível excluir o cliente. Verifique se não há referências."
            });
        } finally {
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
        }
    };

    const getCustomerTypeLabel = (tipo: 'F' | 'J') => {
        return tipo === 'F' ? 'Física' : 'Jurídica';
    };
    
    const formatTipoDocumento = (tipo?: string) => {
        if (!tipo) return 'Documento';
        
        switch (tipo) {
            case 'passport':
                return 'Passaporte';
            case 'tax_id':
                return 'ID Fiscal';
            case 'national_id':
                return 'ID Nacional';
            case 'other':
                return 'Outro Documento';
            default:
                return 'Documento';
        }
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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center py-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar clientes..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-1 gap-2 items-center flex-wrap">
                    <Select
                        value={selectedCountry}
                        onValueChange={handleCountryFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por país" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((country) => (
                                <SelectItem key={country.id} value={country.id}>
                                    {country.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Select
                        value={showEstrangeiros ? 'estrangeiro' : 'nacional'}
                        onValueChange={handleEstrangeiroFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tipo de cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nacional">Clientes Nacionais</SelectItem>
                            <SelectItem value="estrangeiro">Clientes Estrangeiros</SelectItem>
                        </SelectContent>
                    </Select>

                    {(selectedCountry || showEstrangeiros || search) && (
                        <Button variant="ghost" onClick={clearFilters} size="sm">
                            Limpar filtros
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Razão Social / Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>CNPJ/CPF/Documento</TableHead>
                            <TableHead>Cidade</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <Users className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">
                                            Nenhum cliente encontrado
                                        </p>
                                        <Button asChild variant="outline" className="mt-4">
                                            <Link to="/customers/new">
                                                <Plus className="mr-2 h-4 w-4" /> Cadastrar Cliente
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.cnpjCpf}>
                                    <TableCell className="font-medium">
                                        {customer.razaoSocial}
                                        {customer.nomeFantasia && (
                                            <div className="text-sm text-muted-foreground">
                                                {customer.nomeFantasia}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={customer.tipo === 'F' ? 'outline' : 'default'}>
                                            {getCustomerTypeLabel(customer.tipo)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {customer.isEstrangeiro ? (
                                            <div className="flex flex-col">
                                                <span>{formatTipoDocumento(customer.tipoDocumento)}</span>
                                                <span className="text-xs text-muted-foreground">{customer.cnpjCpf}</span>
                                            </div>
                                        ) : (
                                            customer.cnpjCpf
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {customer.cidadeNome}
                                        {customer.uf && (
                                            <span className="text-muted-foreground"> - {customer.uf}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {customer.email && (
                                            <div className="text-sm">{customer.email}</div>
                                        )}
                                        {customer.telefone && (
                                            <div className="text-sm text-muted-foreground">{customer.telefone}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={customer.ativo ? 'default' : 'outline'}
                                            className={customer.ativo ? 'bg-green-500' : ''}
                                        >
                                            {customer.ativo ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/customers/edit/${customer.cnpjCpf}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
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
                            Tem certeza que deseja excluir o cliente {customerToDelete?.razaoSocial}?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
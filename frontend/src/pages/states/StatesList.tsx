import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { stateApi, countryApi } from '@/services/api';
import { State, Country } from '@/types/location';
import { toast } from 'sonner';

const StatesList = () => {
    const [states, setStates] = useState<State[]>([]);
    const [filteredStates, setFilteredStates] = useState<State[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [stateToDelete, setStateToDelete] = useState<State | null>(null);

    useEffect(() => {
        fetchCountries();
        fetchStates();
    }, []);

    useEffect(() => {
        let filtered = states;

        if (selectedCountry) {
            filtered = filtered.filter(state => state.paisId === selectedCountry);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                state =>
                    state.nome.toLowerCase().includes(searchLower) ||
                    state.uf.toLowerCase().includes(searchLower) ||
                    (state.paisNome && state.paisNome.toLowerCase().includes(searchLower))
            );
        }

        setFilteredStates(filtered);
    }, [search, selectedCountry, states]);

    const fetchStates = async () => {
        setIsLoading(true);
        try {
            const data = await stateApi.getAll();
            setStates(data);
            setFilteredStates(data);
        } catch (error) {
            console.error('Erro ao buscar estados:', error);
            toast.error("Erro", {
                description: "Não foi possível carregar a lista de estados.",
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
                description: "Não foi possível carregar a lista de países.",
            });
        }
    };

    const handleDeleteClick = (state: State) => {
        setStateToDelete(state);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!stateToDelete) return;

        try {
            await stateApi.delete(stateToDelete.id);
            setStates(states.filter(s => s.id !== stateToDelete.id));
            toast.success("Sucesso", {
                description: `Estado ${stateToDelete.nome} removido com sucesso.`,
            });
        } catch (error: any) {
            console.error('Erro ao excluir estado:', error);
            toast.error("Erro", {
                description: error.message || "Não foi possível excluir o estado. Verifique se não há cidades vinculadas.",
            });
        } finally {
            setDeleteDialogOpen(false);
            setStateToDelete(null);
        }
    };

    const handleCountryFilter = (value: string) => {
        setSelectedCountry(value);
    };

    const clearFilters = () => {
        setSelectedCountry('');
        setSearch('');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Estados</h1>
                <Button asChild>
                    <Link to="/states/new">
                        <Plus className="mr-2 h-4 w-4" /> Novo Estado
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center py-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar estados..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-1 items-center gap-2">
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

                    {(selectedCountry || search) && (
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
                            <TableHead>Nome</TableHead>
                            <TableHead>UF</TableHead>
                            <TableHead>País</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : filteredStates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    Nenhum estado encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStates.map((state) => (
                                <TableRow key={state.id}>
                                    <TableCell className="font-medium">{state.nome}</TableCell>
                                    <TableCell>{state.uf}</TableCell>
                                    <TableCell>{state.paisNome}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/states/edit/${state.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteClick(state)}
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
                            Tem certeza que deseja excluir o estado {stateToDelete?.nome}?
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

export default StatesList;
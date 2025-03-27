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
import { countryApi } from '@/services/api';
import { Country } from '@/types/location';
import { toast } from 'sonner';

const CountriesList = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = countries.filter(
                country =>
                    country.nome.toLowerCase().includes(search.toLowerCase()) ||
                    country.sigla.toLowerCase().includes(search.toLowerCase()) ||
                    country.codigo.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredCountries(filtered);
        } else {
            setFilteredCountries(countries);
        }
    }, [search, countries]);

    const fetchCountries = async () => {
        setIsLoading(true);
        try {
            const data = await countryApi.getAll();
            setCountries(data);
            setFilteredCountries(data);
        } catch (error) {
            console.error('Erro ao buscar países:', error);
            toast.error("Erro", {
                description: "Não foi possível carregar a lista de países.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (country: Country) => {
        setCountryToDelete(country);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!countryToDelete) return;

        try {
            await countryApi.delete(countryToDelete.id);
            setCountries(countries.filter(c => c.id !== countryToDelete.id));
            toast.success("Sucesso", {
                description: `País ${countryToDelete.nome} removido com sucesso.`,
            });
        } catch (error: any) {
            console.error('Erro ao excluir país:', error);
            toast.error("Erro", {
                description: error.message || "Não foi possível excluir o país. Verifique se não há estados vinculados.",
            });
        } finally {
            setDeleteDialogOpen(false);
            setCountryToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Países</h1>
                <Button asChild>
                    <Link to="/countries/new">
                        <Plus className="mr-2 h-4 w-4" /> Novo País
                    </Link>
                </Button>
            </div>

            <div className="flex items-center py-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar países..."
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
                            <TableHead>Sigla</TableHead>
                            <TableHead>Código</TableHead>
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
                        ) : filteredCountries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    Nenhum país encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCountries.map((country) => (
                                <TableRow key={country.id}>
                                    <TableCell className="font-medium">{country.nome}</TableCell>
                                    <TableCell>{country.sigla}</TableCell>
                                    <TableCell>{country.codigo}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/countries/edit/${country.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteClick(country)}
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
                            Tem certeza que deseja excluir o país {countryToDelete?.nome}?
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

export default CountriesList;
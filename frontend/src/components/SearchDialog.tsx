// src/components/SearchDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type KeyFunction<T> = (item: T) => string;

type DisplayColumn<T> = {
  key: keyof T | KeyFunction<T>;
  header: string;
};

interface SearchDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entities: T[];
  isLoading: boolean;
  onSelect: (entity: T) => void;
  onCreateNew: () => void;
  displayColumns: DisplayColumn<T>[];
  searchKeys: Array<keyof T>;
}

export function SearchDialog<T>({
  open,
  onOpenChange,
  title,
  entities,
  isLoading,
  onSelect,
  onCreateNew,
  displayColumns,
  searchKeys,
}: SearchDialogProps<T>) {
  const [search, setSearch] = useState('');
  const [filteredEntities, setFilteredEntities] = useState<T[]>(entities);

  useEffect(() => {
    setFilteredEntities(entities);
  }, [entities]);

  useEffect(() => {
    if (!search) {
      setFilteredEntities(entities);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = entities.filter((entity) =>
      searchKeys.some((key) => {
        const value = entity[key];
        return value && String(value).toLowerCase().includes(searchLower);
      }),
    );
    setFilteredEntities(filtered);
  }, [search, entities, searchKeys]);

  useEffect(() => {
    if (open) {
      setSearch('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Novo
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {displayColumns.map((column, index) => (
                  <TableHead key={index}>{column.header}</TableHead>
                ))}
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + 1}
                    className="text-center"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredEntities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + 1}
                    className="text-center"
                  >
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntities.map((entity, index) => (
                  <TableRow key={index}>
                    {displayColumns.map((column, colIndex) => {
                      let cellContent;
                      if (typeof column.key === 'function') {
                        cellContent = column.key(entity);
                      } else {
                        cellContent = entity[column.key]
                          ? String(entity[column.key])
                          : '-';
                      }
                      return (
                        <TableCell key={colIndex}>{cellContent}</TableCell>
                      );
                    })}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelect(entity)}
                      >
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

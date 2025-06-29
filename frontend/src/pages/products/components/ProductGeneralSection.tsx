import { Search, Tag, Package, Ruler } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { UseFormReturn } from 'react-hook-form';
import { Category } from '../../../types/category';
import { Brand } from '../../../types/brand';
import { UnitMeasure } from '../../../types/unit-measure';

interface ProductGeneralSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedCategory: Category | null;
  selectedBrand: Brand | null;
  selectedUnitMeasure: UnitMeasure | null;
  setCategorySearchOpen: (open: boolean) => void;
  setBrandSearchOpen: (open: boolean) => void;
  setUnitMeasureSearchOpen: (open: boolean) => void;
}

const ProductGeneralSection = ({
  form,
  isLoading,
  selectedCategory,
  selectedBrand,
  selectedUnitMeasure,
  setCategorySearchOpen,
  setBrandSearchOpen,
  setUnitMeasureSearchOpen,
}: ProductGeneralSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-lg font-semibold text-foreground">Dados Gerais</h4>
        <div className="flex-1 h-px bg-border"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Código do produto"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do produto"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="codigoBarras"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Barras</FormLabel>
              <FormControl>
                <Input
                  placeholder="Código de barras"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoriaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria *</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <div className="relative flex-grow">
                      <Input
                        value={selectedCategory?.nome || ''}
                        readOnly
                        placeholder="Selecione uma categoria"
                        className="cursor-pointer h-10 text-base pl-9"
                        onClick={() => setCategorySearchOpen(true)}
                      />
                      <input
                        type="hidden"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      />
                      <Tag className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCategorySearchOpen(true)}
                      className="h-10 w-10"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
              </div>
              {selectedCategory && (
                <div className="mt-1">
                  <Badge variant="outline">
                    {selectedCategory.nome}
                  </Badge>
                </div>
              )}
              {field.value && !selectedCategory && (
                <div className="mt-1">
                  <Badge variant="outline" className="bg-yellow-50">
                    Categoria selecionada mas dados não carregados. ID: {field.value}
                  </Badge>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="marcaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <div className="relative flex-grow">
                      <Input
                        value={selectedBrand?.nome || ''}
                        readOnly
                        placeholder="Selecione uma marca (opcional)"
                        className="cursor-pointer h-10 text-base pl-9"
                        onClick={() => setBrandSearchOpen(true)}
                      />
                      <input
                        type="hidden"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      />
                      <Package className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setBrandSearchOpen(true)}
                      className="h-10 w-10"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
              </div>
              {selectedBrand && (
                <div className="mt-1">
                  <Badge variant="outline">
                    {selectedBrand.nome}
                  </Badge>
                </div>
              )}
              {field.value && !selectedBrand && (
                <div className="mt-1">
                  <Badge variant="outline" className="bg-yellow-50">
                    Marca selecionada mas dados não carregados. ID: {field.value}
                  </Badge>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unidadeMedidaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade de Medida *</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <div className="relative flex-grow">
                      <Input
                        value={selectedUnitMeasure ? `${selectedUnitMeasure.nome} (${selectedUnitMeasure.sigla})` : ''}
                        readOnly
                        placeholder="Selecione uma unidade de medida"
                        className="cursor-pointer h-10 text-base pl-9"
                        onClick={() => setUnitMeasureSearchOpen(true)}
                      />
                      <input
                        type="hidden"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      />
                      <Ruler className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setUnitMeasureSearchOpen(true)}
                      className="h-10 w-10"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
              </div>
              {selectedUnitMeasure && (
                <div className="mt-1">
                  <Badge variant="outline">
                    {selectedUnitMeasure.nome} ({selectedUnitMeasure.sigla})
                  </Badge>
                </div>
              )}
              {field.value && !selectedUnitMeasure && (
                <div className="mt-1">
                  <Badge variant="outline" className="bg-yellow-50">
                    Unidade selecionada mas dados não carregados. ID: {field.value}
                  </Badge>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="descricao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descrição do produto"
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProductGeneralSection;

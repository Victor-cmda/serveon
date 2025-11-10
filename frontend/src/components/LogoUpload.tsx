import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LogoUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  label?: string;
  maxSize?: number; // em MB
  aspectRatio?: string;
}

export const LogoUpload = ({
  value,
  onChange,
  label = 'Logo',
  maxSize = 2,
  aspectRatio = '1/1',
}: LogoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validar tamanho
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`A imagem deve ter no máximo ${maxSize}MB`);
      return;
    }

    // Converter para Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
      toast.success('Logo carregado com sucesso!');
    };
    reader.onerror = () => {
      toast.error('Erro ao carregar imagem');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange('');
    toast.success('Logo removido');
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}

      {/* Preview da imagem */}
      {value ? (
        <div className="relative w-64 h-64 border-2 border-border rounded-lg overflow-hidden bg-muted">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-contain p-4"
            style={{ aspectRatio }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 shadow-lg"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        /* Área de drop */
        <div
          className={`
            relative w-64 h-64 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center gap-3
            cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleSelectClick}
        >
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
          <div className="text-center px-4">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? 'Solte a imagem aqui' : 'Clique ou arraste'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF (máx. {maxSize}MB)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectClick();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo
          </Button>
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};

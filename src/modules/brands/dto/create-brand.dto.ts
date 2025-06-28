import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Nome da marca',
    example: 'Dell',
  })
  @IsNotEmpty({ message: 'Nome da marca é obrigatório' })
  @IsString({ message: 'Nome da marca deve ser uma string' })
  @MaxLength(100, {
    message: 'Nome da marca deve ter no máximo 100 caracteres',
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição da marca',
    example: 'Marca de equipamentos de informática',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @ApiProperty({
    description: 'Status da marca (ativo/inativo)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Status ativo deve ser um valor booleano' })
  ativo?: boolean = true;
}

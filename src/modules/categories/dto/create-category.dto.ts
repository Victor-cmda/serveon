import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Informática'
  })
  @IsNotEmpty({ message: 'Nome da categoria é obrigatório' })
  @IsString({ message: 'Nome da categoria deve ser uma string' })
  @MaxLength(100, { message: 'Nome da categoria deve ter no máximo 100 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Descrição da categoria',
    example: 'Produtos de informática e tecnologia',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @ApiProperty({
    description: 'Status da categoria (ativo/inativo)',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Status ativo deve ser um valor booleano' })
  ativo?: boolean = true;
}

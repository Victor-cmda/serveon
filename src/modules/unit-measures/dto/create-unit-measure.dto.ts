import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitMeasureDto {
  @ApiProperty({
    description: 'Nome da unidade de medida',
    example: 'Unidade',
  })
  @IsNotEmpty({ message: 'Nome da unidade de medida é obrigatório' })
  @IsString({ message: 'Nome da unidade de medida deve ser uma string' })
  @MaxLength(50, {
    message: 'Nome da unidade de medida deve ter no máximo 50 caracteres',
  })
  nome: string;

  @ApiProperty({
    description: 'Sigla da unidade de medida',
    example: 'UN',
  })
  @IsNotEmpty({ message: 'Sigla da unidade de medida é obrigatória' })
  @IsString({ message: 'Sigla da unidade de medida deve ser uma string' })
  @MaxLength(6, {
    message: 'Sigla da unidade de medida deve ter no máximo 6 caracteres',
  })
  sigla: string;

  @ApiProperty({
    description: 'Status da unidade de medida (ativo/inativo)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Status ativo deve ser um valor booleano' })
  ativo?: boolean = true;
}

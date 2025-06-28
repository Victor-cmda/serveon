import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({
    description: 'Nome do país',
    example: 'Brasil',
  })
  @IsNotEmpty({ message: 'Nome do país é obrigatório' })
  @IsString({ message: 'Nome do país deve ser uma string' })
  @MaxLength(60, { message: 'Nome do país deve ter no máximo 60 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Código de chamada internacional do país',
    example: '55',
  })
  @IsNotEmpty({ message: 'Código do país é obrigatório' })
  @IsString({ message: 'Código do país deve ser uma string' })
  @Length(1, 3, { message: 'Código do país deve ter entre 1 e 3 caracteres' })
  @Matches(/^[0-9]+$/, { message: 'Código do país deve conter apenas números' })
  codigo: string;

  @ApiProperty({
    description: 'Sigla do país (2 caracteres)',
    example: 'BR',
  })
  @IsNotEmpty({ message: 'Sigla do país é obrigatória' })
  @IsString({ message: 'Sigla do país deve ser uma string' })
  @Length(2, 2, { message: 'Sigla do país deve ter exatamente 2 caracteres' })
  @Matches(/^[A-Z]+$/, {
    message: 'Sigla do país deve conter apenas letras maiúsculas',
  })
  sigla: string;
}

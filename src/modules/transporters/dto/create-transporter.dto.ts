import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsNumber,
  MaxLength, 
  Matches 
} from 'class-validator';

export class CreateTransporterDto {
  @ApiProperty({
    description: 'CNPJ da transportadora',
    example: '12345678000195',
  })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Matches(/^[0-9]{14}$/, { message: 'CNPJ deve conter exatamente 14 dígitos numéricos' })
  cnpj: string;

  @ApiProperty({
    description: 'Nome da transportadora',
    example: 'Transportes Rápidos Ltda',
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Nome fantasia da transportadora',
    example: 'Rápidos Express',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  @MaxLength(100, { message: 'Nome fantasia deve ter no máximo 100 caracteres' })
  nomeFantasia?: string;

  @ApiProperty({
    description: 'ID do país',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do país deve ser um número válido' })
  paisId?: number;

  @ApiProperty({
    description: 'ID do estado',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do estado deve ser um número válido' })
  estadoId?: number;

  @ApiProperty({
    description: 'ID da cidade',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da cidade deve ser um número válido' })
  cidadeId?: number;

  @ApiProperty({
    description: 'Endereço da transportadora',
    example: 'Av. das Transportadoras, 123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @MaxLength(100, { message: 'Endereço deve ter no máximo 100 caracteres' })
  endereco?: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Número deve ser uma string' })
  @MaxLength(10, { message: 'Número deve ter no máximo 10 caracteres' })
  numero?: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Galpão 5',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @MaxLength(50, { message: 'Complemento deve ter no máximo 50 caracteres' })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Distrito Industrial',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  @MaxLength(50, { message: 'Bairro deve ter no máximo 50 caracteres' })
  bairro?: string;

  @ApiProperty({
    description: 'CEP',
    example: '12345-678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  @MaxLength(10, { message: 'CEP deve ter no máximo 10 caracteres' })
  cep?: string;

  @ApiProperty({
    description: 'Website da transportadora',
    example: 'https://www.rapidosexpress.com.br',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Website deve ser uma string' })
  @MaxLength(100, { message: 'Website deve ter no máximo 100 caracteres' })
  website?: string;

  @ApiProperty({
    description: 'Observações sobre a transportadora',
    example: 'Especializada em cargas frágeis',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;
}

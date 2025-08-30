import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  Matches,
  MaxLength,
  IsBoolean,
  IsNumber,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nome completo do funcionário',
    example: 'João da Silva',
  })
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'CPF do funcionário (apenas números)',
    example: '12345678901',
  })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @Matches(/^[0-9]{11}$/, {
    message: 'CPF deve conter exatamente 11 dígitos numéricos',
  })
  cpf: string;

  @ApiProperty({
    description: 'Email profissional do funcionário',
    example: 'joao.silva@empresa.com',
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '11987654321',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;

  @ApiProperty({
    description: 'Telefone celular',
    example: '11999887766',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Celular deve ser uma string' })
  @MaxLength(20, { message: 'Celular deve ter no máximo 20 caracteres' })
  celular?: string;

  @ApiProperty({
    description: 'RG do funcionário',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'RG deve ser uma string' })
  @MaxLength(20, { message: 'RG deve ter no máximo 20 caracteres' })
  rg?: string;

  @ApiProperty({
    description: 'Órgão emissor do RG',
    example: 'SSP/SP',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Órgão emissor deve ser uma string' })
  @MaxLength(20, { message: 'Órgão emissor deve ter no máximo 20 caracteres' })
  orgaoEmissor?: string;

  @ApiProperty({
    description: 'ID da cidade onde o RG foi emitido',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da cidade do RG deve ser um número' })
  rgCidadeId?: number;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '1990-05-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de nascimento deve ser uma data válida' })
  dataNascimento?: Date;

  @ApiProperty({
    description: 'Estado civil',
    example: 'Solteiro',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Estado civil deve ser uma string' })
  @MaxLength(20, { message: 'Estado civil deve ter no máximo 20 caracteres' })
  estadoCivil?: string;

  @ApiProperty({
    description: 'Nacionalidade',
    example: 'BRASILEIRA',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nacionalidade deve ser uma string' })
  @MaxLength(30, { message: 'Nacionalidade deve ter no máximo 30 caracteres' })
  nacionalidade?: string;

  @ApiProperty({
    description: 'ID da nacionalidade',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da nacionalidade deve ser um número' })
  nacionalidadeId?: number;

  // Campos de Endereço
  @ApiProperty({
    description: 'CEP',
    example: '01234567',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  @MaxLength(10, { message: 'CEP deve ter no máximo 10 caracteres' })
  cep?: string;

  @ApiProperty({
    description: 'Endereço',
    example: 'Rua das Flores',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @MaxLength(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
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
    example: 'Apto 45',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @MaxLength(100, { message: 'Complemento deve ter no máximo 100 caracteres' })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  @MaxLength(100, { message: 'Bairro deve ter no máximo 100 caracteres' })
  bairro?: string;

  @ApiProperty({
    description: 'ID da cidade do funcionário',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da cidade deve ser um número' })
  cidadeId?: number;

  @ApiProperty({
    description: 'ID do cargo do funcionário',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do cargo deve ser um número' })
  cargoId?: number;

  @ApiProperty({
    description: 'ID do departamento do funcionário',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do departamento deve ser um número' })
  departamentoId?: number;

  @ApiProperty({
    description: 'ID da função do funcionário',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da função deve ser um número' })
  funcaoFuncionarioId?: number;

  @ApiProperty({
    description: 'Data de admissão no formato YYYY-MM-DD',
    example: '2023-01-15',
  })
  @IsNotEmpty({ message: 'Data de admissão é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de admissão deve ser uma data válida' })
  dataAdmissao: Date;

  @ApiProperty({
    description: 'Salário do funcionário',
    example: 5000.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Salário deve ser um número com no máximo 2 casas decimais' })
  salario?: number;

  @ApiProperty({
    description: 'Observações sobre o funcionário',
    example: 'Funcionário exemplar',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;

  @ApiProperty({
    description: 'Status ativo/inativo do funcionário',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Status ativo deve ser um valor booleano' })
  ativo?: boolean = true;
}

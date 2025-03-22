import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'CNPJ ou CPF do cliente (apenas números)',
    example: '12345678901234',
  })
  @IsNotEmpty({ message: 'CNPJ/CPF é obrigatório' })
  @Matches(/^[0-9]+$/, { message: 'CNPJ/CPF deve conter apenas números' })
  @MaxLength(14, { message: 'CNPJ/CPF deve ter no máximo 14 caracteres' })
  cnpjCpf: string;

  @ApiProperty({
    description: 'Tipo de cliente: F para Pessoa Física, J para Pessoa Jurídica',
    example: 'J',
    enum: ['F', 'J']
  })
  @IsNotEmpty({ message: 'Tipo de cliente é obrigatório' })
  @IsEnum(['F', 'J'], { message: 'Tipo deve ser F (Física) ou J (Jurídica)' })
  tipo: 'F' | 'J';

  @ApiProperty({
    description: 'Razão Social ou Nome Completo',
    example: 'Empresa XYZ Ltda',
  })
  @IsNotEmpty({ message: 'Razão Social é obrigatória' })
  @IsString({ message: 'Razão Social deve ser uma string' })
  @MaxLength(100, { message: 'Razão Social deve ter no máximo 100 caracteres' })
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome Fantasia (opcional)',
    example: 'XYZ Tecnologia',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Nome Fantasia deve ser uma string' })
  @MaxLength(60, { message: 'Nome Fantasia deve ter no máximo 60 caracteres' })
  nomeFantasia?: string;

  @ApiProperty({
    description: 'Inscrição Estadual (opcional)',
    example: '123456789',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Inscrição Estadual deve ser uma string' })
  @MaxLength(20, { message: 'Inscrição Estadual deve ter no máximo 20 caracteres' })
  inscricaoEstadual?: string;

  @ApiProperty({
    description: 'Inscrição Municipal (opcional)',
    example: '123456',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Inscrição Municipal deve ser uma string' })
  @MaxLength(20, { message: 'Inscrição Municipal deve ter no máximo 20 caracteres' })
  inscricaoMunicipal?: string;

  @ApiProperty({
    description: 'Endereço (opcional)',
    example: 'Av. Brasil',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @MaxLength(100, { message: 'Endereço deve ter no máximo 100 caracteres' })
  endereco?: string;

  @ApiProperty({
    description: 'Número do endereço (opcional)',
    example: '123',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Número deve ser uma string' })
  @MaxLength(10, { message: 'Número deve ter no máximo 10 caracteres' })
  numero?: string;

  @ApiProperty({
    description: 'Complemento do endereço (opcional)',
    example: 'Sala 101',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @MaxLength(60, { message: 'Complemento deve ter no máximo 60 caracteres' })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro (opcional)',
    example: 'Centro',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  @MaxLength(50, { message: 'Bairro deve ter no máximo 50 caracteres' })
  bairro?: string;

  @ApiProperty({
    description: 'ID da cidade no sistema (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsNotEmpty({ message: 'ID da cidade é obrigatório' })
  @IsUUID(4, { message: 'ID da cidade deve ser um UUID válido' })
  cidadeId: string;  // Changed from number to string for UUID

  @ApiProperty({
    description: 'CEP (opcional)',
    example: '12345678',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  @MaxLength(10, { message: 'CEP deve ter no máximo 10 caracteres' })
  cep?: string;

  @ApiProperty({
    description: 'Telefone (opcional)',
    example: '11987654321',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;

  @ApiProperty({
    description: 'Email (opcional)',
    example: 'contato@empresa.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email?: string;

  @ApiProperty({
    description: 'Status ativo/inativo do cliente',
    example: true,
    default: true
  })
  @IsOptional()
  ativo?: boolean = true;
}
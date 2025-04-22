import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, ValidateIf, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'CNPJ, CPF ou número de documento internacional do cliente',
    example: '12345678901234',
  })
  @IsNotEmpty({ message: 'Documento de identificação é obrigatório' })
  @MaxLength(20, { message: 'Documento deve ter no máximo 20 caracteres' })
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
    description: 'Indica se é um cliente estrangeiro',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: 'isEstrangeiro deve ser um valor booleano' })
  isEstrangeiro?: boolean = false;
  
  @ApiProperty({
    description: 'Tipo de documento para clientes estrangeiros',
    example: 'passport',
    enum: ['passport', 'tax_id', 'national_id', 'other'],
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Tipo de documento deve ser uma string' })
  tipoDocumento?: string;

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
    description: 'Inscrição Estadual ou dados adicionais do documento estrangeiro',
    example: '123456789',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Inscrição Estadual deve ser uma string' })
  @MaxLength(50, { message: 'Inscrição Estadual deve ter no máximo 50 caracteres' })
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
    description: 'ID do país (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false
  })
  @IsOptional()
  @IsUUID(4, { message: 'ID do país deve ser um UUID válido' })
  paisId?: string;
  
  @ApiProperty({
    description: 'ID do estado/província (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false
  })
  @IsOptional()
  @IsUUID(4, { message: 'ID do estado deve ser um UUID válido' })
  estadoId?: string;

  @ApiProperty({
    description: 'ID da cidade no sistema (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false
  })
  @IsOptional()
  @IsUUID(4, { message: 'ID da cidade deve ser um UUID válido' })
  cidadeId?: string;

  @ApiProperty({
    description: 'Endereço',
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
    description: 'CEP ou Código Postal',
    example: '12345678',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  @MaxLength(15, { message: 'CEP deve ter no máximo 15 caracteres' })
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
  @IsBoolean({ message: 'ativo deve ser um valor booleano' })
  ativo?: boolean = true;
  
  @ApiProperty({
    description: 'Se o cliente também é um destinatário',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'isDestinatario deve ser um valor booleano' })
  isDestinatario?: boolean = true;
  
  @ApiProperty({
    description: 'Lista de IDs de destinatários associados (quando o cliente não é o destinatário)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'destinatariosIds deve ser um array' })
  @IsUUID(4, { each: true, message: 'Cada ID de destinatário deve ser um UUID válido' })
  destinatariosIds?: string[];
}
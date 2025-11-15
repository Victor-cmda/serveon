import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'CNPJ, CPF ou número de documento internacional do fornecedor',
    example: '12345678901234',
  })
  @IsNotEmpty({ message: 'Documento de identificação é obrigatório' })
  @MaxLength(20, { message: 'Documento deve ter no máximo 20 caracteres' })
  cnpjCpf: string;

  @ApiProperty({
    description:
      'Tipo de fornecedor: F para Pessoa Física, J para Pessoa Jurídica',
    example: 'J',
    enum: ['F', 'J'],
  })
  @IsNotEmpty({ message: 'Tipo de fornecedor é obrigatório' })
  @IsEnum(['F', 'J'], { message: 'Tipo deve ser F (Física) ou J (Jurídica)' })
  tipo: 'F' | 'J';

  @ApiProperty({
    description: 'Indica se é um fornecedor estrangeiro',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isEstrangeiro deve ser um valor booleano' })
  isEstrangeiro?: boolean = false;

  @ApiProperty({
    description: 'Tipo de documento para fornecedores estrangeiros',
    example: 'passport',
    enum: ['passport', 'tax_id', 'national_id', 'other'],
    required: false,
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
    description: 'Nome Fantasia',
    example: 'XYZ Tecnologia',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome Fantasia deve ser uma string' })
  @MaxLength(100, {
    message: 'Nome Fantasia deve ter no máximo 100 caracteres',
  })
  nomeFantasia?: string;

  @ApiProperty({
    description:
      'Inscrição Estadual ou informações complementares do documento',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Inscrição Estadual deve ser uma string' })
  @MaxLength(20, {
    message: 'Inscrição Estadual deve ter no máximo 20 caracteres',
  })
  inscricaoEstadual?: string;

  @ApiProperty({
    description: 'ID do estado/província',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do estado deve ser um número válido' })
  estadoId?: number;

  @ApiProperty({
    description: 'Endereço',
    example: 'Av. Brasil',
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
    example: 'Sala 101',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @MaxLength(50, { message: 'Complemento deve ter no máximo 50 caracteres' })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  @MaxLength(50, { message: 'Bairro deve ter no máximo 50 caracteres' })
  bairro?: string;
  @ApiProperty({
    description: 'ID da cidade',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da cidade deve ser um número válido' })
  cidadeId?: number;

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
    description: 'Telefone',
    example: '(11) 1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;

  @ApiProperty({
    description: 'Email',
    example: 'contato@empresa.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser um endereço de email válido' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email?: string;
  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
    required: true,
  })
  @IsNotEmpty({ message: 'Condição de pagamento é obrigatória' })
  @IsNumber(
    {},
    { message: 'ID da condição de pagamento deve ser um número válido' },
  )
  condicaoPagamentoId: number;

  @ApiProperty({
    description: 'Website do fornecedor',
    example: 'https://www.empresa.com',
    required: false,
  })
  @IsOptional()
  @MaxLength(100, { message: 'Website deve ter no máximo 100 caracteres' })
  website?: string;

  @ApiProperty({
    description: 'Observações sobre o fornecedor',
    example: 'Fornecedor preferencial para materiais de escritório',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;

  @ApiProperty({
    description: 'Nome do responsável pelo contato',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome do responsável deve ser uma string' })
  @MaxLength(100, {
    message: 'Nome do responsável deve ter no máximo 100 caracteres',
  })
  responsavel?: string;

  @ApiProperty({
    description: 'Celular do responsável',
    example: '(11) 98765-4321',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Celular do responsável deve ser uma string' })
  @MaxLength(20, {
    message: 'Celular do responsável deve ter no máximo 20 caracteres',
  })
  celularResponsavel?: string;

  @ApiProperty({
    description: 'Limite de crédito do fornecedor',
    example: 10000.00,
    default: 0.00,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limite de crédito deve ser um número válido' })
  @Type(() => Number)
  limiteCredito?: number;

  @ApiProperty({
    description: 'ID da nacionalidade (país)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da nacionalidade deve ser um número válido' })
  nacionalidadeId?: number;

  @ApiProperty({
    description: 'ID da transportadora',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da transportadora deve ser um número válido' })
  transportadoraId?: number;
}

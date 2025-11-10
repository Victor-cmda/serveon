import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { RegimeTributario } from '../entities/company-settings.entity';

export class CreateCompanySettingsDto {
  @ApiProperty({
    description: 'Razão Social da empresa',
    example: 'ServeOn Tecnologia Ltda',
  })
  @IsString()
  @IsNotEmpty()
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome Fantasia da empresa',
    example: 'ServeOn',
  })
  @IsString()
  @IsNotEmpty()
  nomeFantasia: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '12.345.678/0001-90',
  })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({
    description: 'Inscrição Estadual',
    example: '123.456.789.012',
    required: false,
  })
  @IsString()
  @IsOptional()
  inscricaoEstadual?: string;

  @ApiProperty({
    description: 'Inscrição Municipal',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  inscricaoMunicipal?: string;

  @ApiProperty({
    description: 'Endereço da empresa',
    example: 'Rua das Flores',
  })
  @IsString()
  @IsNotEmpty()
  endereco: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Sala 301',
    required: false,
  })
  @IsString()
  @IsOptional()
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
  })
  @IsString()
  @IsNotEmpty()
  bairro: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
  })
  @IsString()
  @IsNotEmpty()
  cidade: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SP',
  })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({
    description: 'CEP',
    example: '01234-567',
  })
  @IsString()
  @IsNotEmpty()
  cep: string;

  @ApiProperty({
    description: 'Telefone',
    example: '(11) 1234-5678',
  })
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({
    description: 'E-mail',
    example: 'contato@serveon.com.br',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Website',
    example: 'www.serveon.com.br',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Logo da empresa em Base64',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    required: false,
  })
  @IsString()
  @IsOptional()
  logoBase64?: string;

  @ApiProperty({
    description: 'Regime Tributário',
    enum: RegimeTributario,
    example: RegimeTributario.SIMPLES_NACIONAL,
  })
  @IsEnum(RegimeTributario)
  @IsNotEmpty()
  regimeTributario: RegimeTributario;

  @ApiProperty({
    description: 'Observações fiscais para documentos',
    example: 'Documento emitido por ME ou EPP optante pelo Simples Nacional',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacoesFiscais?: string;
}

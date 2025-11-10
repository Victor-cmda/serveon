import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum RegimeTributario {
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  LUCRO_PRESUMIDO = 'LUCRO_PRESUMIDO',
  LUCRO_REAL = 'LUCRO_REAL',
}

export class CompanySettings extends BaseEntity {
  @ApiProperty({
    description: 'Razão Social da empresa',
    example: 'ServeOn Tecnologia Ltda',
  })
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome Fantasia da empresa',
    example: 'ServeOn',
  })
  nomeFantasia: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '12.345.678/0001-90',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Inscrição Estadual',
    example: '123.456.789.012',
    required: false,
  })
  inscricaoEstadual?: string;

  @ApiProperty({
    description: 'Inscrição Municipal',
    example: '123456',
    required: false,
  })
  inscricaoMunicipal?: string;

  @ApiProperty({
    description: 'Endereço da empresa',
    example: 'Rua das Flores',
  })
  endereco: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  numero: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Sala 301',
    required: false,
  })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
  })
  bairro: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
  })
  cidade: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SP',
  })
  estado: string;

  @ApiProperty({
    description: 'CEP',
    example: '01234-567',
  })
  cep: string;

  @ApiProperty({
    description: 'Telefone',
    example: '(11) 1234-5678',
  })
  telefone: string;

  @ApiProperty({
    description: 'E-mail',
    example: 'contato@serveon.com.br',
  })
  email: string;

  @ApiProperty({
    description: 'Website',
    example: 'www.serveon.com.br',
    required: false,
  })
  website?: string;

  @ApiProperty({
    description: 'Logo da empresa em Base64',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    required: false,
  })
  logoBase64?: string;

  @ApiProperty({
    description: 'Regime Tributário',
    enum: RegimeTributario,
    example: RegimeTributario.SIMPLES_NACIONAL,
  })
  regimeTributario: RegimeTributario;

  @ApiProperty({
    description: 'Observações fiscais para documentos',
    example: 'Documento emitido por ME ou EPP optante pelo Simples Nacional',
    required: false,
  })
  observacoesFiscais?: string;
}

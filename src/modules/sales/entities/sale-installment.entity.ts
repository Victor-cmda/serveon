import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class SaleInstallment extends BaseEntity {
  @ApiProperty({
    description: 'ID da venda',
    example: 1,
  })
  vendaId: number;

  @ApiProperty({
    description: 'Número da parcela',
    example: 1,
  })
  parcela: number;

  @ApiProperty({
    description: 'Código da forma de pagamento',
    example: 'DIN',
  })
  codigoFormaPagto: string;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
  })
  formaPagamentoId: number;

  @ApiProperty({
    description: 'Nome da forma de pagamento',
    example: 'Dinheiro',
  })
  formaPagamento: string;

  @ApiProperty({
    description: 'Data de vencimento da parcela',
    example: '2024-02-15',
  })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Valor da parcela',
    example: 720.00,
  })
  valorParcela: number;
}

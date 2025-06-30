import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PaymentTermInstallment } from './payment-term-installment.entity';

export class PaymentTerm extends BaseEntity {
  @ApiProperty({
    description: 'Nome da condição de pagamento',
    example: 'À Vista',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição da condição de pagamento',
    example: 'Pagamento à vista com desconto',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Taxa de juros mensal (%)',
    example: 1.5,
  })
  interestRate: number;

  @ApiProperty({
    description: 'Taxa de multa por atraso (%)',
    example: 2.0,
  })
  fineRate: number;

  @ApiProperty({
    description: 'Percentual de desconto (%)',
    example: 5.0,
  })
  discountPercentage: number;

  @ApiProperty({
    description: 'Parcelas da condição de pagamento',
    type: () => [PaymentTermInstallment],
  })
  installments: PaymentTermInstallment[];
}

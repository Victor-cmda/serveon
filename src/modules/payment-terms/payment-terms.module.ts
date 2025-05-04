import { Module } from '@nestjs/common';
import { PaymentTermsService } from './services/payment-terms.service';
import { PaymentTermsController } from './controllers/payment-terms.controller';

@Module({
  controllers: [PaymentTermsController],
  providers: [PaymentTermsService],
})
export class PaymentTermsModule {}

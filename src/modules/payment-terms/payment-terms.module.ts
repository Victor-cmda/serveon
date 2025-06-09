import { Module } from '@nestjs/common';
import { PaymentTermsService } from './services/payment-terms.service';
import { PaymentTermsController } from './controllers/payment-terms.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentTermsController],
  providers: [PaymentTermsService],
})
export class PaymentTermsModule {}

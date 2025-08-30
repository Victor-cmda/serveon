import { Module } from '@nestjs/common';
import { PurchasesService } from './services/purchases.service';
import { PurchasesController } from './controller/purchases.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}

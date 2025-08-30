import { Module } from '@nestjs/common';
import { SalesService } from './services/sales.service';
import { SalesController } from './controller/sales.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}

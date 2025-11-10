import { Module } from '@nestjs/common';
import { AccountsPayableController } from './controllers/accounts-payable.controller';
import { AccountsPayableService } from './services/accounts-payable.service';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountsPayableController],
  providers: [AccountsPayableService],
  exports: [AccountsPayableService],
})
export class AccountsPayableModule {}

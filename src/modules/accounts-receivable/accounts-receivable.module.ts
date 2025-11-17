import { Module } from '@nestjs/common';
import { AccountsReceivableController } from './controllers/accounts-receivable.controller';
import { AccountsReceivableService } from './services/accounts-receivable.service';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountsReceivableController],
  providers: [AccountsReceivableService],
  exports: [AccountsReceivableService],
})
export class AccountsReceivableModule {}

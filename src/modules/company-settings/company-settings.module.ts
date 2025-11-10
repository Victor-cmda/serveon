import { Module } from '@nestjs/common';
import { CompanySettingsService } from './services/company-settings.service';
import { CompanySettingsController } from './controllers/company-settings.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanySettingsController],
  providers: [CompanySettingsService],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {}

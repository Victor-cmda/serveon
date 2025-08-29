import { Module } from '@nestjs/common';
import { EmployeeFunctionsService } from './employee-functions.service';
import { EmployeeFunctionsController } from './employee-functions.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeFunctionsController],
  providers: [EmployeeFunctionsService],
  exports: [EmployeeFunctionsService],
})
export class EmployeeFunctionsModule {}

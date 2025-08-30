import { Module } from '@nestjs/common';
import { EmployeeFunctionsService } from './services/employee-functions.service';
import { EmployeeFunctionsController } from './controller/employee-functions.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeFunctionsController],
  providers: [EmployeeFunctionsService],
  exports: [EmployeeFunctionsService],
})
export class EmployeeFunctionsModule {}

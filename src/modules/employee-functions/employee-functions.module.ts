import { Module } from '@nestjs/common';
import { EmployeeFunctionsService } from './employee-functions.service';
import { EmployeeFunctionsController } from './employee-functions.controller';

@Module({
  controllers: [EmployeeFunctionsController],
  providers: [EmployeeFunctionsService],
  exports: [EmployeeFunctionsService],
})
export class EmployeeFunctionsModule {}

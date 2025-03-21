import { Module } from '@nestjs/common';
import { EmployeesService } from './services/employees.service';
import { EmployeesController } from './controllers/employees.controller';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}

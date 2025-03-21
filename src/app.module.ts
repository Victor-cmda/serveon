import { Module } from '@nestjs/common';
import { EmployeesModule } from './modules/employees/employees.module';
import { CustomersModule } from './modules/customers/customers.module';

@Module({
  imports: [EmployeesModule, CustomersModule],
})
export class AppModule {}

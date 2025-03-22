import { Module } from '@nestjs/common';
import { EmployeesService } from './services/employees.service';
import { EmployeesController } from './controllers/employees.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
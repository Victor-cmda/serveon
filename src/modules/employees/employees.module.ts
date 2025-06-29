import { Module } from '@nestjs/common';
import { EmployeesService } from './services/employees.service';
import { EmployeesController } from './controllers/employees.controller';
import { DatabaseModule } from '../../common/database/database.module';
import { DepartmentsModule } from '../departments/departments.module';
import { PositionsModule } from '../positions/positions.module';
import { CitiesModule } from '../cities/cities.module';

@Module({
  imports: [DatabaseModule, DepartmentsModule, PositionsModule, CitiesModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}

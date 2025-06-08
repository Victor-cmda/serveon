import { Module } from '@nestjs/common';
import { DepartmentsService } from './services/departments.service';
import { DepartmentsController } from './controllers/departments.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}

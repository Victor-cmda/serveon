import { Module } from '@nestjs/common';
import { UnitMeasuresService } from './services/unit-measures.service';
import { UnitMeasuresController } from './controllers/unit-measures.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UnitMeasuresController],
  providers: [UnitMeasuresService],
  exports: [UnitMeasuresService],
})
export class UnitMeasuresModule {}

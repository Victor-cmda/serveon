import { Module } from '@nestjs/common';
import { PositionsService } from './services/positions.service';
import { PositionsController } from './controllers/positions.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}

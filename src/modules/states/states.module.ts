import { Module } from '@nestjs/common';
import { StatesService } from './services/states.service';
import { StatesController } from './controllers/states.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StatesController],
  providers: [StatesService],
  exports: [StatesService],
})
export class StatesModule { }
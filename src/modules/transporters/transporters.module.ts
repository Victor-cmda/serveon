import { Module } from '@nestjs/common';
import { TransportersService } from './services/transporters.service';
import { TransportersController } from './controller/transporters.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TransportersController],
  providers: [TransportersService],
  exports: [TransportersService],
})
export class TransportersModule {}

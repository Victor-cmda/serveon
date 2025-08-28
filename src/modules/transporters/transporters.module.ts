import { Module } from '@nestjs/common';
import { TransportersService } from './transporters.service';
import { TransportersController } from './transporters.controller';

@Module({
  controllers: [TransportersController],
  providers: [TransportersService],
  exports: [TransportersService],
})
export class TransportersModule {}

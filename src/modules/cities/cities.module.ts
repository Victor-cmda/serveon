import { Module } from '@nestjs/common';
import { CitiesService } from './services/cities/cities.service';
import { CitiesController } from './controllers/cities/cities.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}

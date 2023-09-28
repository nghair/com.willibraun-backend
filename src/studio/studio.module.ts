import { Module } from '@nestjs/common';
import { StudioService } from './studio.service';
import { StudioController } from './studio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Studio } from './entities/studio.entity';
import { Locations } from './entities/locations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Studio, Locations])],
  controllers: [StudioController],
  providers: [StudioService],
})
export class StudioModule {}

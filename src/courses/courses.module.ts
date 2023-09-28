import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseType } from './entities/courseType.entity';
import { CourseSeries } from './entities/courseSeries.entity';
import { Course } from './entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseType, CourseSeries, Course])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}

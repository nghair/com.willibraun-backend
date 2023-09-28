import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseType } from './courseType.entity';
import { Studio } from 'src/studio/entities/studio.entity';
import { User } from 'src/auth/entities/user.entity';
import { Locations } from 'src/studio/entities/locations.entity';

@Entity()
export class CourseSeries {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CourseType)
  @JoinColumn()
  courseType: CourseType;

  @ManyToMany(() => User)
  @JoinColumn()
  trainer: User;

  @ManyToMany(() => Locations)
  @JoinColumn()
  location: Locations;

  @ManyToMany(() => Studio)
  @JoinColumn()
  studio: Studio;

  @Column({ nullable: false })
  duration: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'text' })
  comment: string;
}

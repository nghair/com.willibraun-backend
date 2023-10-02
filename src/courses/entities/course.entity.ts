import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseSeries } from './courseSeries.entity';
import { User } from 'src/auth/entities/user.entity';
import { Locations } from 'src/studio/entities/locations.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CourseSeries)
  @JoinColumn()
  courseSeries: CourseSeries;

  @ManyToMany(() => User)
  @JoinColumn()
  trainer: User;

  @ManyToMany(() => Locations)
  @JoinColumn()
  location: Locations;

  @Column({ nullable: false })
  duration: number;

  @Column({ nullable: false })
  courseDateTime: Date;

  @Column({ type: 'text' })
  comment: string;
}

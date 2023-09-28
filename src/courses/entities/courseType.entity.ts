import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CourseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: false, unique: true })
  color: string;
}

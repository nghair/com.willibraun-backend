import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Studio } from './studio.entity';

@Entity()
export class Locations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Studio, (Studio) => Studio.locations)
  studio: Studio;

  @Column()
  name: string;

  @Column()
  address: string;

  constructor(location: Partial<Locations>) {
    Object.assign(this, location);
  }
}

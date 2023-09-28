import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Locations } from './locations.entity';

@Entity()
export class Studio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Locations, (location) => location.studio)
  locations: Locations[];

  constructor(studio: Partial<Studio>) {
    Object.assign(this, studio);
  }
}

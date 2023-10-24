import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //User Info
  @Column()
  @Index({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  @Index({ unique: true })
  email: string;

  //User agreements

  @Column({ default: false })
  agb_agreement: boolean;

  @Column({ default: true })
  newsletter_agreement: boolean;

  @Column({ default: true })
  waitinglist_email_agreement: boolean;

  //Table row Date

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  //User account info

  //@Column({ default: true })
  //is_active: boolean;

  //@Column({ default: false })
  //is_admin: boolean;

  @Column()
  role: Role;

  @Column({ default: false })
  is_trainer: boolean;

  @Column({ nullable: true, type: 'longtext' })
  hashedRt: string;

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}

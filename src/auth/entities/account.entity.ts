import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  @Index({ unique: true })
  email: string;

  @CreateDateColumn()
  created_at: Date;

  //@Column({ type: 'nvarchar', length: 100, unique: true })
  //hashedToken: string;

  @Column()
  expiryDate: Date;

  constructor(account: Partial<Account>) {
    Object.assign(this, account);
  }
}

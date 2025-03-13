// src/entities/user.entity.ts
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from './user-role.entity';
import { Order } from 'src/order/entities/order.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 128 })
  name: string;

  @Column({
    length: 128,
    unique: true,
  })
  email: string;

  @Column({ length: 128 })
  password: string;

  @Column({
    length: 255,
    nullable: true,
  })
  avatar: string;

  @Column({
    length: 128,
    nullable: true,
  })
  street: string;

  @Column({
    length: 64,
    nullable: true,
  })
  city: string;

  @Column({
    length: 64,
    nullable: true,
  })
  state: string;

  @Column({
    length: 20,
    nullable: true,
  })
  zipCode: string;

  @Column({
    length: 64,
    nullable: true,
  })
  country: string;

  @Column({
    type: 'int',
    default: 0,
  })
  points: number;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastLogin: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  // Methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}

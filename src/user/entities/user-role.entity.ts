// src/entities/user-role.entity.ts
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
@Index('user_roles_id', ['userId', 'roleId'])
export class UserRole {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column({ unsigned: true })
  roleId: number;

  // Relations
  @ManyToOne(() => User, (user) => user.userRoles, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @BeforeInsert()
  @BeforeUpdate()
  beforeInsertOrUpdate() {
    if (this.user) {
      this.userId = this.user.id;
    }
    if (this.role) {
      this.roleId = this.role.id;
    }
  }
}

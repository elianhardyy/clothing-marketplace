import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Role | null> {
    return this.findOne({ where: { name } });
  }
}

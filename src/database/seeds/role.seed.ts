import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/user/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleSeeder {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}
  async seed() {
    const roles = [
      {
        name: 'MERCHANT',
      },
      {
        name: 'CUSTOMER',
      },
    ];
    for (const role of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: role.name },
      });
      if (!existingRole) {
        const newRole = this.roleRepository.create(role);
        await this.roleRepository.save(newRole);
        console.log(`Role "${role.name}" created successfully`);
      } else {
        console.log(`Role "${role.name}" already exists, skipping`);
      }
    }
  }
}

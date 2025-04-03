import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello() {
    // console.log('Seed db');
    // await this.categorySeeder.seed();
    console.log('seed successfully');
  }
}

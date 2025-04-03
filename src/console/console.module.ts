import { Module } from '@nestjs/common';
import { SeedModule } from '../database/seeds/seed.module';
import { SeedCommand } from './commands/seed.command';

@Module({
  imports: [SeedModule],
  providers: [SeedCommand],
})
export class ConsoleModule {}

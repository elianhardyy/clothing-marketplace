import { Command, CommandRunner } from 'nest-commander';
import { SeedService } from 'src/database/services/category.service.seed';

@Command({ name: 'seed', description: 'Seed the database with initial data' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly seedService: SeedService) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.seedService.seed();
    } catch (error) {
      console.error('Command execution failed:', error);
      process.exit(1);
    }
  }
}

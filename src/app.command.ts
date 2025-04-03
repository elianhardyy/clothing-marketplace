import { Command, CommandRunner } from 'nest-commander';
import { AppService } from './app.service';

@Command({ name: 'seed', description: 'seed the database' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly seedService: AppService) {
    super();
  }
  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.seedService.getHello();
      console.log('seeding completed');
    } catch (error) {
      console.error('seeding failed', error);
    } finally {
      process.exit(0);
    }
  }
}

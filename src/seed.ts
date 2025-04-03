import { NestFactory } from '@nestjs/core';
import { SeedModule } from './database/seeds/seed.module';
import { SeedService } from './database/seeds/services/category.service.seed';
import { AppModule } from './app.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedService = appContext.get(SeedService);
    await seedService.seed();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await appContext.close();
    process.exit(0);
  }
}

bootstrap();

import { Module } from '@nestjs/common';
import { ModuleReleasesService } from './module-releases.service';
import { ModuleReleasesController } from './module-releases.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ModuleReleasesController],
  providers: [ModuleReleasesService, PrismaService],
  exports: [ModuleReleasesService],
})
export class ModuleReleasesModule {}

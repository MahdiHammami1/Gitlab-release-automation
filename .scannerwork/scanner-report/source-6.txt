import { Module } from '@nestjs/common';
import { ArtefactsService } from './artefacts.service';
import { ArtefactsController } from './artefacts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ArtefactsController],
  providers: [ArtefactsService, PrismaService],
  exports: [ArtefactsService],
})
export class ArtefactsModule {}

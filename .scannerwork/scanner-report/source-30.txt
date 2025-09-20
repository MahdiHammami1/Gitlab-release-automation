import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';

@Module({
  imports: [HttpModule],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}

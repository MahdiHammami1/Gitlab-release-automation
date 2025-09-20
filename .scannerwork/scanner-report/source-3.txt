import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import {AuthModule} from "./auth/auth.module";
import { HttpModule } from '@nestjs/axios';
import { GitlabModule } from './gitlab/gitlab.module';
import {ReleasesModule} from "./releases/releases.module";
import {TagsModule} from "./tags/tags.module";
import {ModuleReleasesModule} from "./module-releases/module-releases.module";
import { ArtefactsModule } from './artefacts/artefacts.module';
import {ModulesModule} from "./modules/modules.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    GitlabModule,

    PrismaModule,

    UsersModule,
    AuthModule,
    ReleasesModule,
    TagsModule,
    ModuleReleasesModule,
    ArtefactsModule,
    ModulesModule


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

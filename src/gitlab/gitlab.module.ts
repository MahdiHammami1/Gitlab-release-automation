// src/gitlab/gitlab.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';
import * as https from 'https';
import * as fs from 'fs';
import * as tls from 'tls';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => {
        const allowInsecure = process.env.ALLOW_INSECURE_SSL === 'true';
        const caPath = process.env.CORP_CA_PATH;

        if (allowInsecure) {
          return {
            timeout: 10000,
            maxRedirects: 5,
            proxy: false,
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          };
        }

        const extra = caPath && fs.existsSync(caPath) ? fs.readFileSync(caPath, 'utf8') : null;

        const sysCAs = Array.from(tls.rootCertificates); // <- mutable
        const caBundle: (string | Buffer)[] = extra ? [...sysCAs, extra] : sysCAs;

        return {
          timeout: 10000,
          maxRedirects: 5,
          proxy: false,
          httpsAgent: new https.Agent({
            rejectUnauthorized: true,
            ca: caBundle, // <- types OK maintenant
          }),
        };
      },
    }),
  ],
  providers: [GitlabService],
  controllers: [GitlabController],
})
export class GitlabModule {}

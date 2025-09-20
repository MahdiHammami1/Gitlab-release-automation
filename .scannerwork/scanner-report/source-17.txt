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
        const baseURL = process.env.GITLAB_API || 'https://gitlab.com/api/v4';

        if (allowInsecure) {
          return {
            baseURL,
            timeout: 10000,
            maxRedirects: 5,
            proxy: false,
            headers: { Accept: 'application/json' },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          };
        }

        const extra = caPath && fs.existsSync(caPath) ? fs.readFileSync(caPath, 'utf8') : null;
        // tls.rootCertificates est readonly → on clone dans un tableau JS
        const sysCAs = Array.from(tls.rootCertificates);
        const caBundle: (string | Buffer)[] = extra ? [...sysCAs, extra] : sysCAs;

        return {
          baseURL,
          timeout: 10000,
          maxRedirects: 5,
          proxy: false,
          headers: { Accept: 'application/json' },
          httpsAgent: new https.Agent({
            rejectUnauthorized: true,
            ca: caBundle,
          }),
        };
      },
    }),
  ],
  providers: [GitlabService],
  controllers: [GitlabController],
})
export class GitlabModule {}

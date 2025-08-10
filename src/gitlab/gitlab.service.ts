import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GitlabService {
  private readonly base = process.env.GITLAB_API || 'https://gitlab.com/api/v4';

  constructor(private http: HttpService) {
    if (!process.env.GITLAB_PAT) {
      throw new BadRequestException('GITLAB_PAT missing in .env');
    }
  }

  private bearer(token?: string) {
    const t = (token ?? process.env.GITLAB_PAT ?? '').trim();
    return { Authorization: `Bearer ${t}` };
  }

  private privateToken(token?: string) {
    const t = (token ?? process.env.GITLAB_PAT ?? '').trim();
    return { 'PRIVATE-TOKEN': t };
  }

  private async get<T = any>(url: string, headers: Record<string, string>, params?: Record<string, any>) {
    try {
      const { data } = await firstValueFrom(this.http.get<T>(url, { headers, params }));
      return data;
    } catch (e: any) {
      const status = e?.response?.status;
      const body   = e?.response?.data ?? e?.message ?? 'GitLab proxy error';

      // Fallback: si Bearer échoue en 401, reteste avec PRIVATE-TOKEN
      const triedBearer = !!headers.Authorization;
      if (status === 401 && triedBearer) {
        try {
          const token = headers.Authorization.replace(/^Bearer\s+/i, '');
          const { data } = await firstValueFrom(this.http.get<T>(url, { headers: this.privateToken(token), params }));
          return data;
        } catch (e2: any) {
          console.error('GitLab retry (PRIVATE-TOKEN) →', e2?.response?.status, e2?.response?.data || e2?.message);
          throw new HttpException(e2?.response?.data || 'GitLab auth failed', e2?.response?.status ?? 401);
        }
      }

      console.error('GitLab proxy error →', status ?? e?.code ?? 500, body);
      throw new HttpException(body, status ?? 500);
    }
  }

  me() { return this.get(`${this.base}/user`, this.bearer()); }

  myProjects() {
    return this.get(`${this.base}/projects`, this.bearer(), {
      membership: true, simple: true, order_by: 'last_activity_at', per_page: 50,
    });
  }

  project(id: number) { return this.get(`${this.base}/projects/${id}`, this.bearer()); }

  issues(id: number) {
    return this.get(`${this.base}/projects/${id}/issues`, this.bearer(), { state: 'opened', per_page: 50 });
  }

  pipelines(id: number) {
    return this.get(`${this.base}/projects/${id}/pipelines`, this.bearer(), { per_page: 20, order_by: 'updated_at' });
  }

  pipelineJobs(id: number, pipelineId: number) {
    return this.get(`${this.base}/projects/${id}/pipelines/${pipelineId}/jobs`, this.bearer());
  }

  mergeRequests(id: number) {
    return this.get(`${this.base}/projects/${id}/merge_requests`, this.bearer(), { state: 'opened', per_page: 50 });
  }
}

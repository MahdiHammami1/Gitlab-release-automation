import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

type Dict = Record<string, any>;

function cleanParams(p?: Dict): Dict | undefined {
  if (!p) return undefined;
  const out: Dict = {};
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = typeof v === 'boolean' ? String(v) : v;
  }
  return out;
}

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}

@Injectable()
export class GitlabService {
  // si le HttpModule a baseURL, on peut n'envoyer que les chemins.
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

  private async request<T = any>(
    method: 'GET'|'POST'|'PUT'|'DELETE',
    url: string,
    { params, headers, responseType }: { params?: Dict; headers?: Dict; responseType?: AxiosRequestConfig['responseType'] } = {}
  ): Promise<T> {
    const cfg: AxiosRequestConfig = {
      method,
      url,
      params: cleanParams(params),
      headers,
      responseType,
    };

    try {
      const { data } = await firstValueFrom(this.http.request<T>(cfg));
      return data;
    } catch (e: any) {
      const status = e?.response?.status;
      const body   = e?.response?.data ?? e?.message ?? 'GitLab proxy error';

      // Fallback 401 → PRIVATE-TOKEN si on avait tenté Bearer
      const triedBearer = !!headers?.Authorization;
      if (status === 401 && triedBearer) {
        try {
          const token = (headers.Authorization as string).replace(/^Bearer\s+/i, '');
          const { data } = await firstValueFrom(this.http.request<T>({ ...cfg, headers: this.privateToken(token) }));
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

  private get<T = any>(path: string, params?: Dict, token?: string) {
    return this.request<T>('GET', `${this.base}${path}`, { params, headers: this.bearer(token) });
  }

  private getRawText(path: string, params?: Dict, token?: string) {
    return this.request<string>('GET', `${this.base}${path}`, { params, headers: this.bearer(token), responseType: 'text' });
  }

  // -------- Profil & projets --------
  me() {
    return this.get('/user');
  }

  myProjects(params: {
    search?: string; membership?: string; visibility?: 'public'|'internal'|'private';
    page?: number; per_page?: number; order_by?: string; sort?: 'asc'|'desc';
    simple?: boolean;
  } = { membership: 'true', simple: true, order_by: 'last_activity_at', per_page: 50 }) {
    return this.get('/projects', { simple: true, order_by: 'last_activity_at', per_page: 50, ...params });
  }

  // Deux variantes : par ID numérique ou par chemin namespace/projet (url-encodé)
  project(idOrPath: string) {
    if (isNumericId(idOrPath)) return this.get(`/projects/${idOrPath}`);
    return this.projectByPath(idOrPath);
  }

  projectByPath(path: string) {
    return this.get(`/projects/${encodeURIComponent(path)}`);
  }

  // -------- Issues / MRs / Pipelines --------
  issues(id: string | number, params: Dict = { state: 'opened', per_page: 50 }) {
    return this.get(`/projects/${id}/issues`, params);
  }

  mergeRequests(id: string | number, params: Dict = { state: 'opened', per_page: 50 }) {
    return this.get(`/projects/${id}/merge_requests`, params);
  }

  pipelines(id: string | number, params: Dict = { per_page: 20, order_by: 'updated_at' }) {
    return this.get(`/projects/${id}/pipelines`, params);
  }

  pipeline(id: string | number, pipelineId: string | number) {
    return this.get(`/projects/${id}/pipelines/${pipelineId}`);
  }

  pipelineJobs(id: string | number, pipelineId: string | number) {
    return this.get(`/projects/${id}/pipelines/${pipelineId}/jobs`);
  }

  // -------- MVP Analyse: branches / tags / releases / compare / tree / files --------
  branches(id: string | number, params: Dict = { per_page: 100, page: 1 }) {
    return this.get(`/projects/${id}/repository/branches`, params);
  }

  tags(id: string | number, params: Dict = { per_page: 100, page: 1 }) {
    return this.get(`/projects/${id}/repository/tags`, params);
  }

  releases(id: string | number, params: Dict = { per_page: 20, page: 1, order_by: 'released_at', sort: 'desc' }) {
    return this.get(`/projects/${id}/releases`, params);
  }

  compare(id: string | number, params: { from: string; to: string; straight?: boolean }) {
    return this.get(`/projects/${id}/repository/compare`, params);
  }

  tree(id: string | number, params: Dict = { path: '', per_page: 100, page: 1, recursive: false }) {
    return this.get(`/projects/${id}/repository/tree`, params);
  }

  // Métadonnées + contenu base64 (GitLab renvoie JSON avec content base64)
  file(id: string | number, filePath: string, ref = 'main') {
    const p = `/projects/${id}/repository/files/${encodeURIComponent(filePath)}`;
    return this.get(p, { ref });
  }

  // Contenu brut (utile pour release.config.json)
  fileRaw(id: string | number, filePath: string, ref = 'main') {
    const p = `/projects/${id}/repository/files/${encodeURIComponent(filePath)}/raw`;
    return this.getRawText(p, { ref });
  }

  // Raccourci pratique
  releaseConfig(id: string | number, ref = 'main') {
    return this.fileRaw(id, 'release.config.json', ref);
  }

  // --- Lister les modules depuis release-config.ts d'un projet ---
  async listModulesFromReleaseConfig(id: string) {
    const tryFiles = [
      { name: 'release-config.ts', ref: 'main' },
      { name: 'release.config.json', ref: 'main' },
      { name: 'release-config.ts', ref: 'master' },
      { name: 'release.config.json', ref: 'master' },
    ];
    for (const fileInfo of tryFiles) {
      try {
        const file = await this.file(id, fileInfo.name, fileInfo.ref);
        const content = Buffer.from(file.content, 'base64').toString('utf-8');
        const json = JSON.parse(content);
        if (json.modules && Array.isArray(json.modules)) {
          return { modules: json.modules, file: fileInfo.name, branch: fileInfo.ref };
        }
      } catch (e) {
        // On continue sur le prochain fichier/branche
      }
    }
    return { error: 'Aucun fichier release-config.ts ou release.config.json trouvé à la racine de main/master, ou pas de modules.' };
  }

  /**
   * Retourne la liste des tags d'un projet GitLab
   */
  async getTags(id: string) {
    const url = isNumericId(id)
      ? `${this.base}/projects/${id}/repository/tags`
      : `${this.base}/projects/${encodeURIComponent(id)}/repository/tags`;
    return this.request('GET', url, { headers: this.bearer() });
  }

  /**
   * Retourne un tag précis d'un projet GitLab
   */
  async getTagByName(id: string, tagName: string) {
    const url = isNumericId(id)
      ? `${this.base}/projects/${id}/repository/tags/${encodeURIComponent(tagName)}`
      : `${this.base}/projects/${encodeURIComponent(id)}/repository/tags/${encodeURIComponent(tagName)}`;
    return this.request('GET', url, { headers: this.bearer() });
  }
}

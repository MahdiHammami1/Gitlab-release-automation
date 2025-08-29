import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { promisify } from 'util';
import { exec } from 'child_process';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';



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
const execAsync = promisify(exec);

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
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    {
      params,
      headers,
      responseType,
    }: {
      params?: Dict;
      headers?: Dict;
      responseType?: AxiosRequestConfig['responseType'];
    } = {},
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
      const body = e?.response?.data ?? e?.message ?? 'GitLab proxy error';

      // Fallback 401 → PRIVATE-TOKEN si on avait tenté Bearer
      const triedBearer = !!headers?.Authorization;
      if (status === 401 && triedBearer) {
        try {
          const token = (headers.Authorization as string).replace(
            /^Bearer\s+/i,
            '',
          );
          const { data } = await firstValueFrom(
            this.http.request<T>({ ...cfg, headers: this.privateToken(token) }),
          );
          return data;
        } catch (e2: any) {
          console.error(
            'GitLab retry (PRIVATE-TOKEN) →',
            e2?.response?.status,
            e2?.response?.data || e2?.message,
          );
          throw new HttpException(
            e2?.response?.data || 'GitLab auth failed',
            e2?.response?.status ?? 401,
          );
        }
      }

      console.error('GitLab proxy error →', status ?? e?.code ?? 500, body);
      throw new HttpException(body, status ?? 500);
    }
  }

  // Rendre la méthode get accessible publiquement pour le contrôleur
  public get<T = any>(path: string, params?: Dict, token?: string) {
    return this.request<T>('GET', `${this.base}${path}`, {
      params,
      headers: this.bearer(token),
    });
  }

  public post<T = any>(path: string, body?: Dict, token?: string) {
    return this.request<T>('POST', `${this.base}${path}`, {
      headers: this.bearer(token),
      params: undefined,
      responseType: undefined,
      ...(body ? { data: body } : {}),
    });
  }

  private getRawText(path: string, params?: Dict, token?: string) {
    return this.request<string>('GET', `${this.base}${path}`, {
      params,
      headers: this.bearer(token),
      responseType: 'text',
    });
  }

  // -------- Profil & projets --------
  me() {
    return this.get('/user');
  }

  myProjects(
    params: {
      search?: string;
      membership?: string;
      visibility?: 'public' | 'internal' | 'private';
      page?: number;
      per_page?: number;
      order_by?: string;
      sort?: 'asc' | 'desc';
      simple?: boolean;
    } = {
      membership: 'true',
      simple: true,
      order_by: 'last_activity_at',
      per_page: 50,
    },
  ) {
    return this.get('/projects', {
      simple: true,
      order_by: 'last_activity_at',
      per_page: 50,
      ...params,
    });
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
  issues(
    id: string | number,
    params: Dict = { state: 'opened', per_page: 50 },
  ) {
    return this.get(`/projects/${id}/issues`, params);
  }

  mergeRequests(
    id: string | number,
    params: Dict = { state: 'opened', per_page: 50 },
  ) {
    return this.get(`/projects/${id}/merge_requests`, params);
  }

  pipelines(
    id: string | number,
    params: Dict = { per_page: 20, order_by: 'updated_at' },
  ) {
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

  releases(
    id: string | number,
    params: Dict = {
      per_page: 20,
      page: 1,
      order_by: 'released_at',
      sort: 'desc',
    },
  ) {
    return this.get(`/projects/${id}/releases`, params);
  }

  compare(
    id: string | number,
    params: { from: string; to: string; straight?: boolean },
  ) {
    return this.get(`/projects/${id}/repository/compare`, params);
  }

  tree(
    id: string | number,
    params: Dict = { path: '', per_page: 100, page: 1, recursive: false },
  ) {
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
          return {
            modules: json.modules,
            file: fileInfo.name,
            branch: fileInfo.ref,
          };
        }
      } catch (e) {
        // On continue sur le prochain fichier/branche
      }
    }
    return {
      error:
        'Aucun fichier release-config.ts ou release.config.json trouvé à la racine de main/master, ou pas de modules.',
    };
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

  /**
   * Retourne la liste des commits depuis la date du dernier release global
   * @param id id du projet GitLab
   */
  async commitsSinceLastRelease(id: string) {
    // Récupérer la date du dernier release global depuis l'API locale
    const releasesResp = await axios.get('http://localhost:3000/releases');
    const releases = releasesResp.data;
    if (!Array.isArray(releases) || releases.length === 0) return [];
    // On prend le release le plus récent (createdAt max)
    const lastRelease = releases.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
    const sinceDate = new Date(lastRelease.createdAt);
    // Récupérer tous les commits du repo (pagination)
    let allCommits: any[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const commits = await this.get(`/projects/${id}/repository/commits`, { per_page: 100, page });
      if (Array.isArray(commits) && commits.length > 0) {
        allCommits = allCommits.concat(commits);
        page++;
        hasMore = commits.length === 100;
      } else {
        hasMore = false;
      }
    }
    // Filtrer les commits dont la date est STRICTEMENT supérieure à la date du dernier release
    return allCommits.filter((c: any) => new Date(c.committed_date) > sinceDate);
  }

  async getProject(projectId: string): Promise<any> {
    const res = await axios.get(`http://localhost:3000/gitlab/projects/${projectId}`);
    return res.data;
  }


  async prepareRepo(projectId: string): Promise<string> {
    const project = await this.getProject(projectId);
    const repoUrl = project.http_url_to_repo; // Utilisation de l'URL HTTPS
    const repoDir = path.join('C:', 'Users', 'mhammami2', 'Desktop', 'Gitlab Release', 'repos', projectId.replace('/', '_'));

    if (!fs.existsSync(repoDir)) {
      await execAsync(`git clone ${repoUrl} "${repoDir}"`);
    } else {
      await execAsync(`cd "${repoDir}" && git fetch origin`);
    }

    return repoDir;
  }



  // Met à jour main avec une branche donnée
  async updateMainFromBranch(projectId: string, branch: string): Promise<string> {
    try {
      const repoPath = await this.prepareRepo(projectId);
      const project = await this.getProject(projectId);
      const mainBranch = project.default_branch || 'main';

      if (branch === mainBranch) {
        throw new Error('Impossible de merger la branche principale sur elle-même.');
      }

      await execAsync(`cd ${repoPath} && git checkout ${mainBranch} && git pull origin ${mainBranch}`);
      await execAsync(`cd ${repoPath} && git merge origin/${branch}`);
      await execAsync(`cd ${repoPath} && git push origin ${mainBranch}`);

      return `✔ Projet ${projectId} → branche ${mainBranch} mise à jour avec ${branch}`;
    } catch (err: any) {
      throw new Error(`❌ Erreur Git: ${err.message}`);
    }
  }

  async createMergeRequestsForUnmergedBranches(id: string | number) {
    // Récupérer toutes les branches
    const branches = await this.get(`/projects/${id}/repository/branches`);
    const mainBranch = 'main';
    for (const branch of branches) {
      if (branch.name === mainBranch) continue;
      // Comparer la branche avec main
      const compare = await this.get(`/projects/${id}/repository/compare`, {
        from: branch.name,
        to: mainBranch,
      });
      // S'il y a des commits non fusionnés
      if (compare.commits && compare.commits.length > 0) {
        // Créer une merge request
        await this.post(`/projects/${id}/merge_requests`, {
          source_branch: branch.name,
          target_branch: mainBranch,
          title: `Merge ${branch.name} into ${mainBranch}`,
        });
      }
    }
  }

}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { GitlabService } from './gitlab.service';

@Controller('gitlab')
export class GitlabController {
  constructor(private svc: GitlabService) {}

  @Get('_debug')
  debug() {
    const pat = process.env.GITLAB_PAT || '';
    return {
      api: process.env.GITLAB_API || 'https://gitlab.com/api/v4',
      pat_masked: pat ? pat.slice(0,6)+'…'+pat.slice(-4) : null,
      node_options: process.env.NODE_OPTIONS || null,
      no_proxy: process.env.NO_PROXY || null,
    };
  }

  // --- Profil & projets (avec query utiles) ---
  @Get('me')
  me() { return this.svc.me(); }

  @Get('projects')
  projects(
      @Query('search') search?: string,
      @Query('membership') membership: string = 'true', // pour n'afficher que mes projets
      @Query('visibility') visibility?: 'public'|'internal'|'private',
      @Query('page') page: number = 1,
      @Query('per_page') perPage: number = 50,
      @Query('order_by') orderBy: string = 'last_activity_at',
      @Query('sort') sort: 'asc'|'desc' = 'desc',
  ) {
    return this.svc.myProjects({ search, membership, visibility, page, per_page: perPage, order_by: orderBy, sort });
  }

  // IMPORTANT: deux variantes pour éviter les collisions:
  // - par ID numérique
  @Get('projects/:id')
  projectById(@Param('id') id: string) { return this.svc.project(id); }

  // - par chemin (namespace/projet) URL-encodable
  @Get('projects/by-path/*path')
  projectByPath(@Param('path') path: string) { return this.svc.projectByPath(path); }

  // --- Issues / MRs / Pipelines (avec filtres & pagination) ---
  @Get('projects/:id/issues')
  issues(
      @Param('id') id: string,
      @Query('state') state: 'opened'|'closed'|'all' = 'all',
      @Query('page') page: number = 1,
      @Query('per_page') perPage: number = 50,
  ) {
    return this.svc.issues(id, { state, page, per_page: perPage });
  }

  @Get('projects/:id/mrs')
  mrs(
      @Param('id') id: string,
      @Query('state') state: 'opened'|'merged'|'closed'|'all' = 'all',
      @Query('page') page: number = 1,
      @Query('per_page') perPage: number = 50,
  ) {
    return this.svc.mergeRequests(id, { state, page, per_page: perPage });
  }

  @Get('projects/:id/pipelines')
  pipelines(
      @Param('id') id: string,
      @Query('page') page: number = 1,
      @Query('per_page') perPage: number = 50,
      @Query('status') status?: string,
  ) {
    return this.svc.pipelines(id, { page, per_page: perPage, status });
  }

  @Get('projects/:id/pipelines/:pid')
  pipeline(@Param('id') id: string, @Param('pid') pid: string) {
    return this.svc.pipeline(id, pid);
  }

  @Get('projects/:id/pipelines/:pid/jobs')
  jobs(@Param('id') id: string, @Param('pid') pid: string) {
    return this.svc.pipelineJobs(id, pid);
  }

  // --- MVP "Analyse" pour Release Wizard ---
  @Get('projects/:id/repository/branches')
  branches(
      @Param('id') id: string,
      @Query('page') page: number = 1,
      @Query('per_page') perPage: number = 100,
      @Query('search') search?: string,
  ) {
    return this.svc.branches(id, { page, per_page: perPage, search });
  }

  @Get('projects/:id/repository/tags')
  async getTags(@Param('id') id: string) {
    return this.svc.getTags(id);
  }

  @Get('projects/:id/repository/tags/:tagName')
  async getTagByName(@Param('id') id: string, @Param('tagName') tagName: string) {
    return this.svc.getTagByName(id, tagName);
  }

  @Get('projects/:id/releases')
  releases(
      @Param('id') id: string,
      @Query('page') page: number = 1,
      @Query('per_page') perPage: number = 20,
      @Query('order_by') orderBy: 'released_at'|'created_at' = 'released_at',
      @Query('sort') sort: 'asc'|'desc' = 'desc',
  ) {
    return this.svc.releases(id, { page, per_page: perPage, order_by: orderBy, sort });
  }

  @Get('projects/:id/repository/compare')
  compare(
      @Param('id') id: string,
      @Query('from') from: string,
      @Query('to') to: string,
      @Query('straight') straight?: boolean, // option GitLab si tu veux
  ) {
    return this.svc.compare(id, { from, to, straight });
  }

  @Get('projects/:id/repository/tree')
  tree(
      @Param('id') id: string,
      @Query('path') path = '',
      @Query('page') page: number = 1,
      @Query('per_page') perPage: number = 100,
      @Query('recursive') recursive: boolean = false,
  ) {
    return this.svc.tree(id, { path, page, per_page: perPage, recursive });
  }

  // Lecture de fichier (JSON/Base64) et RAW (utile pour release.config.json)
  @Get('projects/:id/repository/files/*filePath')
  fileMeta(
      @Param('id') id: string,
      @Param('filePath') filePath: string,
      @Query('ref') ref: string = 'main',
  ) {
    return this.svc.file(id, filePath, ref); // renvoie metadata + content base64
  }

  @Get('projects/:id/repository/files/*filePath/raw')
  fileRaw(
      @Param('id') id: string,
      @Param('filePath') filePath: string,
      @Query('ref') ref: string = 'main',
  ) {
    return this.svc.fileRaw(id, filePath, ref); // stream/texte brut
  }

  // Raccourci pratique pour release.config.json
  @Get('projects/:id/release-config')
  releaseConfig(@Param('id') id: string, @Query('ref') ref: string = 'main') {
    return this.svc.fileRaw(id, 'release.config.json', ref);
  }

  // Nouvelle route : Commits depuis le dernier release
  @Get('projects/:id/commits/since-last-release')
  async commitsSinceLastRelease(
    @Param('id') id: string
  ) {
    return this.svc.commitsSinceLastRelease(id);
  }

  // Nouvelle route : lister tous les commits d'un projet (aucun filtre)
  @Get('projects/:id/commits')
  async getAllCommits(
    @Param('id') id: string
  ) {
    return this.svc.get(`/projects/${id}/repository/commits`);
  }

}

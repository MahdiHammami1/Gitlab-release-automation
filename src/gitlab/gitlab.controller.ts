import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
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

  @Get('me') me() { return this.svc.me(); }
  @Get('projects') projects() { return this.svc.myProjects(); }
  @Get('projects/:id') project(@Param('id', ParseIntPipe) id: number) { return this.svc.project(id); }
  @Get('projects/:id/issues') issues(@Param('id', ParseIntPipe) id: number) { return this.svc.issues(id); }
  @Get('projects/:id/pipelines') pipes(@Param('id', ParseIntPipe) id: number) { return this.svc.pipelines(id); }
  @Get('projects/:id/pipelines/:pid/jobs') jobs(@Param('id', ParseIntPipe) id: number, @Param('pid', ParseIntPipe) pid: number) {
    return this.svc.pipelineJobs(id, pid);
  }
  @Get('projects/:id/mrs') mrs(@Param('id', ParseIntPipe) id: number) { return this.svc.mergeRequests(id); }
}

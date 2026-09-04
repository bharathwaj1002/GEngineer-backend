import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { getTaskDefinition } from './definitions';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  @Get(':taskVersion')
  getDefinition(@Param('taskVersion') taskVersion: string) {
    const def = getTaskDefinition(taskVersion);
    if (!def) throw new NotFoundException('Unknown task version');
    return def;
  }
}

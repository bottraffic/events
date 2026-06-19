import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

class CreateTaskDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() assigneeId?: string;
  @IsOptional() @IsString() dueAt?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() relatedType?: string;
  @IsOptional() @IsString() relatedId?: string;
}
class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() assigneeId?: string;
  @IsOptional() @IsString() dueAt?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() status?: string;
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string, status?: string, assigneeId?: string) {
    return this.prisma.task.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as any } : {}),
        ...(assigneeId ? { assigneeId } : {}),
      },
      include: { assignee: { select: { id: true, name: true } } },
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }],
    });
  }

  create(tenantId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        assigneeId: dto.assigneeId,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        priority: (dto.priority as any) ?? 'MEDIUM',
        status: (dto.status as any) ?? 'OPEN',
        relatedType: dto.relatedType,
        relatedId: dto.relatedId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateTaskDto) {
    await this.assertExists(tenantId, id);
    const { dueAt, priority, status, ...rest } = dto;
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(dueAt ? { dueAt: new Date(dueAt) } : {}),
        ...(priority ? { priority: priority as any } : {}),
        ...(status ? { status: status as any } : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.assertExists(tenantId, id);
    await this.prisma.task.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertExists(tenantId: string, id: string) {
    const t = await this.prisma.task.findFirst({ where: { id, tenantId } });
    if (!t) throw new NotFoundException('Task not found');
    return t;
  }
}

@Controller('tasks')
class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
  ) {
    return this.tasks.list(user.tenantId, status, assigneeId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTaskDto) {
    return this.tasks.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tasks.remove(user.tenantId, id);
  }
}

@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

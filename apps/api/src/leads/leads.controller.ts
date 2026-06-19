import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { AuthUser, CurrentUser } from '../common/decorators';
import {
  CreateActivityDto,
  CreateLeadDto,
  MoveStageDto,
  ReminderDto,
  UpdateLeadDto,
} from './dto';

@Controller('leads')
export class LeadsController {
  constructor(private leads: LeadsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('stageId') stageId?: string,
    @Query('source') source?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.leads.list(user.tenantId, { stageId, source, assignedToId });
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.leads.findOne(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLeadDto) {
    return this.leads.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(user.tenantId, id, dto);
  }

  @Patch(':id/stage')
  moveStage(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: MoveStageDto) {
    return this.leads.moveStage(user.tenantId, id, dto, user.userId);
  }

  @Post(':id/activities')
  addActivity(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: CreateActivityDto) {
    return this.leads.addActivity(user.tenantId, id, dto, user.userId);
  }

  @Post(':id/reminders')
  addReminder(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ReminderDto) {
    return this.leads.addReminder(user.tenantId, id, dto);
  }

  @Post(':id/convert')
  convert(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.leads.convert(user.tenantId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.leads.remove(user.tenantId, id);
  }
}

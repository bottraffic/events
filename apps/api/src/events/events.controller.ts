import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsInt, IsNumber, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';
import { EventsService } from './events.service';
import { AuthUser, CurrentUser } from '../common/decorators';

class CreateEventDto {
  @IsString() @IsNotEmpty() customerId!: string;
  @IsOptional() @IsString() type?: string;
  @IsString() @IsNotEmpty() eventDate!: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() hallId?: string;
  @IsOptional() @IsInt() @Min(0) guestsCount?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() totalPrice?: number;
  @IsOptional() @IsNumber() depositPaid?: number;
}
class UpdateEventDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() eventDate?: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() hallId?: string;
  @IsOptional() @IsInt() @Min(0) guestsCount?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() totalPrice?: number;
  @IsOptional() @IsNumber() depositPaid?: number;
}

@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.events.list(user.tenantId, { status, from, to });
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.events.findOne(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEventDto) {
    return this.events.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.events.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.events.remove(user.tenantId, id);
  }
}

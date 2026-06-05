import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { TimetablesService, CreateTimetableDto } from './timetables.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Timetables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetables')
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @Get()
  @ApiOperation({ summary: 'List all timetables' })
  findAll() {
    return this.timetablesService.findAll();
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get timetable by class ID' })
  findByClass(@Param('classId') classId: string) {
    return this.timetablesService.findByClass(classId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get timetable by teacher ID' })
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.timetablesService.findByTeacher(teacherId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new timetable entry (Admin only)' })
  create(@Body() createDto: CreateTimetableDto) {
    return this.timetablesService.create(createDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete timetable entry (Admin only)' })
  remove(@Param('id') id: string) {
    return this.timetablesService.remove(id);
  }
}

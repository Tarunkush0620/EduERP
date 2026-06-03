import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, UpdateAttendanceDto, AttendanceQueryDto } from './dto/attendance.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mark attendance for a class (batch)' })
  markAttendance(@Body() dto: MarkAttendanceDto, @CurrentUser('sub') userId: string) {
    return this.attendanceService.markAttendance(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a single attendance record' })
  updateRecord(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.updateRecord(id, dto);
  }

  @Get('class/:classId')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get attendance history for a class' })
  getClassAttendance(
    @Param('classId') classId: string,
    @Query() query: AttendanceQueryDto,
  ) {
    return this.attendanceService.getClassAttendance(classId, query);
  }

  @Get('class/:classId/date/:date')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get attendance for a class on a specific date' })
  getAttendanceForDate(
    @Param('classId') classId: string,
    @Param('date') date: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.attendanceService.getAttendanceForDate(classId, date, subjectId);
  }

  @Get('class/:classId/students')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get students for attendance marking form' })
  getStudentsByClass(@Param('classId') classId: string) {
    return this.attendanceService.getStudentsByClass(classId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get attendance history for a student' })
  getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query() query: AttendanceQueryDto,
  ) {
    return this.attendanceService.getStudentAttendance(studentId, query);
  }

  @Get('report')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'School-wide attendance analytics' })
  getAttendanceReport(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.getAttendanceReport(query);
  }
}

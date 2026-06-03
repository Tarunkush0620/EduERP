import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { ExamsService } from './exams.service';
import { CreateExamDto, EnterResultsDto } from './dto/exam.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Exams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create an exam schedule' })
  create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all exams' })
  findAll() {
    return this.examsService.findAll();
  }

  @Get('teacher')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'List exams for classes the teacher teaches' })
  findForTeacher(@CurrentUser('sub') userId: string) {
    return this.examsService.findForTeacher(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam details including subjects' })
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Post(':examSubjectId/results')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Enter results for an exam subject' })
  enterResults(
    @Param('examSubjectId') examSubjectId: string,
    @Body() dto: EnterResultsDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.examsService.enterResults(examSubjectId, dto, userId, role);
  }

  @Get(':examSubjectId/results')
  @ApiOperation({ summary: 'Get results for an exam subject' })
  getResults(@Param('examSubjectId') examSubjectId: string) {
    return this.examsService.getResults(examSubjectId);
  }

  @Get('report-card/:studentId')
  @ApiOperation({ summary: 'Get report card for a student' })
  getReportCard(
    @Param('studentId') studentId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.examsService.getReportCard(studentId, userId, role);
  }
}

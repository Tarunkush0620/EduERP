import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto, SubmitAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create an assignment' })
  create(@Body() dto: CreateAssignmentDto, @CurrentUser('sub') userId: string) {
    return this.assignmentsService.create(dto, userId);
  }

  @Get('teacher')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get assignments created by the logged-in teacher' })
  findAllForTeacher(@CurrentUser('sub') userId: string) {
    return this.assignmentsService.findAllForTeacher(userId);
  }

  @Get('student')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get assignments for the logged-in student' })
  findAllForStudent(@CurrentUser('sub') userId: string) {
    return this.assignmentsService.findAllForStudent(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment details' })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update an assignment' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.assignmentsService.update(id, dto, userId, role);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete an assignment' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.assignmentsService.remove(id, userId, role);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit an assignment' })
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitAssignmentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.assignmentsService.submitAssignment(id, dto, userId);
  }

  @Get(':id/submissions')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all submissions for an assignment' })
  getSubmissions(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.assignmentsService.getSubmissions(id, userId, role);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Grade a student submission' })
  gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.assignmentsService.gradeSubmission(submissionId, dto, userId);
  }
}

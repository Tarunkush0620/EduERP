import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all students' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new student (Admin only)' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update student profile (Admin only)' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate student (Admin only)' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}

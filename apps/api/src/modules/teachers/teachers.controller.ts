import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @ApiOperation({ summary: 'List all teachers' })
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get teacher by ID' })
  findOne(@Param('id') id: string) {
    return this.teachersService.findById(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new teacher (Admin only)' })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update teacher profile (Admin only)' })
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate teacher (Admin only)' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}

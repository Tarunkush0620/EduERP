import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all subjects' })
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subject by ID' })
  findOne(@Param('id') id: string) {
    return this.subjectsService.findById(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new subject (Admin only)' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update subject (Admin only)' })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete subject (Admin only)' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}

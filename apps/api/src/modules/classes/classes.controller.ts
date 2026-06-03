import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @ApiOperation({ summary: 'List all classes' })
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class by ID' })
  findOne(@Param('id') id: string) {
    return this.classesService.findById(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new class (Admin only)' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update class (Admin only)' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete class (Admin only)' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  @Post(':id/sections')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add a section to a class (Admin only)' })
  addSection(@Param('id') classId: string, @Body('name') name: string) {
    return this.classesService.addSection(classId, name);
  }
}

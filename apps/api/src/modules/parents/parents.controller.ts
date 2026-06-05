import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { ParentsService } from './parents.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { TokenPayload } from '@eduerp/shared';

@ApiTags('Parents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all parents (Admin only)' })
  findAll() {
    return this.parentsService.findAll();
  }

  @Get('students')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: 'Get children of logged in parent' })
  getChildren(@CurrentUser() user: TokenPayload) {
    return this.parentsService.getChildren(user.sub);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get parent by ID' })
  findOne(@Param('id') id: string) {
    return this.parentsService.findById(id);
  }
}

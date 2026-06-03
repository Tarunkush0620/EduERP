import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@eduerp/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TokenPayload } from '@eduerp/shared';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.SUPER_ADMIN)
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('teacher')
  @Roles(Role.TEACHER)
  getTeacherDashboard(@CurrentUser() user: TokenPayload) {
    return this.dashboardService.getTeacherDashboard(user.sub);
  }

  @Get('student')
  @Roles(Role.STUDENT)
  getStudentDashboard(@CurrentUser() user: TokenPayload) {
    return this.dashboardService.getStudentDashboard(user.sub);
  }
}

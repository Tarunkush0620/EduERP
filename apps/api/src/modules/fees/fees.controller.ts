import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { FeesService } from './fees.service';
import { CreateFeeStructureDto, GenerateFeeRecordsDto, RecordPaymentDto } from './dto/fee.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Fees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Post('structure')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create fee structure for a class' })
  createStructure(@Body() dto: CreateFeeStructureDto) {
    return this.feesService.createStructure(dto);
  }

  @Get('structure')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all fee structures' })
  getStructures(@Query('classId') classId?: string) {
    return this.feesService.getStructures(classId);
  }

  @Post('generate')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate fee records for a class' })
  generateRecords(@Body() dto: GenerateFeeRecordsDto) {
    return this.feesService.generateRecords(dto);
  }

  @Get('due')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all overdue fees across school' })
  getDueFees() {
    return this.feesService.getDueFees();
  }

  @Get('report')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get fee collection report' })
  getReport() {
    return this.feesService.getReport();
  }

  @Get('student/me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get my fees' })
  getMyFees(@CurrentUser('sub') userId: string) {
    return this.feesService.getMyFees(userId);
  }

  @Get('student/:studentId')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get fee records for a student' })
  getStudentFees(
    @Param('studentId') studentId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.feesService.getStudentFees(studentId, userId, role);
  }

  @Post(':recordId/payment')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Record payment for a fee record' })
  recordPayment(
    @Param('recordId') recordId: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.feesService.recordPayment(recordId, dto);
  }
}

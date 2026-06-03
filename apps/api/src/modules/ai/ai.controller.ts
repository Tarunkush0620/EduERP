import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AiPromptDto {
  @ApiProperty()
  @IsString()
  prompt: string;
}

@ApiTags('AI Insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {

  @Get('insights')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get AI-driven insights for the dashboard' })
  getInsights() {
    // Mock implementation for AI Insights
    return {
      success: true,
      data: {
        summary: 'Overall student performance is up by 12% compared to last term. Attendance in Class 10-A needs attention.',
        recommendations: [
          'Schedule a parent-teacher meeting for students with < 75% attendance.',
          'Introduce remedial classes for Mathematics in Class 9-B.',
          'Review the fee collection strategy, 15% of payments are overdue by 30+ days.'
        ]
      }
    };
  }

  @Post('assistant')
  @Roles(Role.STUDENT, Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ask the EduERP AI Assistant a question' })
  askAssistant(@Body() dto: AiPromptDto, @CurrentUser('name') userName: string) {
    // Mock implementation for an AI Assistant response
    const query = dto.prompt.toLowerCase();
    let response = `Hello ${userName}! I am your EduERP AI assistant. I can help you with questions about your classes, attendance, or fees.`;
    
    if (query.includes('fee') || query.includes('pay')) {
      response = 'You can check your due fees and make payments from the "Fee Status" page in your dashboard.';
    } else if (query.includes('exam') || query.includes('result')) {
      response = 'Exam schedules and results are available under the "Examinations" and "Results" tabs.';
    } else if (query.includes('attendance')) {
      response = 'Your attendance is updated daily by your teachers. You can view your record in the "Attendance" section.';
    }
    
    return {
      success: true,
      data: {
        query: dto.prompt,
        response
      }
    };
  }
}

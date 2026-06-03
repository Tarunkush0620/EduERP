import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@eduerp/shared';
import { CommunicationService } from './communication.service';
import { CreateAnnouncementDto, SendMessageDto } from './dto/communication.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('communication')
export class CommunicationController {
  constructor(private readonly commsService: CommunicationService) {}

  @Post('announcements')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Create an announcement' })
  createAnnouncement(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.commsService.createAnnouncement(dto, userId, role);
  }

  @Get('announcements')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get relevant announcements' })
  getAnnouncements(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.commsService.getAnnouncements(userId, role);
  }

  @Post('messages')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Send a direct message' })
  sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.commsService.sendMessage(dto, userId);
  }

  @Get('messages/inbox')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get received messages' })
  getInbox(@CurrentUser('sub') userId: string) {
    return this.commsService.getInbox(userId);
  }

  @Get('messages/sent')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get sent messages' })
  getSentMessages(@CurrentUser('sub') userId: string) {
    return this.commsService.getSentMessages(userId);
  }

  @Patch('messages/:id/read')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Mark message as read' })
  markMessageAsRead(
    @Param('id') messageId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.commsService.markMessageAsRead(messageId, userId);
  }
}

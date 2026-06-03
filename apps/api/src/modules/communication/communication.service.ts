import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { eq, or, and, desc, inArray, isNull } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { announcements, messages, users, teachers, students } from '../../database/schema';
import { CreateAnnouncementDto, SendMessageDto } from './dto/communication.dto';
import { Role } from '@eduerp/shared';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // --- Announcements ---

  async createAnnouncement(dto: CreateAnnouncementDto, userId: string, role: Role) {
    if (role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot create announcements');
    }

    const classId = dto.targetClassIds?.length ? dto.targetClassIds[0] : null;

    let targetRole: string | null = null;
    if (dto.targetAudience === 'teachers') targetRole = 'teacher';
    if (dto.targetAudience === 'students') targetRole = 'student';

    const [announcement] = await this.db
      .insert(announcements)
      .values({
        title: dto.title,
        content: dto.content,
        targetRole,
        classId,
        authorId: userId,
      })
      .returning();

    this.logger.log(`Announcement created by ${userId}`);
    return announcement;
  }

  async getAnnouncements(userId: string, role: Role) {
    // Super Admin sees all
    if (role === Role.SUPER_ADMIN) {
      return await this.db.select().from(announcements).orderBy(desc(announcements.createdAt));
    }

    // Teachers see all or specifically targetRole = 'teacher'
    if (role === Role.TEACHER) {
      return await this.db
        .select()
        .from(announcements)
        .where(
          or(
            eq(announcements.targetRole, 'teacher'),
            isNull(announcements.targetRole) // 'null' is used for 'all' in schema if we adopt that logic
          )
        )
        .orderBy(desc(announcements.createdAt));
    }

    // Students see all, 'student', and classId specific
    if (role === Role.STUDENT) {
      const [student] = await this.db.select().from(students).where(eq(students.userId, userId)).limit(1);
      if (!student) throw new ForbiddenException('Student profile not found');

      // Due to drizzle orm typing with 'null' it's easier to fetch and filter here for a mock implementation
      const allAnns = await this.db.select().from(announcements).orderBy(desc(announcements.createdAt));
      
      const filtered = allAnns.filter(a => {
        if (!a.targetRole && !a.classId) return true; // 'all'
        if (a.targetRole === 'student' && !a.classId) return true;
        if (a.classId === student.classId) return true;
        return false;
      });
      return filtered;
    }

    return [];
  }

  // --- Messages ---

  async sendMessage(dto: SendMessageDto, senderId: string) {
    const [receiver] = await this.db.select().from(users).where(eq(users.id, dto.receiverId)).limit(1);
    if (!receiver) throw new NotFoundException('Receiver not found');

    const [message] = await this.db
      .insert(messages)
      .values({
        senderId,
        receiverId: dto.receiverId,
        subject: dto.subject,
        content: dto.body,
      })
      .returning();

    return message;
  }

  async getInbox(userId: string) {
    return await this.db
      .select({
        id: messages.id,
        subject: messages.subject,
        body: messages.content,
        isRead: messages.read,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.receiverId, userId))
      .orderBy(desc(messages.createdAt));
  }

  async getSentMessages(userId: string) {
    return await this.db
      .select({
        id: messages.id,
        subject: messages.subject,
        body: messages.content,
        isRead: messages.read,
        createdAt: messages.createdAt,
        receiverId: messages.receiverId,
        receiverName: users.name,
      })
      .from(messages)
      .innerJoin(users, eq(messages.receiverId, users.id))
      .where(eq(messages.senderId, userId))
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(messageId: string, userId: string) {
    const [message] = await this.db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
    if (!message) throw new NotFoundException('Message not found');

    if (message.receiverId !== userId) {
      throw new ForbiddenException('You can only read your own messages');
    }

    const [updated] = await this.db
      .update(messages)
      .set({ read: new Date() })
      .where(eq(messages.id, messageId))
      .returning();

    return updated;
  }
}

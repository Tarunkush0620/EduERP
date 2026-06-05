import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, or } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import * as schema from '../../database/schema';

export interface CreateTimetableDto {
  classId: string;
  sectionId?: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

@Injectable()
export class TimetablesService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: Database,
  ) {}

  async findAll() {
    return this.db.query.timetables.findMany({
      with: {
        class: true,
        subject: true,
        teacher: {
          with: { user: true }
        },
      },
    });
  }

  async findByClass(classId: string) {
    return this.db.query.timetables.findMany({
      where: eq(schema.timetables.classId, classId),
      with: {
        subject: true,
        teacher: {
          with: { user: true }
        },
      },
    });
  }

  async findByTeacher(teacherId: string) {
    return this.db.query.timetables.findMany({
      where: eq(schema.timetables.teacherId, teacherId),
      with: {
        class: true,
        subject: true,
      },
    });
  }

  async create(createDto: CreateTimetableDto) {
    // Check for overlap: same teacher, same day, overlapping time
    // For simplicity, we'll fetch all teacher's schedules for that day and compare
    const existing = await this.db.query.timetables.findMany({
      where: and(
        eq(schema.timetables.teacherId, createDto.teacherId),
        eq(schema.timetables.dayOfWeek, createDto.dayOfWeek)
      )
    });

    for (const schedule of existing) {
      if (
        (createDto.startTime >= schedule.startTime && createDto.startTime < schedule.endTime) ||
        (createDto.endTime > schedule.startTime && createDto.endTime <= schedule.endTime) ||
        (createDto.startTime <= schedule.startTime && createDto.endTime >= schedule.endTime)
      ) {
        throw new BadRequestException('Teacher is already booked for this time slot.');
      }
    }

    const [timetable] = await this.db
      .insert(schema.timetables)
      .values(createDto)
      .returning();

    return timetable;
  }

  async remove(id: string) {
    const [deleted] = await this.db
      .delete(schema.timetables)
      .where(eq(schema.timetables.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException('Timetable entry not found');
    }

    return deleted;
  }
}

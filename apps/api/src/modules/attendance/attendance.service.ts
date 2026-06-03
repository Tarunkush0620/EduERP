import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { eq, and, gte, lte, count, sql, inArray, desc } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { attendance, students, classes, subjects, users } from '../../database/schema';
import { MarkAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  /**
   * Batch-mark attendance for a class on a given date.
   * If records already exist for that class+date, they are overwritten.
   */
  async markAttendance(dto: MarkAttendanceDto, markedByUserId: string) {
    // Verify class exists
    const [cls] = await this.db.select({ id: classes.id }).from(classes).where(eq(classes.id, dto.classId)).limit(1);
    if (!cls) throw new NotFoundException('Class not found');

    return await this.db.transaction(async (tx) => {
      // Delete existing records for this class+date (allows re-marking)
      const deleteConditions = [
        eq(attendance.classId, dto.classId),
        eq(attendance.date, dto.date),
      ];
      if (dto.subjectId) {
        deleteConditions.push(eq(attendance.subjectId, dto.subjectId));
      }
      await tx.delete(attendance).where(and(...deleteConditions));

      // Insert new records
      const records = dto.entries.map((entry) => ({
        studentId: entry.studentId,
        classId: dto.classId,
        subjectId: dto.subjectId ?? null,
        date: dto.date,
        status: entry.status as any,
        markedBy: markedByUserId,
        remarks: entry.remarks ?? null,
      }));

      const inserted = await tx.insert(attendance).values(records).returning();
      this.logger.log(`Attendance marked: ${inserted.length} records for class ${dto.classId} on ${dto.date}`);

      return {
        message: `Attendance marked for ${inserted.length} students`,
        count: inserted.length,
        date: dto.date,
      };
    });
  }

  /**
   * Update a single attendance record.
   */
  async updateRecord(id: string, dto: UpdateAttendanceDto) {
    const [existing] = await this.db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
    if (!existing) throw new NotFoundException('Attendance record not found');

    const [updated] = await this.db
      .update(attendance)
      .set({
        status: dto.status as any,
        remarks: dto.remarks ?? existing.remarks,
      })
      .where(eq(attendance.id, id))
      .returning();

    return updated;
  }

  /**
   * Get attendance records for a specific class, with optional date range and subject filters.
   */
  async getClassAttendance(classId: string, query: { subjectId?: string; startDate?: string; endDate?: string }) {
    const conditions = [eq(attendance.classId, classId)];

    if (query.subjectId) conditions.push(eq(attendance.subjectId, query.subjectId));
    if (query.startDate) conditions.push(gte(attendance.date, query.startDate));
    if (query.endDate) conditions.push(lte(attendance.date, query.endDate));

    return await this.db
      .select({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        remarks: attendance.remarks,
        studentId: attendance.studentId,
        studentName: users.name,
        rollNumber: students.rollNumber,
        subjectId: attendance.subjectId,
        subjectName: subjects.name,
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(subjects, eq(attendance.subjectId, subjects.id))
      .where(and(...conditions))
      .orderBy(desc(attendance.date), users.name);
  }

  /**
   * Get attendance history for a single student.
   */
  async getStudentAttendance(studentId: string, query: { startDate?: string; endDate?: string }) {
    // Verify student exists
    const [student] = await this.db.select({ id: students.id }).from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) throw new NotFoundException('Student not found');

    const conditions = [eq(attendance.studentId, studentId)];
    if (query.startDate) conditions.push(gte(attendance.date, query.startDate));
    if (query.endDate) conditions.push(lte(attendance.date, query.endDate));

    const records = await this.db
      .select({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        remarks: attendance.remarks,
        className: classes.name,
        subjectName: subjects.name,
      })
      .from(attendance)
      .innerJoin(classes, eq(attendance.classId, classes.id))
      .leftJoin(subjects, eq(attendance.subjectId, subjects.id))
      .where(and(...conditions))
      .orderBy(desc(attendance.date));

    // Calculate summary
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const percentage = total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0;

    return {
      summary: { total, present, absent, late, excused, percentage },
      records,
    };
  }

  /**
   * School-wide attendance analytics for admin.
   */
  async getAttendanceReport(query: { startDate?: string; endDate?: string }) {
    const conditions: any[] = [];
    if (query.startDate) conditions.push(gte(attendance.date, query.startDate));
    if (query.endDate) conditions.push(lte(attendance.date, query.endDate));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Overall counts
    const allRecords = await this.db
      .select({
        status: attendance.status,
        cnt: count(),
      })
      .from(attendance)
      .where(whereClause)
      .groupBy(attendance.status);

    const statusMap: Record<string, number> = {};
    let totalRecords = 0;
    for (const r of allRecords) {
      statusMap[r.status] = Number(r.cnt);
      totalRecords += Number(r.cnt);
    }

    // Per-class attendance rates
    const classRates = await this.db
      .select({
        classId: attendance.classId,
        className: classes.name,
        total: count(),
        present: sql<number>`COUNT(*) FILTER (WHERE ${attendance.status} = 'present')`,
      })
      .from(attendance)
      .innerJoin(classes, eq(attendance.classId, classes.id))
      .where(whereClause)
      .groupBy(attendance.classId, classes.name)
      .orderBy(classes.name);

    const classBreakdown = classRates.map((c) => ({
      classId: c.classId,
      className: c.className,
      total: Number(c.total),
      present: Number(c.present),
      rate: Number(c.total) > 0 ? Math.round((Number(c.present) / Number(c.total)) * 100 * 10) / 10 : 0,
    }));

    return {
      overall: {
        total: totalRecords,
        present: statusMap['present'] || 0,
        absent: statusMap['absent'] || 0,
        late: statusMap['late'] || 0,
        excused: statusMap['excused'] || 0,
        rate: totalRecords > 0 ? Math.round(((statusMap['present'] || 0) / totalRecords) * 100 * 10) / 10 : 0,
      },
      classBreakdown,
    };
  }

  /**
   * Get students for a class (for the attendance marking form).
   */
  async getStudentsByClass(classId: string) {
    return await this.db
      .select({
        id: students.id,
        rollNumber: students.rollNumber,
        name: users.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(eq(students.classId, classId), eq(users.status, 'active')))
      .orderBy(students.rollNumber);
  }

  /**
   * Check if attendance was already marked for a class on a date.
   */
  async getAttendanceForDate(classId: string, date: string, subjectId?: string) {
    const conditions = [
      eq(attendance.classId, classId),
      eq(attendance.date, date),
    ];
    if (subjectId) conditions.push(eq(attendance.subjectId, subjectId));

    return await this.db
      .select({
        id: attendance.id,
        studentId: attendance.studentId,
        status: attendance.status,
        remarks: attendance.remarks,
        studentName: users.name,
        rollNumber: students.rollNumber,
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(...conditions))
      .orderBy(students.rollNumber);
  }
}

import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { feeStructures, feeRecords, students, classes, users } from '../../database/schema';
import { CreateFeeStructureDto, GenerateFeeRecordsDto, RecordPaymentDto } from './dto/fee.dto';
import { Role } from '@eduerp/shared';

@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async createStructure(dto: CreateFeeStructureDto) {
    const [structure] = await this.db
      .insert(feeStructures)
      .values({
        classId: dto.classId,
        name: dto.name,
        amount: dto.amount.toString(),
        frequency: dto.frequency,
      })
      .returning();
      
    this.logger.log(`Created fee structure ${structure.name} for class ${structure.classId}`);
    return structure;
  }

  async getStructures(classId?: string) {
    let query = this.db
      .select({
        id: feeStructures.id,
        name: feeStructures.name,
        amount: feeStructures.amount,
        frequency: feeStructures.frequency,
        classId: feeStructures.classId,
        className: classes.name,
      })
      .from(feeStructures)
      .innerJoin(classes, eq(feeStructures.classId, classes.id));

    if (classId) {
      query = query.where(eq(feeStructures.classId, classId)) as any;
    }

    return await query.orderBy(classes.name);
  }

  async generateRecords(dto: GenerateFeeRecordsDto) {
    const classStudents = await this.db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.classId, dto.classId));

    if (classStudents.length === 0) return { message: 'No students in this class', count: 0 };

    const [structure] = await this.db
      .select()
      .from(feeStructures)
      .where(eq(feeStructures.id, dto.feeStructureId))
      .limit(1);

    if (!structure) throw new NotFoundException('Fee structure not found');

    const records = classStudents.map(s => ({
      studentId: s.id,
      feeStructureId: structure.id,
      amount: structure.amount,
      dueDate: new Date(dto.dueDate).toISOString(),
      status: 'pending' as const,
    }));

    const inserted = await this.db.insert(feeRecords).values(records).returning();
    this.logger.log(`Generated ${inserted.length} fee records for class ${dto.classId}`);
    return { message: 'Fee records generated successfully', count: inserted.length };
  }

  async getStudentFees(studentId: string, userId: string, role: Role) {
    if (role === Role.STUDENT) {
      const [me] = await this.db.select().from(students).where(eq(students.userId, userId)).limit(1);
      if (!me || me.id !== studentId) {
        throw new ForbiddenException('You can only view your own fees');
      }
    }

    return await this.db
      .select({
        id: feeRecords.id,
        amount: feeRecords.amount,
        dueDate: feeRecords.dueDate,
        paidDate: feeRecords.paidDate,
        status: feeRecords.status,
        paymentMethod: feeRecords.paymentMethod,
        transactionId: feeRecords.transactionId,
        feeName: feeStructures.name,
        frequency: feeStructures.frequency,
      })
      .from(feeRecords)
      .innerJoin(feeStructures, eq(feeRecords.feeStructureId, feeStructures.id))
      .where(eq(feeRecords.studentId, studentId))
      .orderBy(desc(feeRecords.dueDate));
  }

  async getMyFees(userId: string) {
    const [me] = await this.db.select().from(students).where(eq(students.userId, userId)).limit(1);
    if (!me) throw new ForbiddenException('Student profile not found');
    return this.getStudentFees(me.id, userId, Role.STUDENT);
  }

  async recordPayment(recordId: string, dto: RecordPaymentDto) {
    const [record] = await this.db.select().from(feeRecords).where(eq(feeRecords.id, recordId)).limit(1);
    if (!record) throw new NotFoundException('Fee record not found');

    if (record.status === 'paid') {
      throw new ForbiddenException('This fee is already paid');
    }

    const [updated] = await this.db
      .update(feeRecords)
      .set({
        status: 'paid',
        paidDate: new Date().toISOString(),
        paymentMethod: dto.paymentMethod,
        transactionId: dto.transactionId,
      })
      .where(eq(feeRecords.id, recordId))
      .returning();

    this.logger.log(`Payment recorded for fee record ${recordId}`);
    return updated;
  }

  async getDueFees() {
    return await this.db
      .select({
        id: feeRecords.id,
        amount: feeRecords.amount,
        dueDate: feeRecords.dueDate,
        feeName: feeStructures.name,
        studentName: users.name,
        rollNumber: students.rollNumber,
        className: classes.name,
      })
      .from(feeRecords)
      .innerJoin(feeStructures, eq(feeRecords.feeStructureId, feeStructures.id))
      .innerJoin(students, eq(feeRecords.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(
        and(
          eq(feeRecords.status, 'pending'),
          sql`${feeRecords.dueDate} < CURRENT_DATE`
        )
      )
      .orderBy(feeRecords.dueDate);
  }

  async getReport() {
    // Basic aggregation: total paid vs total pending
    const paidResult = await this.db
      .select({ total: sql<number>`sum(CAST(${feeRecords.amount} AS NUMERIC))` })
      .from(feeRecords)
      .where(eq(feeRecords.status, 'paid'));

    const pendingResult = await this.db
      .select({ total: sql<number>`sum(CAST(${feeRecords.amount} AS NUMERIC))` })
      .from(feeRecords)
      .where(eq(feeRecords.status, 'pending'));

    return {
      totalCollected: paidResult[0]?.total || 0,
      totalPending: pendingResult[0]?.total || 0,
    };
  }
}

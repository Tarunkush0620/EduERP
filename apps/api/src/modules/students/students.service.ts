import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { users, students, classes, sections } from '../../database/schema';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll() {
    return await this.db
      .select({
        id: students.id,
        userId: students.userId,
        rollNumber: students.rollNumber,
        admissionDate: students.admissionDate,
        parentName: students.parentName,
        parentPhone: students.parentPhone,
        name: users.name,
        email: users.email,
        phone: users.phone,
        status: users.status,
        className: classes.name,
        sectionName: sections.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(classes, eq(students.classId, classes.id))
      .leftJoin(sections, eq(students.sectionId, sections.id))
      .orderBy(classes.name, users.name);
  }

  async findById(id: string) {
    const [student] = await this.db
      .select({
        id: students.id,
        userId: students.userId,
        rollNumber: students.rollNumber,
        classId: students.classId,
        sectionId: students.sectionId,
        admissionDate: students.admissionDate,
        parentName: students.parentName,
        parentPhone: students.parentPhone,
        parentEmail: students.parentEmail,
        name: users.name,
        email: users.email,
        phone: users.phone,
        status: users.status,
        className: classes.name,
        sectionName: sections.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(classes, eq(students.classId, classes.id))
      .leftJoin(sections, eq(students.sectionId, sections.id))
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async create(dto: CreateStudentDto) {
    return await this.db.transaction(async (tx) => {
      // 1. Check if email exists
      const [existingUser] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, dto.email.toLowerCase()))
        .limit(1);

      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }

      // 2. Check if rollNumber exists
      const [existingStudent] = await tx
        .select({ id: students.id })
        .from(students)
        .where(eq(students.rollNumber, dto.rollNumber))
        .limit(1);

      if (existingStudent) {
        throw new ConflictException('A student with this roll number already exists');
      }

      // Verify class exists
      const [existingClass] = await tx
        .select({ id: classes.id })
        .from(classes)
        .where(eq(classes.id, dto.classId))
        .limit(1);

      if (!existingClass) {
        throw new NotFoundException('Class not found');
      }

      // 3. Create User
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const [user] = await tx
        .insert(users)
        .values({
          name: dto.name,
          email: dto.email.toLowerCase(),
          passwordHash,
          role: 'student',
          phone: dto.phone,
        })
        .returning();

      // 4. Create Student profile
      const [student] = await tx
        .insert(students)
        .values({
          userId: user.id,
          rollNumber: dto.rollNumber,
          classId: dto.classId,
          sectionId: dto.sectionId,
          admissionDate: dto.admissionDate,
          parentName: dto.parentName,
          parentPhone: dto.parentPhone,
          parentEmail: dto.parentEmail,
        })
        .returning();

      this.logger.log(`Student created: ${user.name} (${student.rollNumber})`);

      return {
        ...student,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
      };
    });
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.findById(id);

    return await this.db.transaction(async (tx) => {
      // Update User details if provided
      if (dto.name || dto.phone) {
        await tx
          .update(users)
          .set({
            ...(dto.name && { name: dto.name }),
            ...(dto.phone && { phone: dto.phone }),
            updatedAt: new Date(),
          })
          .where(eq(users.id, student.userId));
      }

      // Update Student details if provided
      const studentUpdates: any = { updatedAt: new Date() };
      let hasStudentUpdates = false;

      if (dto.classId) {
        studentUpdates.classId = dto.classId;
        hasStudentUpdates = true;
      }
      if (dto.sectionId !== undefined) {
        studentUpdates.sectionId = dto.sectionId;
        hasStudentUpdates = true;
      }
      if (dto.parentName !== undefined) {
        studentUpdates.parentName = dto.parentName;
        hasStudentUpdates = true;
      }
      if (dto.parentPhone !== undefined) {
        studentUpdates.parentPhone = dto.parentPhone;
        hasStudentUpdates = true;
      }
      if (dto.parentEmail !== undefined) {
        studentUpdates.parentEmail = dto.parentEmail;
        hasStudentUpdates = true;
      }

      if (hasStudentUpdates) {
        await tx
          .update(students)
          .set(studentUpdates)
          .where(eq(students.id, id));
      }

      return this.findById(id);
    });
  }

  async remove(id: string) {
    const student = await this.findById(id);

    // Soft delete the user
    await this.db
      .update(users)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(users.id, student.userId));

    return { message: 'Student deactivated successfully' };
  }
}

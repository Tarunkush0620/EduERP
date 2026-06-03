import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { users, teachers } from '../../database/schema';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll() {
    return await this.db
      .select({
        id: teachers.id,
        userId: teachers.userId,
        employeeId: teachers.employeeId,
        department: teachers.department,
        qualification: teachers.qualification,
        joiningDate: teachers.joiningDate,
        name: users.name,
        email: users.email,
        phone: users.phone,
        status: users.status,
      })
      .from(teachers)
      .innerJoin(users, eq(teachers.userId, users.id))
      .orderBy(users.name);
  }

  async findById(id: string) {
    const [teacher] = await this.db
      .select({
        id: teachers.id,
        userId: teachers.userId,
        employeeId: teachers.employeeId,
        department: teachers.department,
        qualification: teachers.qualification,
        joiningDate: teachers.joiningDate,
        name: users.name,
        email: users.email,
        phone: users.phone,
        status: users.status,
      })
      .from(teachers)
      .innerJoin(users, eq(teachers.userId, users.id))
      .where(eq(teachers.id, id))
      .limit(1);

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async create(dto: CreateTeacherDto) {
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

      // 2. Check if employeeId exists
      const [existingTeacher] = await tx
        .select({ id: teachers.id })
        .from(teachers)
        .where(eq(teachers.employeeId, dto.employeeId))
        .limit(1);

      if (existingTeacher) {
        throw new ConflictException('A teacher with this employee ID already exists');
      }

      // 3. Create User
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const [user] = await tx
        .insert(users)
        .values({
          name: dto.name,
          email: dto.email.toLowerCase(),
          passwordHash,
          role: 'teacher',
          phone: dto.phone,
        })
        .returning();

      // 4. Create Teacher profile
      const [teacher] = await tx
        .insert(teachers)
        .values({
          userId: user.id,
          employeeId: dto.employeeId,
          department: dto.department,
          qualification: dto.qualification,
          joiningDate: dto.joiningDate,
        })
        .returning();

      this.logger.log(`Teacher created: ${user.name} (${teacher.employeeId})`);

      return {
        ...teacher,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
      };
    });
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.findById(id);

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
          .where(eq(users.id, teacher.userId));
      }

      // Update Teacher details if provided
      if (dto.department !== undefined || dto.qualification !== undefined) {
        await tx
          .update(teachers)
          .set({
            ...(dto.department !== undefined && { department: dto.department }),
            ...(dto.qualification !== undefined && { qualification: dto.qualification }),
            updatedAt: new Date(),
          })
          .where(eq(teachers.id, id));
      }

      return this.findById(id);
    });
  }

  async remove(id: string) {
    const teacher = await this.findById(id);

    // Soft delete the user
    await this.db
      .update(users)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(users.id, teacher.userId));

    return { message: 'Teacher deactivated successfully' };
  }
}

import { Injectable, Inject, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { eq, ilike, or, sql, desc, asc, count } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { users } from '../../database/schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let baseQuery = this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        avatar: users.avatar,
        phone: users.phone,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .$dynamic();

    // Build conditions
    const conditions: any[] = [];

    if (query.search) {
      conditions.push(
        or(
          ilike(users.name, `%${query.search}%`),
          ilike(users.email, `%${query.search}%`),
        ),
      );
    }

    if (query.role) {
      conditions.push(eq(users.role, query.role as any));
    }

    if (query.status) {
      conditions.push(eq(users.status, query.status as any));
    }

    // Apply conditions
    if (conditions.length > 0) {
      for (const condition of conditions) {
        baseQuery = baseQuery.where(condition);
      }
    }

    // Count total
    const [{ total: totalCount }] = await this.db
      .select({ total: count() })
      .from(users);
    const total = Number(totalCount);

    // Sort and paginate
    const sortCol = query.sortBy === 'name' ? users.name : users.createdAt;
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    const data = await baseQuery
      .orderBy(sortFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        avatar: users.avatar,
        phone: users.phone,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    // Check for existing email
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase()))
      .limit(1);

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const [user] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role as any,
        phone: dto.phone,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      });

    this.logger.log(`User created: ${user.email} (${user.role})`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const [updated] = await this.db
      .update(users)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        phone: users.phone,
        updatedAt: users.updatedAt,
      });

    return updated;
  }

  async remove(id: string) {
    const [existing] = await this.db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (existing.role === 'super_admin') {
      throw new ConflictException('Cannot delete the Super Admin account');
    }

    // Soft delete by setting status to inactive
    await this.db
      .update(users)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(users.id, id));

    return { message: 'User deactivated successfully' };
  }

  async getDashboardStats() {
    const [totalUsers] = await this.db.select({ count: count() }).from(users);
    const [totalTeachers] = await this.db.select({ count: count() }).from(users).where(eq(users.role, 'teacher'));
    const [totalStudents] = await this.db.select({ count: count() }).from(users).where(eq(users.role, 'student'));
    const [activeUsers] = await this.db.select({ count: count() }).from(users).where(eq(users.status, 'active'));

    return {
      totalUsers: Number(totalUsers.count),
      totalTeachers: Number(totalTeachers.count),
      totalStudents: Number(totalStudents.count),
      activeUsers: Number(activeUsers.count),
    };
  }
}

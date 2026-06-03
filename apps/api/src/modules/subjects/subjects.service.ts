import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { subjects } from '../../database/schema';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll() {
    return await this.db.select().from(subjects).orderBy(subjects.name);
  }

  async findById(id: string) {
    const [subject] = await this.db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const [existing] = await this.db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.code, dto.code))
      .limit(1);

    if (existing) {
      throw new ConflictException('A subject with this code already exists');
    }

    const [subject] = await this.db
      .insert(subjects)
      .values(dto)
      .returning();

    this.logger.log(`Subject created: ${subject.name} (${subject.code})`);
    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const [existing] = await this.db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Subject not found');
    }

    if (dto.code) {
      const [codeExists] = await this.db
        .select({ id: subjects.id })
        .from(subjects)
        .where(eq(subjects.code, dto.code))
        .limit(1);

      if (codeExists && codeExists.id !== id) {
        throw new ConflictException('A subject with this code already exists');
      }
    }

    const [updated] = await this.db
      .update(subjects)
      .set(dto)
      .where(eq(subjects.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const [existing] = await this.db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Subject not found');
    }

    await this.db.delete(subjects).where(eq(subjects.id, id));
    return { message: 'Subject deleted successfully' };
  }
}

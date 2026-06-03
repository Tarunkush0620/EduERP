import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { classes, sections } from '../../database/schema';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll() {
    const classList = await this.db.select().from(classes).orderBy(classes.name);
    
    // We will do a separate query to fetch sections and attach them
    const allSections = await this.db.select().from(sections);
    
    return classList.map(c => ({
      ...c,
      sections: allSections.filter(s => s.classId === c.id),
    }));
  }

  async findById(id: string) {
    const [classEntity] = await this.db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const classSections = await this.db.select().from(sections).where(eq(sections.classId, id));

    return {
      ...classEntity,
      sections: classSections,
    };
  }

  async create(dto: CreateClassDto) {
    return await this.db.transaction(async (tx) => {
      const [newClass] = await tx
        .insert(classes)
        .values({
          name: dto.name,
          description: dto.description,
        })
        .returning();

      let createdSections: any[] = [];
      if (dto.sections && dto.sections.length > 0) {
        createdSections = await tx
          .insert(sections)
          .values(dto.sections.map(s => ({ name: s.name, classId: newClass.id })))
          .returning();
      }

      this.logger.log(`Class created: ${newClass.name}`);
      return {
        ...newClass,
        sections: createdSections,
      };
    });
  }

  async update(id: string, dto: UpdateClassDto) {
    const [existing] = await this.db
      .select({ id: classes.id })
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Class not found');
    }

    const [updated] = await this.db
      .update(classes)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const [existing] = await this.db
      .select({ id: classes.id })
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Class not found');
    }

    await this.db.delete(classes).where(eq(classes.id, id));
    return { message: 'Class deleted successfully' };
  }

  async addSection(classId: string, name: string) {
    const [existing] = await this.db
      .select({ id: classes.id })
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Class not found');
    }

    const [section] = await this.db
      .insert(sections)
      .values({ name, classId })
      .returning();

    return section;
  }
}

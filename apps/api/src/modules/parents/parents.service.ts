import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import * as schema from '../../database/schema';

@Injectable()
export class ParentsService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: Database,
  ) {}

  async findAll() {
    return this.db.query.parents.findMany({
      with: {
        user: true,
        children: {
          with: {
            class: true,
            section: true,
            user: true,
          }
        }
      },
    });
  }

  async findById(id: string) {
    const parent = await this.db.query.parents.findFirst({
      where: eq(schema.parents.id, id),
      with: {
        user: true,
        children: {
          with: {
            class: true,
            section: true,
            user: true,
          }
        }
      },
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }
    return parent;
  }

  async findByUserId(userId: string) {
    const parent = await this.db.query.parents.findFirst({
      where: eq(schema.parents.userId, userId),
      with: {
        user: true,
        children: {
          with: {
            class: true,
            section: true,
            user: true,
          }
        }
      },
    });

    if (!parent) {
      throw new NotFoundException(`Parent for user ${userId} not found`);
    }
    return parent;
  }

  async getChildren(userId: string) {
    const parent = await this.findByUserId(userId);
    return parent.children;
  }
}

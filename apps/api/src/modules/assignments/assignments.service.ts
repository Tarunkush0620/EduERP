import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { eq, and, desc, getTableColumns } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { assignments, assignmentSubmissions, teachers, students, users, classes, subjects } from '../../database/schema';
import { CreateAssignmentDto, UpdateAssignmentDto, SubmitAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';
import { Role } from '@eduerp/shared';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(dto: CreateAssignmentDto, userId: string) {
    // Get teacher id from user id
    const [teacher] = await this.db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    if (!teacher) throw new ForbiddenException('Only teachers can create assignments');

    const [assignment] = await this.db
      .insert(assignments)
      .values({
        teacherId: teacher.id,
        classId: dto.classId,
        subjectId: dto.subjectId ?? null,
        title: dto.title,
        description: dto.description ?? null,
        fileUrl: dto.fileUrl ?? null,
        deadline: new Date(dto.deadline),
      })
      .returning();

    this.logger.log(`Assignment created: ${assignment.title} (ID: ${assignment.id})`);
    return assignment;
  }

  async findAllForTeacher(userId: string) {
    const [teacher] = await this.db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    if (!teacher) throw new ForbiddenException('Teacher profile not found');

    return await this.db
      .select({
        ...getTableColumns(assignments),
        className: classes.name,
        subjectName: subjects.name,
      })
      .from(assignments)
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .leftJoin(subjects, eq(assignments.subjectId, subjects.id))
      .where(eq(assignments.teacherId, teacher.id))
      .orderBy(desc(assignments.createdAt));
  }

  async findAllForStudent(userId: string) {
    const [student] = await this.db.select().from(students).where(eq(students.userId, userId)).limit(1);
    if (!student) throw new ForbiddenException('Student profile not found');

    const allAssignments = await this.db
      .select({
        ...getTableColumns(assignments),
        className: classes.name,
        subjectName: subjects.name,
        teacherName: users.name,
      })
      .from(assignments)
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .leftJoin(subjects, eq(assignments.subjectId, subjects.id))
      .innerJoin(teachers, eq(assignments.teacherId, teachers.id))
      .innerJoin(users, eq(teachers.userId, users.id))
      .where(eq(assignments.classId, student.classId))
      .orderBy(desc(assignments.createdAt));

    // Get student's submissions to know what is pending
    const submissions = await this.db
      .select()
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.studentId, student.id));

    const submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));

    return allAssignments.map(a => {
      const submission = submissionMap.get(a.id);
      return {
        ...a,
        submissionStatus: submission ? (submission.grade ? 'graded' : 'submitted') : 'pending',
        submission: submission || null,
      };
    });
  }

  async findOne(id: string) {
    const [assignment] = await this.db
      .select({
        ...getTableColumns(assignments),
        className: classes.name,
        subjectName: subjects.name,
      })
      .from(assignments)
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .leftJoin(subjects, eq(assignments.subjectId, subjects.id))
      .where(eq(assignments.id, id))
      .limit(1);

    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto, userId: string, role: Role) {
    const assignment = await this.findOne(id);

    if (role === Role.TEACHER) {
      const [teacher] = await this.db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
      if (assignment.teacherId !== teacher?.id) {
        throw new ForbiddenException('You can only update your own assignments');
      }
    }

    const [updated] = await this.db
      .update(assignments)
      .set({
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.fileUrl !== undefined && { fileUrl: dto.fileUrl }),
        ...(dto.deadline && { deadline: new Date(dto.deadline) }),
        updatedAt: new Date(),
      })
      .where(eq(assignments.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, userId: string, role: Role) {
    const assignment = await this.findOne(id);

    if (role === Role.TEACHER) {
      const [teacher] = await this.db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
      if (assignment.teacherId !== teacher?.id) {
        throw new ForbiddenException('You can only delete your own assignments');
      }
    }

    await this.db.delete(assignments).where(eq(assignments.id, id));
    return { message: 'Assignment deleted successfully' };
  }

  async submitAssignment(assignmentId: string, dto: SubmitAssignmentDto, userId: string) {
    const [student] = await this.db.select().from(students).where(eq(students.userId, userId)).limit(1);
    if (!student) throw new ForbiddenException('Only students can submit assignments');

    // Check if already submitted
    const [existing] = await this.db
      .select()
      .from(assignmentSubmissions)
      .where(and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, student.id)
      ))
      .limit(1);

    if (existing) {
      // Update submission
      const [updated] = await this.db
        .update(assignmentSubmissions)
        .set({
          fileUrl: dto.fileUrl ?? existing.fileUrl,
          submittedAt: new Date(),
        })
        .where(eq(assignmentSubmissions.id, existing.id))
        .returning();
      return updated;
    }

    // New submission
    const [submission] = await this.db
      .insert(assignmentSubmissions)
      .values({
        assignmentId,
        studentId: student.id,
        fileUrl: dto.fileUrl ?? null,
      })
      .returning();

    return submission;
  }

  async getSubmissions(assignmentId: string, userId: string, role: Role) {
    const assignment = await this.findOne(assignmentId);

    if (role === Role.TEACHER) {
      const [teacher] = await this.db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
      if (assignment.teacherId !== teacher?.id) {
        throw new ForbiddenException('You can only view submissions for your own assignments');
      }
    }

    // Get all students in the class
    const classStudents = await this.db
      .select({
        id: students.id,
        rollNumber: students.rollNumber,
        name: users.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.classId, assignment.classId))
      .orderBy(students.rollNumber);

    // Get all submissions for the assignment
    const submissions = await this.db
      .select()
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.assignmentId, assignmentId));

    const submissionMap = new Map(submissions.map(s => [s.studentId, s]));

    // Return a combined list so teacher can see who hasn't submitted
    return classStudents.map(student => {
      const sub = submissionMap.get(student.id);
      return {
        student,
        submission: sub || null,
        status: sub ? (sub.grade ? 'graded' : 'submitted') : 'pending',
      };
    });
  }

  async gradeSubmission(submissionId: string, dto: GradeSubmissionDto, userId: string) {
    const [submission] = await this.db
      .select({
        submission: assignmentSubmissions,
        assignment: assignments,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .where(eq(assignmentSubmissions.id, submissionId))
      .limit(1);

    if (!submission) throw new NotFoundException('Submission not found');

    const [teacher] = await this.db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    if (!teacher || submission.assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('Only the assigned teacher can grade this submission');
    }

    const [updated] = await this.db
      .update(assignmentSubmissions)
      .set({
        grade: dto.grade,
        feedback: dto.feedback ?? null,
        gradedBy: userId,
        gradedAt: new Date(),
      })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();

    return updated;
  }
}

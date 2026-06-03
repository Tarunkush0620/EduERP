import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { exams, examSubjects, results, teachers, students, classes, subjects, users, teacherAssignments } from '../../database/schema';
import { CreateExamDto, UpdateExamDto, EnterResultsDto } from './dto/exam.dto';
import { Role } from '@eduerp/shared';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(dto: CreateExamDto) {
    return await this.db.transaction(async (tx) => {
      // Create Exam
      const [exam] = await tx
        .insert(exams)
        .values({
          name: dto.name,
          classId: dto.classId,
          examType: dto.examType,
          startDate: dto.startDate,
          endDate: dto.endDate,
        })
        .returning();

      // Create Exam Subjects
      if (dto.subjects && dto.subjects.length > 0) {
        const subjectsData = dto.subjects.map(s => ({
          examId: exam.id,
          subjectId: s.subjectId,
          date: s.date,
          maxMarks: s.maxMarks ?? 100,
        }));
        await tx.insert(examSubjects).values(subjectsData);
      }

      this.logger.log(`Exam created: ${exam.name} for class ${exam.classId}`);
      return exam;
    });
  }

  async findAll() {
    return await this.db
      .select({
        id: exams.id,
        name: exams.name,
        examType: exams.examType,
        startDate: exams.startDate,
        endDate: exams.endDate,
        className: classes.name,
      })
      .from(exams)
      .innerJoin(classes, eq(exams.classId, classes.id))
      .orderBy(desc(exams.startDate));
  }

  async findOne(id: string) {
    const [exam] = await this.db
      .select({
        id: exams.id,
        name: exams.name,
        examType: exams.examType,
        startDate: exams.startDate,
        endDate: exams.endDate,
        classId: exams.classId,
        className: classes.name,
      })
      .from(exams)
      .innerJoin(classes, eq(exams.classId, classes.id))
      .where(eq(exams.id, id))
      .limit(1);

    if (!exam) throw new NotFoundException('Exam not found');

    const subs = await this.db
      .select({
        id: examSubjects.id,
        subjectId: examSubjects.subjectId,
        subjectName: subjects.name,
        date: examSubjects.date,
        maxMarks: examSubjects.maxMarks,
      })
      .from(examSubjects)
      .innerJoin(subjects, eq(examSubjects.subjectId, subjects.id))
      .where(eq(examSubjects.examId, id))
      .orderBy(examSubjects.date);

    return { ...exam, subjects: subs };
  }

  async findForTeacher(userId: string) {
    const [teacher] = await this.db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    if (!teacher) throw new ForbiddenException('Teacher not found');

    // Get classes the teacher teaches
    const assignedClasses = await this.db
      .selectDistinct({ classId: teacherAssignments.classId })
      .from(teacherAssignments)
      .where(eq(teacherAssignments.teacherId, teacher.id));

    if (assignedClasses.length === 0) return [];

    const classIds = assignedClasses.map(ac => ac.classId);

    return await this.db
      .select({
        id: exams.id,
        name: exams.name,
        examType: exams.examType,
        startDate: exams.startDate,
        endDate: exams.endDate,
        className: classes.name,
      })
      .from(exams)
      .innerJoin(classes, eq(exams.classId, classes.id))
      .where(inArray(exams.classId, classIds))
      .orderBy(desc(exams.startDate));
  }

  async enterResults(examSubjectId: string, dto: EnterResultsDto, userId: string, role: Role) {
    // Basic authorization check - ideally we'd check if the teacher actually teaches this subject
    if (role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot enter marks');
    }

    const [examSubject] = await this.db.select().from(examSubjects).where(eq(examSubjects.id, examSubjectId)).limit(1);
    if (!examSubject) throw new NotFoundException('Exam subject not found');

    return await this.db.transaction(async (tx) => {
      // We will upsert results based on studentId and examSubjectId
      // First, delete existing to simplify upsert logic (or we could use onConflictDoUpdate)
      const studentIds = dto.results.map(r => r.studentId);
      if (studentIds.length > 0) {
        await tx.delete(results)
          .where(and(
            eq(results.examSubjectId, examSubjectId),
            inArray(results.studentId, studentIds)
          ));
      }

      // Insert new
      const resultsData = dto.results.map(r => ({
        examSubjectId: examSubjectId,
        studentId: r.studentId,
        marksObtained: r.marksObtained,
        grade: r.grade ?? null,
        remarks: r.remarks ?? null,
      }));

      const inserted = await tx.insert(results).values(resultsData).returning();
      this.logger.log(`Entered ${inserted.length} results for exam subject ${examSubjectId}`);
      return { message: 'Results saved successfully', count: inserted.length };
    });
  }

  async getResults(examSubjectId: string) {
    return await this.db
      .select({
        id: results.id,
        studentId: results.studentId,
        studentName: users.name,
        rollNumber: students.rollNumber,
        marksObtained: results.marksObtained,
        grade: results.grade,
        remarks: results.remarks,
      })
      .from(results)
      .innerJoin(students, eq(results.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(results.examSubjectId, examSubjectId))
      .orderBy(students.rollNumber);
  }

  async getReportCard(studentId: string, userId: string, role: Role) {
    // If student, check if they are requesting their own
    if (role === Role.STUDENT) {
      const [me] = await this.db.select().from(students).where(eq(students.userId, userId)).limit(1);
      if (!me || me.id !== studentId) {
        throw new ForbiddenException('You can only view your own report card');
      }
    }

    const [student] = await this.db
      .select({
        id: students.id,
        rollNumber: students.rollNumber,
        name: users.name,
        className: classes.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) throw new NotFoundException('Student not found');

    const rawResults = await this.db
      .select({
        examName: exams.name,
        examType: exams.examType,
        subjectName: subjects.name,
        maxMarks: examSubjects.maxMarks,
        marksObtained: results.marksObtained,
        grade: results.grade,
      })
      .from(results)
      .innerJoin(examSubjects, eq(results.examSubjectId, examSubjects.id))
      .innerJoin(exams, eq(examSubjects.examId, exams.id))
      .innerJoin(subjects, eq(examSubjects.subjectId, subjects.id))
      .where(eq(results.studentId, studentId))
      .orderBy(exams.startDate, subjects.name);

    // Group by exam
    const examsMap = new Map();
    for (const r of rawResults) {
      if (!examsMap.has(r.examName)) {
        examsMap.set(r.examName, {
          name: r.examName,
          type: r.examType,
          subjects: [],
          totalMax: 0,
          totalObtained: 0,
        });
      }
      const exam = examsMap.get(r.examName);
      exam.subjects.push({
        name: r.subjectName,
        maxMarks: r.maxMarks,
        obtained: r.marksObtained,
        grade: r.grade,
      });
      exam.totalMax += r.maxMarks;
      exam.totalObtained += r.marksObtained;
    }

    const examList = Array.from(examsMap.values()).map(e => ({
      ...e,
      percentage: e.totalMax > 0 ? Math.round((e.totalObtained / e.totalMax) * 100 * 10) / 10 : 0,
    }));

    return {
      student,
      exams: examList,
    };
  }
}

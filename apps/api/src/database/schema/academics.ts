import { pgTable, uuid, varchar, text, timestamp, date, integer, pgEnum, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// ─── Enums ───────────────────────────────────────────────────
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late', 'excused']);
export const examTypeEnum = pgEnum('exam_type', ['unit_test', 'mid_term', 'final', 'practice']);
export const feeFrequencyEnum = pgEnum('fee_frequency', ['monthly', 'quarterly', 'semi_annual', 'annual', 'one_time']);
export const feeStatusEnum = pgEnum('fee_status', ['paid', 'pending', 'overdue', 'partial']);

// ─── Teachers ────────────────────────────────────────────────
export const teachers = pgTable('teachers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  employeeId: varchar('employee_id', { length: 50 }).notNull().unique(),
  department: varchar('department', { length: 100 }),
  qualification: varchar('qualification', { length: 200 }),
  joiningDate: date('joining_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Classes ─────────────────────────────────────────────────
export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Sections ────────────────────────────────────────────────
export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 10 }).notNull(),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Students ────────────────────────────────────────────────
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  rollNumber: varchar('roll_number', { length: 50 }).notNull(),
  classId: uuid('class_id').notNull().references(() => classes.id),
  sectionId: uuid('section_id').references(() => sections.id),
  admissionDate: date('admission_date').notNull(),
  parentName: varchar('parent_name', { length: 100 }),
  parentPhone: varchar('parent_phone', { length: 20 }),
  parentEmail: varchar('parent_email', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Subjects ────────────────────────────────────────────────
export const subjects = pgTable('subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Teacher Assignments (which teacher teaches which class+subject) ──
export const teacherAssignments = pgTable('teacher_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherId: uuid('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: uuid('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  sectionId: uuid('section_id').references(() => sections.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Attendance ──────────────────────────────────────────────
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => classes.id),
  subjectId: uuid('subject_id').references(() => subjects.id),
  date: date('date').notNull(),
  status: attendanceStatusEnum('status').notNull(),
  markedBy: uuid('marked_by').notNull().references(() => users.id),
  remarks: text('remarks'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Assignments ─────────────────────────────────────────────
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherId: uuid('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => classes.id),
  subjectId: uuid('subject_id').references(() => subjects.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  fileUrl: text('file_url'),
  deadline: timestamp('deadline', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Assignment Submissions ──────────────────────────────────
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignmentId: uuid('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  fileUrl: text('file_url'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  grade: varchar('grade', { length: 10 }),
  feedback: text('feedback'),
  gradedBy: uuid('graded_by').references(() => users.id),
  gradedAt: timestamp('graded_at', { withTimezone: true }),
});

// ─── Exams ───────────────────────────────────────────────────
export const exams = pgTable('exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  classId: uuid('class_id').notNull().references(() => classes.id),
  examType: examTypeEnum('exam_type').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Exam Subjects ───────────────────────────────────────────
export const examSubjects = pgTable('exam_subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  examId: uuid('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  subjectId: uuid('subject_id').notNull().references(() => subjects.id),
  date: date('date').notNull(),
  maxMarks: integer('max_marks').notNull().default(100),
});

// ─── Results ─────────────────────────────────────────────────
export const results = pgTable('results', {
  id: uuid('id').primaryKey().defaultRandom(),
  examSubjectId: uuid('exam_subject_id').notNull().references(() => examSubjects.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  marksObtained: integer('marks_obtained').notNull(),
  grade: varchar('grade', { length: 5 }),
  remarks: text('remarks'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Fee Structures ──────────────────────────────────────────
export const feeStructures = pgTable('fee_structures', {
  id: uuid('id').primaryKey().defaultRandom(),
  classId: uuid('class_id').notNull().references(() => classes.id),
  name: varchar('name', { length: 100 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  frequency: feeFrequencyEnum('frequency').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Fee Records ─────────────────────────────────────────────
export const feeRecords = pgTable('fee_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  feeStructureId: uuid('fee_structure_id').notNull().references(() => feeStructures.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),
  status: feeStatusEnum('status').notNull().default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Announcements ───────────────────────────────────────────
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  targetRole: varchar('target_role', { length: 20 }), // null = all, 'teacher', 'student'
  classId: uuid('class_id').references(() => classes.id), // null = all classes
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Messages ────────────────────────────────────────────────
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  receiverId: uuid('receiver_id').notNull().references(() => users.id),
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  read: timestamp('read', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Audit Log ───────────────────────────────────────────────
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(),
  entity: varchar('entity', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  oldValues: text('old_values'), // JSON string
  newValues: text('new_values'), // JSON string
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────
export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  assignments: many(teacherAssignments),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  section: one(sections, {
    fields: [students.sectionId],
    references: [sections.id],
  }),
  attendanceRecords: many(attendance),
  submittedAssignments: many(assignmentSubmissions),
  results: many(results),
  feeRecords: many(feeRecords),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  sections: many(sections),
  students: many(students),
  teacherAssignments: many(teacherAssignments),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  class: one(classes, {
    fields: [sections.classId],
    references: [classes.id],
  }),
  students: many(students),
}));

export const teacherAssignmentsRelations = relations(teacherAssignments, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherAssignments.teacherId],
    references: [teachers.id],
  }),
  class: one(classes, {
    fields: [teacherAssignments.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [teacherAssignments.subjectId],
    references: [subjects.id],
  }),
  section: one(sections, {
    fields: [teacherAssignments.sectionId],
    references: [sections.id],
  }),
}));

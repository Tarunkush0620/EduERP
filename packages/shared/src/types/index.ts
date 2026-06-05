import { Role } from '../enums/roles';
import { Permission } from '../enums/permissions';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export interface TokenPayload {
  sub: string; // userId
  email: string;
  role: Role;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  department?: string;
  qualification?: string;
  joiningDate: string;
  user?: User;
}

export interface Student {
  id: string;
  userId: string;
  rollNumber: string;
  classId: string;
  sectionId?: string;
  admissionDate: string;
  parentId?: string; // Link to the new Parent record
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  user?: User;
  parent?: Parent;
}

export interface Parent {
  id: string;
  userId: string;
  occupation?: string;
  address?: string;
  user?: User;
  children?: Student[];
}

export interface Class {
  id: string;
  name: string;
  sections: Section[];
  teacherId?: string;
  teacher?: Teacher;
}

export interface Section {
  id: string;
  name: string;
  classId: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Timetable {
  id: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  class?: Class;
  section?: Section;
  subject?: Subject;
  teacher?: Teacher;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  subjectId?: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  createdAt: string;
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export interface Assignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  deadline: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl?: string;
  submittedAt: string;
  grade?: string;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface Exam {
  id: string;
  name: string;
  classId: string;
  examType: ExamType;
  startDate: string;
  endDate: string;
}

export enum ExamType {
  UNIT_TEST = 'unit_test',
  MID_TERM = 'mid_term',
  FINAL = 'final',
  PRACTICE = 'practice',
}

export interface Result {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
}

export interface FeeStructure {
  id: string;
  classId: string;
  name: string;
  amount: number;
  frequency: FeeFrequency;
}

export enum FeeFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  ONE_TIME = 'one_time',
}

export interface FeeRecord {
  id: string;
  studentId: string;
  feeStructureId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: FeeStatus;
  paymentMethod?: string;
  transactionId?: string;
}

export enum FeeStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  role: z.enum(['super_admin', 'teacher', 'student']),
  phone: z.string().optional(),
});

export const createTeacherSchema = createUserSchema.extend({
  role: z.literal('teacher'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().optional(),
  qualification: z.string().optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
});

export const createStudentSchema = createUserSchema.extend({
  role: z.literal('student'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  classId: z.string().uuid('Invalid class ID'),
  sectionId: z.string().uuid('Invalid section ID').optional(),
  admissionDate: z.string().min(1, 'Admission date is required'),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email('Invalid parent email').optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

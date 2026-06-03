export enum Permission {
  // User Management
  CREATE_USER = 'create_user',
  READ_USERS = 'read_users',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Teacher Management
  CREATE_TEACHER = 'create_teacher',
  READ_TEACHERS = 'read_teachers',
  UPDATE_TEACHER = 'update_teacher',
  DELETE_TEACHER = 'delete_teacher',
  ASSIGN_TEACHER = 'assign_teacher',

  // Student Management
  CREATE_STUDENT = 'create_student',
  READ_STUDENTS = 'read_students',
  UPDATE_STUDENT = 'update_student',
  DELETE_STUDENT = 'delete_student',
  PROMOTE_STUDENT = 'promote_student',

  // Class & Subject Management
  CREATE_CLASS = 'create_class',
  UPDATE_CLASS = 'update_class',
  DELETE_CLASS = 'delete_class',
  CREATE_SUBJECT = 'create_subject',

  // Attendance
  MARK_ATTENDANCE = 'mark_attendance',
  EDIT_ATTENDANCE = 'edit_attendance',
  VIEW_ALL_ATTENDANCE = 'view_all_attendance',
  VIEW_OWN_ATTENDANCE = 'view_own_attendance',
  VIEW_CLASS_ATTENDANCE = 'view_class_attendance',

  // Assignments
  CREATE_ASSIGNMENT = 'create_assignment',
  GRADE_ASSIGNMENT = 'grade_assignment',
  SUBMIT_ASSIGNMENT = 'submit_assignment',
  VIEW_ASSIGNMENTS = 'view_assignments',

  // Exams & Results
  CREATE_EXAM = 'create_exam',
  ENTER_RESULTS = 'enter_results',
  VIEW_ALL_RESULTS = 'view_all_results',
  VIEW_OWN_RESULTS = 'view_own_results',
  GENERATE_REPORT_CARD = 'generate_report_card',

  // Finance
  MANAGE_FEE_STRUCTURE = 'manage_fee_structure',
  RECORD_PAYMENT = 'record_payment',
  VIEW_ALL_FEES = 'view_all_fees',
  VIEW_OWN_FEES = 'view_own_fees',
  MANAGE_EXPENSES = 'manage_expenses',

  // Communication
  CREATE_ANNOUNCEMENT = 'create_announcement',
  SEND_MESSAGE = 'send_message',
  VIEW_ANNOUNCEMENTS = 'view_announcements',

  // Reports
  VIEW_REPORTS = 'view_reports',
  GENERATE_REPORTS = 'generate_reports',

  // System Settings
  MANAGE_SETTINGS = 'manage_settings',

  // AI Features
  ACCESS_AI_INSIGHTS = 'access_ai_insights',
  USE_AI_ASSISTANT = 'use_ai_assistant',
}

/** Default permissions for each role */
export const RolePermissions: Record<string, Permission[]> = {
  super_admin: Object.values(Permission), // All permissions

  teacher: [
    Permission.MARK_ATTENDANCE,
    Permission.EDIT_ATTENDANCE,
    Permission.VIEW_CLASS_ATTENDANCE,
    Permission.CREATE_ASSIGNMENT,
    Permission.GRADE_ASSIGNMENT,
    Permission.VIEW_ASSIGNMENTS,
    Permission.ENTER_RESULTS,
    Permission.VIEW_ALL_RESULTS,
    Permission.CREATE_ANNOUNCEMENT,
    Permission.SEND_MESSAGE,
    Permission.VIEW_ANNOUNCEMENTS,
    Permission.READ_STUDENTS,
    Permission.USE_AI_ASSISTANT,
  ],

  student: [
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.SUBMIT_ASSIGNMENT,
    Permission.VIEW_ASSIGNMENTS,
    Permission.VIEW_OWN_RESULTS,
    Permission.VIEW_OWN_FEES,
    Permission.VIEW_ANNOUNCEMENTS,
    Permission.SEND_MESSAGE,
    Permission.USE_AI_ASSISTANT,
  ],
};

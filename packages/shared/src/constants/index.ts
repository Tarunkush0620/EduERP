export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    ROLE: (id: string) => `/users/${id}/role`,
  },
  TEACHERS: {
    BASE: '/teachers',
    BY_ID: (id: string) => `/teachers/${id}`,
    ASSIGN: (id: string) => `/teachers/${id}/assign`,
  },
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id: string) => `/students/${id}`,
    PROMOTE: (id: string) => `/students/${id}/promote`,
    TRANSFER: (id: string) => `/students/${id}/transfer`,
  },
  PARENTS: {
    BASE: '/parents',
    BY_ID: (id: string) => `/parents/${id}`,
    STUDENTS: '/parents/students', // get children for logged in parent
  },
  CLASSES: {
    BASE: '/classes',
    BY_ID: (id: string) => `/classes/${id}`,
    ASSIGN_TEACHER: (id: string) => `/classes/${id}/assign-teacher`,
  },
  SUBJECTS: {
    BASE: '/subjects',
    BY_ID: (id: string) => `/subjects/${id}`,
  },
  TIMETABLES: {
    BASE: '/timetables',
    BY_ID: (id: string) => `/timetables/${id}`,
    BY_CLASS: (classId: string) => `/timetables/class/${classId}`,
    BY_TEACHER: (teacherId: string) => `/timetables/teacher/${teacherId}`,
  },
  ATTENDANCE: {
    MARK: '/attendance/mark',
    BY_ID: (id: string) => `/attendance/${id}`,
    BY_CLASS: (classId: string) => `/attendance/class/${classId}`,
    BY_STUDENT: (studentId: string) => `/attendance/student/${studentId}`,
    REPORT: '/attendance/report',
  },
  ASSIGNMENTS: {
    BASE: '/assignments',
    BY_ID: (id: string) => `/assignments/${id}`,
    SUBMIT: (id: string) => `/assignments/${id}/submit`,
    GRADE: (id: string) => `/assignments/${id}/grade`,
    SUBMISSIONS: (id: string) => `/assignments/${id}/submissions`,
  },
  EXAMS: {
    BASE: '/exams',
    BY_ID: (id: string) => `/exams/${id}`,
    RESULTS: (id: string) => `/exams/${id}/results`,
    REPORT_CARD: (studentId: string) => `/exams/report-card/${studentId}`,
  },
  FEES: {
    STRUCTURE: '/fees/structure',
    BY_STUDENT: (studentId: string) => `/fees/students/${studentId}`,
    PAYMENT: '/fees/payment',
    REPORT: '/fees/report',
    DUE: '/fees/due',
  },
  ANNOUNCEMENTS: {
    BASE: '/announcements',
    BY_ID: (id: string) => `/announcements/${id}`,
  },
  MESSAGES: {
    BASE: '/messages',
    BY_ID: (id: string) => `/messages/${id}`,
  },
  DASHBOARD: {
    ADMIN: '/dashboard/admin',
    TEACHER: '/dashboard/teacher',
    PARENT: '/dashboard/parent',
    STUDENT: '/dashboard/student',
  },
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const APP_NAME = 'EduERP';

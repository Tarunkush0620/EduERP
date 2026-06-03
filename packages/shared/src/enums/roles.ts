export enum Role {
  SUPER_ADMIN = 'super_admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export const RoleHierarchy: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 3,
  [Role.TEACHER]: 2,
  [Role.STUDENT]: 1,
};

export const RoleLabels: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.TEACHER]: 'Teacher',
  [Role.STUDENT]: 'Student',
};

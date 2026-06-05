export enum Role {
  SUPER_ADMIN = 'super_admin',
  TEACHER = 'teacher',
  PARENT = 'parent',
  STUDENT = 'student',
}

export const RoleHierarchy: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 4,
  [Role.TEACHER]: 3,
  [Role.PARENT]: 2,
  [Role.STUDENT]: 1,
};

export const RoleLabels: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.TEACHER]: 'Teacher',
  [Role.PARENT]: 'Parent/Guardian',
  [Role.STUDENT]: 'Student',
};

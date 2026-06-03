import * as bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Permission as PermissionEnum, RolePermissions as DefaultRolePermissions } from '@eduerp/shared';
import { users, roles, permissions, rolePermissions } from '../schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://eduerp:eduerp_secret@localhost:5432/eduerp';

  console.log('🌱 Starting seed...');
  console.log(`📦 Connecting to: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    // ── 1. Create roles ──────────────────────────────────────
    console.log('📋 Creating roles...');
    const roleData = [
      { name: 'super_admin', description: 'Full system access, school owner' },
      { name: 'teacher', description: 'Academic and classroom management' },
      { name: 'student', description: 'Personal academic portal' },
    ];

    const insertedRoles: Record<string, string> = {};
    for (const role of roleData) {
      const existing = await db.select().from(roles).where(eq(roles.name, role.name));
      if (existing.length > 0) {
        insertedRoles[role.name] = existing[0].id;
        console.log(`  ↳ Role "${role.name}" already exists`);
      } else {
        const [inserted] = await db.insert(roles).values(role).returning();
        insertedRoles[role.name] = inserted.id;
        console.log(`  ✅ Created role: ${role.name}`);
      }
    }

    // ── 2. Create permissions ────────────────────────────────
    console.log('🔐 Creating permissions...');
    const permissionValues = Object.values(PermissionEnum);
    const insertedPermissions: Record<string, string> = {};

    for (const perm of permissionValues) {
      const module = perm.split('_').slice(0, -1).join('_'); // e.g. 'create_user' -> 'create'
      const existing = await db.select().from(permissions).where(eq(permissions.name, perm));
      if (existing.length > 0) {
        insertedPermissions[perm] = existing[0].id;
      } else {
        const [inserted] = await db.insert(permissions).values({
          name: perm,
          description: perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          module,
        }).returning();
        insertedPermissions[perm] = inserted.id;
      }
    }
    console.log(`  ✅ ${permissionValues.length} permissions ensured`);

    // ── 3. Assign permissions to roles ───────────────────────
    console.log('🔗 Assigning permissions to roles...');
    for (const [roleName, perms] of Object.entries(DefaultRolePermissions)) {
      const roleId = insertedRoles[roleName];
      if (!roleId) continue;

      for (const perm of perms) {
        const permId = insertedPermissions[perm];
        if (!permId) continue;

        const existing = await db
          .select()
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, roleId));

        const alreadyAssigned = existing.some(rp => rp.permissionId === permId);
        if (!alreadyAssigned) {
          await db.insert(rolePermissions).values({ roleId, permissionId: permId });
        }
      }
      console.log(`  ✅ ${roleName}: ${perms.length} permissions assigned`);
    }

    // ── 4. Create Super Admin user ───────────────────────────
    console.log('👑 Creating Super Admin...');
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@eduerp.com';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.SUPER_ADMIN_NAME || 'System Administrator';

    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail));
    if (existingAdmin.length > 0) {
      console.log(`  ↳ Super Admin "${adminEmail}" already exists`);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await db.insert(users).values({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'super_admin',
        status: 'active',
      });
      console.log(`  ✅ Super Admin created: ${adminEmail}`);
    }

    // ── 5. Create Demo Teacher ───────────────────────────────
    const teacherEmail = 'teacher@eduerp.com';
    const existingTeacher = await db.select().from(users).where(eq(users.email, teacherEmail));
    if (existingTeacher.length > 0) {
      console.log(`  ↳ Teacher "${teacherEmail}" already exists`);
    } else {
      const passwordHash = await bcrypt.hash('Teacher@123', 12);
      await db.insert(users).values({
        name: 'Demo Teacher',
        email: teacherEmail,
        passwordHash,
        role: 'teacher',
        status: 'active',
      });
      console.log(`  ✅ Demo Teacher created: ${teacherEmail}`);
    }

    // ── 6. Create Demo Student ───────────────────────────────
    const studentEmail = 'student@eduerp.com';
    const existingStudent = await db.select().from(users).where(eq(users.email, studentEmail));
    if (existingStudent.length > 0) {
      console.log(`  ↳ Student "${studentEmail}" already exists`);
    } else {
      const passwordHash = await bcrypt.hash('Student@123', 12);
      await db.insert(users).values({
        name: 'Demo Student',
        email: studentEmail,
        passwordHash,
        role: 'student',
        status: 'active',
      });
      console.log(`  ✅ Demo Student created: ${studentEmail}`);
    }

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();

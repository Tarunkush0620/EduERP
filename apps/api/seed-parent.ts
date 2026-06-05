import 'dotenv/config';
import { db } from './src/database/database';
import * as schema from './src/database/schema';
import * as bcrypt from 'bcrypt';

async function seedParent() {
  console.log('Seeding parent user...');
  const hashedPassword = await bcrypt.hash('password', 10);
  
  const [user] = await db.insert(schema.users).values({
    email: 'parent@eduerp.com',
    passwordHash: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
    role: 'parent',
    status: 'active'
  }).returning();

  await db.insert(schema.parents).values({
    userId: user.id,
    occupation: 'Software Engineer',
    address: '123 Main St'
  });

  console.log('Parent user seeded! Email: parent@eduerp.com | Password: password');
  process.exit(0);
}

seedParent().catch(console.error);

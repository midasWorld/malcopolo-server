import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  /** User */
  const users: Record<'alice' | 'bob', User> = {
    alice: await newUser('alice'),
    bob: await newUser('bob'),
  };

  /** EmailAuth */
  for (const name in users) {
    await newEmailAuth(users[name].id);
  }
}

export type EmailAuth = {
  id: number;
  token: string;
  userId: number;
};

async function newUser(name: string) {
  const email = `${name}@gmail.com`;
  return await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      emailVerified: new Date(),
      password: bcrypt.hashSync('1234', 12),
    },
  });
}

async function newEmailAuth(userId: number) {
  const token = uuidv4();
  return await prisma.emailAuth.upsert({
    where: { userId },
    update: {},
    create: {
      token,
      userId,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect;
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect;
    process.exit(1);
  });

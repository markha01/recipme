import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/connection';
import { users } from '../db/schema';
import { getConfig } from '../config';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string, email: string): string {
  const config = getConfig();
  return jwt.sign({ id: userId, email }, config.JWT_SECRET, { expiresIn: '30d' });
}

export async function registerUser(data: {
  email: string;
  username: string;
  displayName: string;
  password: string;
}) {
  const db = getDb();

  // Check uniqueness
  const existing = await db
    .select({ id: users.id, email: users.email, username: users.username })
    .from(users)
    .where(eq(users.email, data.email.toLowerCase()));

  if (existing.length > 0) {
    throw new Error('EMAIL_TAKEN');
  }

  const existingUsername = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, data.username.toLowerCase()));

  if (existingUsername.length > 0) {
    throw new Error('USERNAME_TAKEN');
  }

  const passwordHash = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      displayName: data.displayName,
      passwordHash,
    })
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  const token = signToken(user.id, user.email);
  return { token, user };
}

export async function loginUser(email: string, password: string) {
  const db = getDb();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));

  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const token = signToken(user.id, user.email);
  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
}

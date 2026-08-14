import type { AuthSession, StoredUser } from '../types/auth';

const USERS_KEY = 'be_auth_users';
const SESSION_KEY = 'be_auth_session';
const SEEDED_KEY = 'be_auth_seeded';

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`be:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function seedDefaultUsers(): Promise<void> {
  if (localStorage.getItem(SEEDED_KEY)) return;

  const adminHash = await hashPassword('Blessing2026!');
  const admin: StoredUser = {
    id: 'usr-admin-001',
    email: 'admin@blessing-event.com',
    name: 'Super Admin',
    role: 'super_admin',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    passwordHash: adminHash,
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([admin]));
  localStorage.setItem(SEEDED_KEY, '1');
}

export function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export { hashPassword };

import { isSupabaseEnabled } from '../lib/supabase';
import type { LoginCredentials, RegisterPayload, User } from '../types/auth';
import {
  clearSession,
  getSession,
  getUsers,
  hashPassword,
  saveUsers,
  seedDefaultUsers,
  setSession,
} from '../lib/authStorage';
import * as supabaseAuth from './supabaseAuthService';
import { v4 as uuidv4 } from 'uuid';
import type { AuthSession } from '../types/auth';

const SESSION_DAYS = 7;

function toPublicUser(stored: {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
}): User {
  return {
    id: stored.id,
    email: stored.email,
    name: stored.name,
    role: stored.role,
    phone: stored.phone,
    emailVerified: stored.emailVerified,
    createdAt: stored.createdAt,
  };
}

function createLocalSession(userId: string, role: User['role']): AuthSession {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return {
    token: uuidv4(),
    userId,
    role,
    expiresAt: expiresAt.toISOString(),
  };
}

async function localInitAuth(): Promise<void> {
  await seedDefaultUsers();
}

async function localRegister(payload: RegisterPayload): Promise<User> {
  await localInitAuth();
  const email = payload.email.trim().toLowerCase();
  const users = getUsers();

  if (users.some((u) => u.email === email)) {
    throw new Error('Un compte existe déjà avec cet email.');
  }

  const passwordHash = await hashPassword(payload.password);
  const user = {
    id: uuidv4(),
    email,
    name: payload.name.trim(),
    role: 'client' as const,
    phone: payload.phone?.trim(),
    emailVerified: false,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  users.push(user);
  saveUsers(users);
  setSession(createLocalSession(user.id, user.role));
  return toPublicUser(user);
}

async function localLogin(credentials: LoginCredentials): Promise<User> {
  await localInitAuth();
  const email = credentials.email.trim().toLowerCase();
  const found = getUsers().find((u) => u.email === email);

  if (!found) throw new Error('Email ou mot de passe incorrect.');

  const passwordHash = await hashPassword(credentials.password);
  if (found.passwordHash !== passwordHash) {
    throw new Error('Email ou mot de passe incorrect.');
  }

  setSession(createLocalSession(found.id, found.role));
  return toPublicUser(found);
}

function localLogout(): void {
  clearSession();
}

function localGetCurrentUser(): User | null {
  const session = getSession();
  if (!session) return null;

  const found = getUsers().find((u) => u.id === session.userId);
  if (!found) {
    clearSession();
    return null;
  }
  return toPublicUser(found);
}

/** Point d'entrée unique — bascule Supabase si configuré, sinon auth locale (démo) */
export async function initAuth(): Promise<User | null> {
  if (isSupabaseEnabled) return supabaseAuth.supabaseInitAuth();
  await localInitAuth();
  return localGetCurrentUser();
}

export async function register(payload: RegisterPayload): Promise<User> {
  if (isSupabaseEnabled) return supabaseAuth.supabaseRegister(payload);
  return localRegister(payload);
}

export async function login(credentials: LoginCredentials): Promise<User> {
  if (isSupabaseEnabled) return supabaseAuth.supabaseLogin(credentials);
  return localLogin(credentials);
}

export async function logout(): Promise<void> {
  if (isSupabaseEnabled) await supabaseAuth.supabaseLogout();
  else localLogout();
}

export async function getCurrentUser(): Promise<User | null> {
  if (isSupabaseEnabled) return supabaseAuth.supabaseGetCurrentUser();
  return localGetCurrentUser();
}

export async function getAccessToken(): Promise<string | null> {
  if (isSupabaseEnabled) return supabaseAuth.supabaseGetAccessToken();
  return getSession()?.token ?? null;
}

export function subscribeAuthChanges(callback: () => void): (() => void) | undefined {
  if (isSupabaseEnabled) return supabaseAuth.onSupabaseAuthChange(callback);
  return undefined;
}

export function authMode(): 'supabase' | 'local' {
  return isSupabaseEnabled ? 'supabase' : 'local';
}

import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import type { LoginCredentials, RegisterPayload, User, UserRole } from '../types/auth';
import { supabase } from '../lib/supabase';

const CONFIRM_EMAIL_PREFIX = 'CONFIRM_EMAIL:';

export function isEmailConfirmationRequiredError(message: string): boolean {
  return message.startsWith(CONFIRM_EMAIL_PREFIX);
}

export function emailConfirmationMessage(message: string): string {
  return message.slice(CONFIRM_EMAIL_PREFIX.length);
}

function mapAuthError(error: AuthError): string {
  const code = error.code ?? '';
  const msg = error.message.toLowerCase();

  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Email non confirmé. Consultez votre boîte mail et cliquez sur le lien de confirmation.';
  }
  return 'Email ou mot de passe incorrect.';
}

function parseRole(value: unknown): UserRole {
  if (value === 'super_admin' || value === 'staff' || value === 'client') {
    return value;
  }
  return 'client';
}

interface ProfileRow {
  name: string;
  role: string;
  phone: string | null;
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('name, role, phone')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export async function mapSupabaseUser(sbUser: SupabaseUser): Promise<User> {
  const profile = await fetchProfile(sbUser.id);

  return {
    id: sbUser.id,
    email: sbUser.email ?? '',
    name: profile?.name ?? (sbUser.user_metadata?.name as string) ?? sbUser.email?.split('@')[0] ?? 'Utilisateur',
    role: parseRole(profile?.role ?? sbUser.user_metadata?.role ?? sbUser.app_metadata?.role),
    phone: profile?.phone ?? (sbUser.user_metadata?.phone as string | undefined),
    emailVerified: Boolean(sbUser.email_confirmed_at),
    createdAt: sbUser.created_at,
  };
}

export async function supabaseInitAuth(): Promise<User | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ? mapSupabaseUser(session.user) : null;
}

export async function supabaseRegister(payload: RegisterPayload): Promise<User> {
  if (!supabase) throw new Error('Supabase non configuré.');

  const email = payload.email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: payload.password,
    options: {
      data: {
        name: payload.name.trim(),
        phone: payload.phone?.trim(),
        role: 'client',
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Inscription impossible.');

  if (!data.session) {
    throw new Error(
      `${CONFIRM_EMAIL_PREFIX}Compte créé. Vérifiez votre boîte mail et cliquez sur le lien de confirmation, puis connectez-vous.`
    );
  }

  return mapSupabaseUser(data.user);
}

export async function supabaseLogin(credentials: LoginCredentials): Promise<User> {
  if (!supabase) throw new Error('Supabase non configuré.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  });

  if (error) throw new Error(mapAuthError(error));
  if (!data.user) throw new Error('Connexion impossible.');

  return mapSupabaseUser(data.user);
}

export async function supabaseLogout(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

export async function supabaseGetCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return mapSupabaseUser(session.user);
}

export async function supabaseGetAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export function onSupabaseAuthChange(callback: () => void): (() => void) | undefined {
  if (!supabase) return undefined;
  const { data: { subscription } } = supabase.auth.onAuthStateChange(() => callback());
  return () => subscription.unsubscribe();
}

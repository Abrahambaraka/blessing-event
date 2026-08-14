/** Rôles plateforme Blessing Event (RBAC) */
export type UserRole = 'client' | 'staff' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  role: UserRole;
  expiresAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export type AppRoutePage =
  | 'home'
  | 'about'
  | 'services'
  | 'methodology'
  | 'contact'
  | 'events'
  | 'my-tickets'
  | 'checkin'
  | 'admin'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'event-detail'
  | 'checkout';

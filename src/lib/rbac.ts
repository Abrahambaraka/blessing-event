import type { AppRoutePage, UserRole } from '../types/auth';

/** Routes publiques — accessibles sans connexion */
export const PUBLIC_ROUTES: AppRoutePage[] = [
  'home',
  'about',
  'contact',
  'methodology',
  'login',
  'register',
  'events',
  'event-detail',
];

/** Espace client — billetterie, services, profil */
export const CLIENT_ROUTES: AppRoutePage[] = [
  'checkout',
  'my-tickets',
  'services',
  'dashboard',
];

/** Back-office administrateur */
export const ADMIN_ROUTES: AppRoutePage[] = ['admin'];

/** Contrôle d'accès staff */
export const STAFF_ROUTES: AppRoutePage[] = ['checkin'];

const ROLE_HIERARCHY: Record<UserRole, number> = {
  client: 1,
  staff: 2,
  super_admin: 3,
};

export function getRequiredRoles(page: AppRoutePage): UserRole[] | null {
  if (PUBLIC_ROUTES.includes(page)) return null;
  if (CLIENT_ROUTES.includes(page)) return ['client', 'staff', 'super_admin'];
  if (ADMIN_ROUTES.includes(page)) return ['super_admin'];
  if (STAFF_ROUTES.includes(page)) return ['staff', 'super_admin'];
  return null;
}

export function canAccessRoute(page: AppRoutePage, role: UserRole | null): boolean {
  const required = getRequiredRoles(page);
  if (!required) return true;
  if (!role) return false;
  return required.includes(role);
}

export function hasMinimumRole(userRole: UserRole, minimum: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimum];
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'staff':
      return 'Staff';
    default:
      return 'Client';
  }
}

/** Hash de retour après login (#login?return=events) */
export function buildLoginRedirect(returnPath: string): string {
  const clean = returnPath.replace(/^#?\/?/, '');
  return `#login?return=${encodeURIComponent(clean || 'dashboard')}`;
}

export function parseReturnPath(hash: string): string | null {
  const query = hash.split('?')[1];
  if (!query) return null;
  const params = new URLSearchParams(query);
  return params.get('return');
}

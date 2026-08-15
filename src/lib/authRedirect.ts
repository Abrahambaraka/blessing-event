const AUTH_RETURN_KEY = 'be_auth_return';

export function saveAuthReturn(path: string): void {
  const clean = path.replace(/^#?\/?/, '').split('?')[0] || 'dashboard';
  sessionStorage.setItem(AUTH_RETURN_KEY, clean);
}

export function consumeAuthReturn(): string | null {
  const value = sessionStorage.getItem(AUTH_RETURN_KEY);
  sessionStorage.removeItem(AUTH_RETURN_KEY);
  return value;
}

import React, { useEffect, useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { parseReturnPath } from '../src/lib/rbac';

interface LoginPageProps {
  hash: string;
  onNavigate: (path: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ hash, onNavigate }) => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnPath = parseReturnPath(hash) ?? 'dashboard';

  useEffect(() => {
    if (user) {
      const dest = user.role === 'super_admin' && returnPath === 'dashboard' ? 'admin' : returnPath;
      onNavigate(dest);
    }
  }, [user, returnPath, onNavigate]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
        <p className="text-slate-500 text-sm">Redirection...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login({ email, password });
      const dest = loggedIn.role === 'super_admin' && returnPath === 'dashboard' ? 'admin' : returnPath;
      onNavigate(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-md">
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="bg-navy px-8 py-10 text-center text-white">
            <LogIn className="mx-auto mb-4 text-gold" size={36} />
            <h1 className="font-serif text-2xl md:text-3xl">Connexion</h1>
            <p className="text-slate-400 text-sm mt-2">Accédez à votre espace client Blessing Event</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs uppercase tracking-widest text-navy font-bold mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-gold outline-none"
                placeholder="vous@email.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs uppercase tracking-widest text-navy font-bold mb-2">
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-gold outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-navy text-white font-bold tracking-widest uppercase text-xs hover:bg-gold transition-custom disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Pas encore de compte ?{' '}
              <a href={`#register?return=${encodeURIComponent(returnPath)}`} className="text-gold font-semibold hover:underline">
                Créer un compte
              </a>
            </p>

            <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4">
              Admin démo : admin@blessing-event.com / Blessing2026!
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

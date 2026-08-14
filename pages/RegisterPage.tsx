import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { parseReturnPath } from '../src/lib/rbac';

interface RegisterPageProps {
  hash: string;
  onNavigate: (path: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ hash, onNavigate }) => {
  const { register, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnPath = parseReturnPath(hash) ?? 'dashboard';

  useEffect(() => {
    if (user) onNavigate(returnPath);
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
      await register({ name, email, password, phone: phone || undefined });
      onNavigate(returnPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-md">
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="bg-navy px-8 py-10 text-center text-white">
            <UserPlus className="mx-auto mb-4 text-gold" size={36} />
            <h1 className="font-serif text-2xl md:text-3xl">Créer un compte</h1>
            <p className="text-slate-400 text-sm mt-2">Rejoignez Blessing Event pour acheter vos billets</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="reg-name" className="block text-xs uppercase tracking-widest text-navy font-bold mb-2">
                Nom complet
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-gold outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs uppercase tracking-widest text-navy font-bold mb-2">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-gold outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs uppercase tracking-widest text-navy font-bold mb-2">
                Téléphone (optionnel)
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-gold outline-none"
                placeholder="+243..."
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs uppercase tracking-widest text-navy font-bold mb-2">
                Mot de passe
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-gold outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gold text-white font-bold tracking-widest uppercase text-xs hover:bg-navy transition-custom disabled:opacity-50"
            >
              {loading ? 'Création...' : "S'inscrire"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Déjà inscrit ?{' '}
              <a href={`#login?return=${encodeURIComponent(returnPath)}`} className="text-gold font-semibold hover:underline">
                Se connecter
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

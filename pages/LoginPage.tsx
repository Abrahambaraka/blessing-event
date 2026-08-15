import React, { useEffect, useState } from 'react';
import GoogleSignInButton from '../src/components/auth/GoogleSignInButton';
import { useAuth } from '../src/contexts/AuthContext';
import { consumeAuthReturn } from '../src/lib/authRedirect';
import { parseReturnPath } from '../src/lib/rbac';

interface LoginPageProps {
  hash: string;
  onNavigate: (path: string) => void;
  mode?: 'login' | 'register';
}

const LoginPage: React.FC<LoginPageProps> = ({ hash, onNavigate, mode = 'login' }) => {
  const { loginWithGoogle, user, authMode } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnPath = parseReturnPath(hash) ?? 'dashboard';

  useEffect(() => {
    if (!user) return;

    const savedReturn = consumeAuthReturn();
    const dest =
      user.role === 'super_admin' && (savedReturn ?? returnPath) === 'dashboard'
        ? 'admin'
        : savedReturn ?? returnPath;

    onNavigate(dest);
  }, [user, returnPath, onNavigate]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
        <p className="text-slate-500 text-sm">Redirection...</p>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(returnPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion Google impossible.');
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="pt-24 md:pt-32 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-md">
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="bg-navy px-8 py-10 text-center text-white">
            <img
              src="/logo.png?v=4"
              alt="Blessing Event"
              className="h-16 w-auto mx-auto mb-4 object-contain bg-transparent"
            />
            <h1 className="font-serif text-2xl md:text-3xl">
              {isRegister ? 'Créer un compte' : 'Connexion'}
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {isRegister
                ? 'Inscrivez-vous avec votre compte Google pour acheter vos billets'
                : 'Connectez-vous avec Google pour accéder à votre espace'}
            </p>
          </div>

          <div className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
            )}

            {authMode === 'local' ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded text-sm">
                Connexion Google indisponible en mode local. Configurez{' '}
                <code className="text-xs">VITE_SUPABASE_URL</code> et{' '}
                <code className="text-xs">VITE_SUPABASE_ANON_KEY</code>.
              </div>
            ) : (
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                loading={loading}
                label={isRegister ? "S'inscrire avec Google" : 'Continuer avec Google'}
              />
            )}

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              En continuant, vous acceptez nos conditions d&apos;utilisation. Seuls les comptes Google sont
              autorisés.
            </p>

            {!isRegister && (
              <p className="text-center text-sm text-slate-500">
                Première visite ?{' '}
                <a
                  href={`#register?return=${encodeURIComponent(returnPath)}`}
                  className="text-gold font-semibold hover:underline"
                >
                  Créer un compte avec Google
                </a>
              </p>
            )}

            {isRegister && (
              <p className="text-center text-sm text-slate-500">
                Déjà inscrit ?{' '}
                <a
                  href={`#login?return=${encodeURIComponent(returnPath)}`}
                  className="text-gold font-semibold hover:underline"
                >
                  Se connecter
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

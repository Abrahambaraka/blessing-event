import React, { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { AppRoutePage } from '../../types/auth';
import { canAccessRoute, buildLoginRedirect } from '../../lib/rbac';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  page: AppRoutePage;
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  loginRedirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  page,
  children,
  onNavigate,
  loginRedirectPath,
}) => {
  const { user, isLoading } = useAuth();
  const returnPath = loginRedirectPath ?? page;

  useEffect(() => {
    if (!isLoading && !user) {
      onNavigate(buildLoginRedirect(returnPath).replace('#', ''));
    }
  }, [isLoading, user, onNavigate, returnPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20 px-4">
        <p className="text-slate-500 text-sm">Redirection vers la connexion...</p>
      </div>
    );
  }

  if (!canAccessRoute(page, user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20 px-4">
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm max-w-md text-center">
          <ShieldAlert className="text-gold mx-auto mb-4" size={40} />
          <h1 className="font-serif text-2xl text-navy mb-2">Accès refusé</h1>
          <p className="text-slate-500 text-sm mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <a
            href="#dashboard"
            className="inline-block px-6 py-3 bg-navy text-white text-xs font-bold uppercase tracking-widest rounded-lg"
          >
            Retour à mon espace
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

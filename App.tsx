
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import MethodologyPage from './pages/MethodologyPage';
import ContactPage from './pages/ContactPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import MyTicketsPage from './pages/MyTicketsPage';
import CheckInPage from './pages/CheckInPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ProtectedRoute from './src/components/auth/ProtectedRoute';
import { useScrollReveal } from './src/hooks/useScrollReveal';
import type { AppRoutePage } from './src/types/auth';

type Route =
  | { page: 'home' | 'about' | 'services' | 'methodology' | 'contact' | 'events' | 'my-tickets' | 'checkin' | 'admin' | 'login' | 'register' | 'dashboard' }
  | { page: 'event-detail'; slug: string }
  | { page: 'checkout'; slug: string };

function parseHash(hash: string): Route {
  const raw = hash.replace('#', '').replace(/^\//, '') || 'home';
  const path = raw.split('?')[0];

  if (path.startsWith('events/')) {
    const slug = path.slice('events/'.length);
    if (slug) return { page: 'event-detail', slug };
  }
  if (path.startsWith('checkout/')) {
    const slug = path.slice('checkout/'.length);
    if (slug) return { page: 'checkout', slug };
  }

  const staticPages = [
    'home', 'about', 'services', 'methodology', 'contact',
    'events', 'my-tickets', 'checkin', 'admin',
    'login', 'register', 'dashboard',
  ] as const;

  if ((staticPages as readonly string[]).includes(path)) {
    return { page: path as Route['page'] };
  }

  return { page: 'home' };
}

function routeToPageId(route: Route): string {
  if (route.page === 'event-detail') return 'events';
  if (route.page === 'checkout') return 'events';
  if (route.page === 'dashboard') return 'dashboard';
  if (route.page === 'login' || route.page === 'register') return route.page;
  return route.page;
}

const AUTH_LAYOUT_PAGES = new Set(['login', 'register']);

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>({ page: 'home' });
  const [hash, setHash] = useState(window.location.hash);

  const navigate = useCallback((path: string) => {
    window.location.hash = path.startsWith('#') ? path : `#${path.replace(/^\//, '')}`;
  }, []);

  const handleHashChange = useCallback(() => {
    setHash(window.location.hash);
    setRoute(parseHash(window.location.hash));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  useScrollReveal(routeToPageId(route));

  const wrapProtected = (page: AppRoutePage, node: React.ReactNode, redirectPath?: string) => (
    <ProtectedRoute page={page} onNavigate={navigate} loginRedirectPath={redirectPath}>
      {node}
    </ProtectedRoute>
  );

  const renderPage = () => {
    switch (route.page) {
      case 'about':
        return <AboutPage />;
      case 'services':
        return wrapProtected('services', <ServicesPage />);
      case 'methodology':
        return <MethodologyPage />;
      case 'contact':
        return <ContactPage />;
      case 'events':
        return <EventsPage onNavigate={navigate} />;
      case 'event-detail':
        return <EventDetailPage eventSlug={route.slug} onNavigate={navigate} />;
      case 'checkout':
        return wrapProtected('checkout', <CheckoutPage eventSlug={route.slug} onNavigate={navigate} />, `checkout/${route.slug}`);
      case 'my-tickets':
        return wrapProtected('my-tickets', <MyTicketsPage />);
      case 'checkin':
        return wrapProtected('checkin', <CheckInPage />);
      case 'admin':
        return wrapProtected('admin', <AdminPage />);
      case 'login':
        return <LoginPage hash={hash} onNavigate={navigate} />;
      case 'register':
        return <RegisterPage hash={hash} onNavigate={navigate} />;
      case 'dashboard':
        return wrapProtected('dashboard', <ClientDashboardPage />);
      default:
        return <HomePage />;
    }
  };

  const hideChrome = AUTH_LAYOUT_PAGES.has(route.page);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar currentPage={routeToPageId(route)} onNavigate={navigate} />
      <main className="flex-grow pt-0">
        {renderPage()}
      </main>
      {!hideChrome && <Footer onNavigate={navigate} />}
    </div>
  );
};

export default App;

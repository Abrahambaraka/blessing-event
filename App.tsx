
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
import { useScrollReveal } from './src/hooks/useScrollReveal';
import { seedDemoDataIfNeeded } from './src/lib/storage';

type Route =
  | { page: 'home' | 'about' | 'services' | 'methodology' | 'contact' | 'events' | 'my-tickets' | 'checkin' | 'admin' }
  | { page: 'event-detail'; slug: string }
  | { page: 'checkout'; slug: string };

function parseHash(hash: string): Route {
  const path = hash.replace('#', '').replace(/^\//, '') || 'home';

  if (path.startsWith('events/')) {
    const slug = path.slice('events/'.length);
    if (slug) return { page: 'event-detail', slug };
  }
  if (path.startsWith('checkout/')) {
    const slug = path.slice('checkout/'.length);
    if (slug) return { page: 'checkout', slug };
  }

  const staticPages = ['home', 'about', 'services', 'methodology', 'contact', 'events', 'my-tickets', 'checkin', 'admin'] as const;
  if ((staticPages as readonly string[]).includes(path)) {
    return { page: path as Route['page'] };
  }

  return { page: 'home' };
}

function routeToPageId(route: Route): string {
  if (route.page === 'event-detail') return 'events';
  if (route.page === 'checkout') return 'events';
  return route.page;
}

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>({ page: 'home' });

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  const handleHashChange = useCallback(() => {
    const parsed = parseHash(window.location.hash);
    setRoute(parsed);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    seedDemoDataIfNeeded();
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  useScrollReveal(routeToPageId(route));

  const renderPage = () => {
    switch (route.page) {
      case 'about': return <AboutPage />;
      case 'services': return <ServicesPage />;
      case 'methodology': return <MethodologyPage />;
      case 'contact': return <ContactPage />;
      case 'events': return <EventsPage onNavigate={navigate} />;
      case 'event-detail': return <EventDetailPage eventSlug={route.slug} onNavigate={navigate} />;
      case 'checkout': return <CheckoutPage eventSlug={route.slug} onNavigate={navigate} />;
      case 'my-tickets': return <MyTicketsPage />;
      case 'checkin': return <CheckInPage />;
      case 'admin': return <AdminPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar currentPage={routeToPageId(route)} />
      <main className="flex-grow pt-0">
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default App;

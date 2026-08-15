
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './src/contexts/AuthContext';
import './index.css';

/** Force le rechargement une fois après déploiement (évite l'ancien JS en cache) */
const CACHE_BUST_KEY = 'be_app_cache_v';
const CACHE_BUST_VERSION = '4';
if (localStorage.getItem(CACHE_BUST_KEY) !== CACHE_BUST_VERSION) {
  localStorage.setItem(CACHE_BUST_KEY, CACHE_BUST_VERSION);
  const url = new URL(window.location.href);
  if (url.searchParams.get('be_v') !== CACHE_BUST_VERSION) {
    url.searchParams.set('be_v', CACHE_BUST_VERSION);
    window.location.replace(url.toString());
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

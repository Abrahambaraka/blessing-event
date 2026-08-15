import React from 'react';
import LoginPage from './LoginPage';

interface RegisterPageProps {
  hash: string;
  onNavigate: (path: string) => void;
}

/** Inscription Google uniquement — même écran que la connexion */
const RegisterPage: React.FC<RegisterPageProps> = (props) => (
  <LoginPage {...props} mode="register" />
);

export default RegisterPage;

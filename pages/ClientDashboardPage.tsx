import React from 'react';
import { Calendar, Ticket, Briefcase, User, Vote } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { roleLabel } from '../src/lib/rbac';

const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Événements',
      desc: 'Découvrir, acheter des billets et participer aux votes',
      href: '#events',
      icon: Calendar,
    },
    {
      title: 'Mes billets',
      desc: 'QR codes, historique d\'achats et e-billets',
      href: '#my-tickets',
      icon: Ticket,
    },
    {
      title: 'Services',
      desc: 'Catalogue détaillé et demandes de devis',
      href: '#services',
      icon: Briefcase,
    },
    {
      title: 'Votes',
      desc: 'Suivi de vos participations aux votes payants',
      href: '#events',
      icon: Vote,
    },
  ];

  return (
    <div className="pt-24 md:pt-28 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <p className="text-gold text-xs uppercase tracking-[0.2em] font-bold mb-2">Espace Client</p>
          <h1 className="font-serif text-2xl md:text-4xl text-navy">
            Bonjour, {user?.name?.split(' ')[0] ?? 'Client'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {user?.email} · {user ? roleLabel(user.role) : ''}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {cards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-gold/30 transition-custom group"
            >
              <card.icon className="text-gold mb-4 group-hover:scale-110 transition-transform" size={28} />
              <h2 className="font-bold text-navy mb-2">{card.title}</h2>
              <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-navy" size={24} />
            <h2 className="font-serif text-xl text-navy">Mon profil</h2>
          </div>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-400 text-xs uppercase tracking-widest mb-1">Nom</dt>
              <dd className="text-navy font-medium">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-slate-400 text-xs uppercase tracking-widest mb-1">Email</dt>
              <dd className="text-navy font-medium">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-slate-400 text-xs uppercase tracking-widest mb-1">Téléphone</dt>
              <dd className="text-navy font-medium">{user?.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400 text-xs uppercase tracking-widest mb-1">Compte créé</dt>
              <dd className="text-navy font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;

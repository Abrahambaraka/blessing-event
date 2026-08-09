import type { Event } from '../types/ticketing';

const now = new Date();
const inDays = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const DEMO_EVENTS: Event[] = [
  {
    id: 'evt-gala-des-amours-2026',
    slug: 'gala-des-amours',
    title: 'Gala des Amours',
    description:
      'Présenté par JOSH ÉVENTS. Thème : « Quand l\'amour devient une responsabilité ». Une soirée d\'exception alliant élégance, spectacle et célébration. Réservations : +243 859 222 432 / +243 810 891 825.',
    date: '2026-06-26T16:00:00.000Z',
    venue: 'Chapiteau Baraka 2',
    city: 'Lubumbashi',
    imageUrl: '/gala-des-amours.png',
    status: 'published',
    capacity: 500,
    feeMode: 'buyer',
    currency: 'USD',
    ticketTypes: [
      { id: 'tt-gala-amours-sdr', name: 'SDR', description: 'Entrée standard — accès au gala', price: 50, quantity: 350, sold: 127 },
      { id: 'tt-gala-amours-vip', name: 'VIP', description: 'Entrée premium — placement privilégié', price: 100, quantity: 100, sold: 34 },
      { id: 'tt-gala-amours-presta-standard', name: 'Prestation Standard', description: 'Candidature mannequin/styliste — passage scène 7 min', price: 50, quantity: 30, sold: 11 },
      { id: 'tt-gala-amours-presta-gold', name: 'Prestation Gold', description: 'Candidature mannequin/styliste — passage scène 10 min', price: 70, quantity: 20, sold: 6 },
      { id: 'tt-gala-amours-presta-premium', name: 'Prestation Premium', description: 'Passage scène 15 min + mise en avant spéciale', price: 100, quantity: 15, sold: 4 },
    ],
    createdAt: inDays(-3),
    updatedAt: inDays(0),
  },
  {
    id: 'evt-ad-plenitudinem-2026',
    slug: 'ad-plenitudinem',
    title: 'AD PLENITUDINEM — Vers la Plénitude',
    description:
      'Conférence organisée par Jeunes + Réveillons-Nous. Thème : « Vers la Plénitude ». Avec Joseph Mwinkeu, Rebecca Faila, Billy Makela, Claude Mbuyi, Hon. Benatar Chilufia Mathilda, et Jérémie Yav Mbang (initiateur). Humour & musique au programme. Info : +243 99 381 0168 / +243 891 019 721.',
    date: '2026-07-05T11:00:00.000Z',
    venue: 'Salle Elika — 29 Av. Lubembe, Q/Golf Lido (Réf. Ancienne Résidence Kazembe)',
    city: 'Lubumbashi',
    imageUrl: '/ad-plenitudinem.png',
    status: 'published',
    capacity: 400,
    feeMode: 'buyer',
    currency: 'CDF',
    ticketTypes: [
      {
        id: 'tt-pleni-standard',
        name: 'Entrée Standard',
        description: 'Droit d\'entrée — accès conférence',
        price: 10000,
        currency: 'CDF',
        quantity: 300,
        sold: 89,
      },
      {
        id: 'tt-pleni-vip',
        name: 'VIP',
        description: 'Placement privilégié — accès lounge & réseautage',
        price: 50,
        currency: 'USD',
        quantity: 80,
        sold: 22,
      },
    ],
    createdAt: inDays(-5),
    updatedAt: inDays(0),
  },
  {
    id: 'evt-concert-2026',
    slug: 'concert-gospel-plein-air',
    title: 'Concert Gospel en Plein Air',
    description:
      'Une soirée musicale gratuite sous les étoiles. Artistes locaux et internationaux. Entrée libre sur inscription.',
    date: inDays(20),
    venue: 'Stade TP Mazembe — Esplanade',
    city: 'Lubumbashi',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    status: 'published',
    capacity: 2000,
    feeMode: 'buyer',
    currency: 'USD',
    ticketTypes: [
      { id: 'tt-concert-free', name: 'Entrée gratuite', description: 'Réservation obligatoire', price: 0, quantity: 2000, sold: 856 },
    ],
    createdAt: inDays(-10),
    updatedAt: inDays(0),
  },
  {
    id: 'evt-mariage-demo',
    slug: 'mariage-royal-demo',
    title: 'Mariage Royal — Cérémonie & Réception (Démo)',
    description:
      'Événement privé de démonstration pour la billetterie Blessing Event. Gestion RSVP et contrôle d\'accès QR.',
    date: inDays(90),
    venue: 'Domaine La Plaine Verte',
    city: 'Lubumbashi',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    status: 'published',
    capacity: 150,
    feeMode: 'organizer',
    currency: 'EUR',
    ticketTypes: [
      { id: 'tt-wed-invite', name: 'Invitation', description: 'Cérémonie + réception', price: 0, quantity: 120, sold: 45 },
      { id: 'tt-wed-guest', name: 'Invité +1', description: 'Accompagnant confirmé', price: 25, quantity: 30, sold: 8 },
    ],
    createdAt: inDays(-5),
    updatedAt: inDays(0),
  },
];


import React from 'react';
import { ShieldCheck, Star, Clock, Lightbulb, Users, Heart, Utensils, Palette, Smartphone, Flower2 } from 'lucide-react';
import { Service, Value } from './types';

export const SERVICES: Service[] = [
  {
    id: 'protocol',
    title: 'Pôle Accueil & Protocole',
    subtitle: 'Le premier sourire, la première impression.',
    description: 'Nos hôtesses et agents de protocole sont des ambassadeurs formés aux codes de la haute étiquette : accueil personnalisé, service VIP, placement stratégique et gestion de sécurité discrète.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
    icon: 'Users'
  },
  {
    id: 'weddings',
    title: 'Cérémonies & Mariages',
    subtitle: "Orchestrer l'inoubliable.",
    description: "Nous devenons le chef d'orchestre de vos émotions : rétroplanning précis, coordination du Jour J, et respect des rites propres à chaque culture ou religion.",
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
    icon: 'Heart'
  },
  {
    id: 'catering',
    title: 'Service Traiteur & Gastronomie',
    subtitle: "Une signature gustative d'exception.",
    description: 'Cocktails dînatoires créatifs, dîners de Gala servis à la cloche, et sélection exclusive de produits frais pour éveiller les sens.',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800',
    icon: 'Utensils'
  },
  {
    id: 'decoration',
    title: 'Décoration & Scénographie',
    subtitle: "Sublimer l'espace.",
    description: "Nous ne décorons pas une salle, nous créons une atmosphère. Grâce à notre bureau de design, nous concevons des univers visuels cohérents (bohème, royal, minimaliste).",
    image: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=800',
    icon: 'Palette'
  },
  {
    id: 'digital',
    title: 'Digital & Invitations',
    subtitle: "L'innovation au service de l'émotion.",
    description: 'Invitations animées, gestion RSVP en temps réel, et accès par QR Code pour un accueil fluide et sécurisé.',
    image: '/branding-blessing.png',
    icon: 'Smartphone'
  },
  {
    id: 'funeral',
    title: 'Protocole Funéraire',
    subtitle: 'Honorer la mémoire avec dignité.',
    description: 'Organisation complète de cérémonies funéraires avec respect des traditions : coordination logistique, protocole de deuil, aménagement floral et accompagnement des familles dans ces moments sensibles.',
    image: '/equipe-protocole.png',
    icon: 'Flower2'
  }
];

export const VALUES: Value[] = [
  {
    id: 'integrity',
    title: "L'Intégrité",
    description: "Une transparence totale dans nos processus et nos tarifs.",
    icon: 'ShieldCheck'
  },
  {
    id: 'refinement',
    title: 'Le Raffinement',
    description: 'Une esthétique soignée, du choix des fleurs à la tenue de nos hôtesses.',
    icon: 'Star'
  },
  {
    id: 'rigor',
    title: 'La Rigueur',
    description: 'Une ponctualité et un respect des codes protocolaires sans faille.',
    icon: 'Clock'
  },
  {
    id: 'innovation',
    title: "L'Innovation",
    description: "L'intégration de la technologie pour fluidifier l'expérience de vos invités.",
    icon: 'Lightbulb'
  }
];

export const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  Star,
  Clock,
  Lightbulb,
  Users,
  Heart,
  Utensils,
  Palette,
  Smartphone,
  Flower2
};

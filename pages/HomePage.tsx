
import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Values from '../components/Values';
import Services from '../components/Services';
import Methodology from '../components/Methodology';
import Contact from '../components/Contact';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <About />
      <Values />
      <Services />
      <div className="py-12 md:py-24 bg-navy text-center border-y border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl md:text-3xl lg:text-5xl font-serif text-white italic mb-6 md:mb-10 leading-snug max-w-4xl mx-auto px-4">
            "Faire de chaque événement une bénédiction mémorable."
          </h2>
          <div className="inline-block px-6 md:px-8 py-1 border-y border-gold text-gold tracking-wide md:tracking-widest uppercase text-[10px] md:text-xs">
            Excellence & Distinction
          </div>
        </div>
      </div>
      <Methodology />
      <Contact />
    </>
  );
};

export default HomePage;

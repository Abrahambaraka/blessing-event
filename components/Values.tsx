
import React from 'react';
import { VALUES, ICON_MAP } from '../constants';

const Values: React.FC = () => {
  return (
    <section className="py-24 bg-navy text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="reveal-fade-up text-3xl md:text-5xl font-bold mb-4" data-delay="0ms">Nos Valeurs Fondamentales</h2>
        <div className="reveal-fade-up w-24 h-1 bg-gold mx-auto mb-16" data-delay="150ms"></div>

        <div className="grid md:grid-cols-4 gap-12">
          {VALUES.map((val, index) => {
            const Icon = ICON_MAP[val.icon];
            return (
              <div 
                key={val.id} 
                className="reveal-fade-up group p-8 border border-white/10 hover:border-gold transition-custom hover:bg-white/5"
                data-delay={`${index * 150}ms`}
              >

                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-white transition-custom">
                    <Icon size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4">{val.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{val.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Values;

import { useEffect, useRef } from 'react';

export const useScrollReveal = (currentPage?: string) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            if (target.dataset.delay) {
              target.style.setProperty('--delay', target.dataset.delay);
            }
            target.classList.add('is-visible');
            observer.unobserve(target);
          }
        });
      },
      {
        root: null,
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observerRef.current = observer;

    const observeNew = () => {
      document.querySelectorAll('.reveal-fade-up:not(.is-visible)').forEach((el) => {
        observer.observe(el);
      });
    };

    observeNew();

    // Ré-observer les éléments chargés dynamiquement (ex: cartes événements)
    const mutationObserver = new MutationObserver(() => {
      observeNew();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Filet de sécurité : forcer la visibilité après chargement async
    const fallbackTimer = window.setTimeout(() => {
      document.querySelectorAll('.reveal-fade-up:not(.is-visible)').forEach((el) => {
        el.classList.add('is-visible');
      });
    }, 800);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.clearTimeout(fallbackTimer);
      observerRef.current = null;
    };
  }, [currentPage]);
};

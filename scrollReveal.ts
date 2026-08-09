/**
 * Blessing Event - Scroll Reveal Handler (Native JS Intersection Observer)
 * Ce script initialise l'Intersection Observer pour déclencher les animations de défilement.
 * Il gère également automatiquement l'effet de cascade (stagger) pour les enfants
 * des conteneurs portant la classe 'stagger-container'.
 */

export const initScrollReveal = (): (() => void) => {
  // Configuration de l'observer
  const observerOptions: IntersectionObserverInit = {
    root: null, // viewport par défaut
    rootMargin: '0px 0px -8% 0px', // Déclenchement avant l'apparition complète pour fluidité
    threshold: 0.05 // Déclenche dès que 5% est visible
  };

  // Création de l'observer
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Ajouter la classe pour déclencher la transition CSS
        entry.target.classList.add('is-visible');
        // Optionnel: Cesser d'observer l'élément pour éviter les recalculs répétitifs
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Cibler tous les éléments d'animation
  const elements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-in');
  elements.forEach(element => {
    observer.observe(element);
  });

  // Calcul automatique du stagger pour les éléments enfants dans un conteneur 'stagger-container'
  const staggerContainers = document.querySelectorAll('.stagger-container');
  staggerContainers.forEach(container => {
    const items = container.querySelectorAll('.reveal-fade-up');
    items.forEach((item, index) => {
      const htmlItem = item as HTMLElement;
      // On n'applique le délai auto que s'il n'a pas été défini manuellement en inline CSS
      if (!htmlItem.style.getPropertyValue('--delay')) {
        htmlItem.style.setProperty('--delay', `${index * 0.12}s`);
      }
    });
  });

  // Renvoie une fonction de nettoyage pour déconnecter l'observer
  return () => {
    observer.disconnect();
  };
};

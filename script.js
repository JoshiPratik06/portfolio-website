document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();

  const navbar = document.querySelector('.navbar');
  const menuButton = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];

  const getCurrentSectionId = () => {
    let currentId = sections[0]?.id;
    const scrollPosition = window.scrollY + 130;

    sections.forEach(section => {
      if (scrollPosition >= section.offsetTop) {
        currentId = section.id;
      }
    });

    return currentId;
  };

  const updateNavigation = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 16);
    const current = getCurrentSectionId();
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  };

  window.addEventListener('scroll', updateNavigation, { passive: true });
  updateNavigation();

  menuButton?.addEventListener('click', () => {
    const isOpen = navMenu?.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach(link => link.addEventListener('click', () => {
    navMenu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const revealItems = document.querySelectorAll('.reveal');

  if (typeof IntersectionObserver === 'undefined') {
    revealItems.forEach(item => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach(item => observer.observe(item));
});

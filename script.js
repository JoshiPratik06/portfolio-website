document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
  const thumbnailFiles = [
    'Thumnail/01.png',
    'Thumnail/02.png',
    'Thumnail/03.png',
    'Thumnail/04.png',
    'Thumnail/05.png',
    'Thumnail/06.png',
    'Thumnail/07.png',
    'Thumnail/08.png'
  ];

  // Helper: encode a path but keep slashes
  const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/');

  // Preload images and collect valid sources
  const preloaded = [];
  thumbnailFiles.forEach(file => {
    const img = new Image();
    img.src = encodePath(file);
    img.onload = () => preloaded.push(img.src);
    img.onerror = () => console.warn('Failed to preload thumbnail:', file);
  });
  // Rotate thumbnails in the small showcase (if present)
  const thumbnailShowcaseImage = document.getElementById('thumbnail-showcase-image');
  const showcaseImages = thumbnailFiles.map(file => encodePath(file));

  if (thumbnailShowcaseImage && showcaseImages.length) {
    let idx = 0;
    const startSrc = preloaded[0] || showcaseImages[0];
    thumbnailShowcaseImage.src = startSrc;
    thumbnailShowcaseImage.alt = `Featured YouTube thumbnail 1`;
    thumbnailShowcaseImage.style.opacity = 1;

    thumbnailShowcaseImage.addEventListener('error', () => {
      console.warn('Showcase image failed:', thumbnailShowcaseImage.src);
      idx = (idx + 1) % showcaseImages.length;
      thumbnailShowcaseImage.src = showcaseImages[idx];
      thumbnailShowcaseImage.alt = `Featured YouTube thumbnail ${idx + 1}`;
    });

    setInterval(() => {
      const nextIndex = (idx + 1) % showcaseImages.length;
      thumbnailShowcaseImage.style.opacity = 0;
      setTimeout(() => {
        idx = nextIndex;
        thumbnailShowcaseImage.src = showcaseImages[idx];
        thumbnailShowcaseImage.alt = `Featured YouTube thumbnail ${idx + 1}`;
        thumbnailShowcaseImage.style.opacity = 1;
      }, 450);
    }, 3000);
  }

  const galleryGrid = document.getElementById('gallery-grid');
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');

  const openLightbox = (src, alt) => {
    if (!lightboxOverlay || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightboxOverlay.classList.add('active');
    lightboxOverlay.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    if (!lightboxOverlay || !lightboxImage) return;
    lightboxOverlay.classList.remove('active');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (event) => {
      if (event.target === lightboxOverlay) closeLightbox();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  if (galleryGrid) {
    galleryGrid.innerHTML = '';
    thumbnailFiles.forEach((file, index) => {
      const src = encodePath(file);
      const card = document.createElement('article');
      card.className = 'gallery-card';

      const imgEl = document.createElement('img');
      imgEl.src = src;
      imgEl.alt = `Thumbnail ${index + 1}`;
      imgEl.addEventListener('error', () => {
        console.warn('Gallery image failed to load:', src);
        imgEl.src = 'photo.png';
      });

      card.addEventListener('click', () => openLightbox(src, imgEl.alt));

      const meta = document.createElement('div');
      meta.className = 'gallery-card-content';
      meta.innerHTML = `<h3>Thumbnail ${String(index + 1).padStart(2, '0')}</h3><p>${String(index + 1).padStart(2, '0')}</p>`;

      card.appendChild(imgEl);
      card.appendChild(meta);
      galleryGrid.appendChild(card);
    });
  }

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

  // Embed YouTube player when the video card is visible (autoplay muted)
  const videoId = 'PYwCRETBzQU'; // fallback
  const iframe = document.getElementById('yt-embed');
  const videoContainer = document.getElementById('youtube-video-container');

  if (iframe && videoContainer) {
    const dataSrc = iframe.dataset && iframe.dataset.src ? iframe.dataset.src : null;
    const makeSrcFromBase = (base) => {
      // iv_load_policy=3 attempts to hide annotations/cards where supported
      // playsinline=1 keeps playback inline on mobile
      if (!base) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}autoplay=1&mute=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
    };

    const loadVideo = () => {
      if (!iframe.src) {
        iframe.src = makeSrcFromBase(dataSrc);
        console.log('YouTube iframe src set ->', iframe.src);
      }
    };

    const unloadVideo = () => {
      if (iframe.src) {
        iframe.src = '';
        console.log('YouTube iframe src cleared');
      }
    };

    const vidObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadVideo();
        } else {
          unloadVideo();
        }
      });
    }, { threshold: 0.25 });

    // If the video container is already visible on load, load immediately
    const rect = videoContainer.getBoundingClientRect();
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    if (rect.top < vh && rect.bottom > 0) {
      loadVideo();
    }

    vidObserver.observe(videoContainer);
  }
});

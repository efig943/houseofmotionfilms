/* ============================================
   HOUSE OF MOTION FILMS — Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Preloader ──
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 800);
  });
  // Fallback: remove preloader after 3s regardless
  setTimeout(() => {
    preloader.classList.add('loaded');
  }, 3000);

  // ── Navbar Scroll Effect ──
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // ── Mobile Hamburger Menu ──
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ── Scroll Reveal Animations ──
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Lightbox Helper ──
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Enlarged portfolio image';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImg.src = '';
    }, 400);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ── Portfolio Filter, Lightbox & Google Drive Dynamic Gallery ──
  const portfolioGrid = document.getElementById('portfolioGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const GOOGLE_DRIVE_API = "https://script.google.com/macros/s/AKfycbyvEb2DcJhwvP4nyVB0-zJ91RgGzJrRWyqi-gApyRZP-jb-fYRJj0f5LrFZUg_k3vr50Q/exec";
  const CACHE_KEY = "houseofmotion_gdrive_photos";
  let activeFilter = 'all';
  let currentDrivePhotos = [];

  const categoryNames = {
    all: 'All Work',
    quinceanera: 'Quinceañeras',
    wedding: 'Weddings',
    portrait: 'Portraits',
    event: 'Parties & Events',
    documentary: 'Documentaries',
    social: 'Social Media'
  };

  function bindPortfolioInteractions() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
      item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      item.onclick = () => {
        const fullSrc = item.dataset.fullsrc;
        const img = item.querySelector('img');
        openLightbox(fullSrc || (img ? img.src : ''), img ? img.alt : '');
      };
    });
  }

  function applyFilter(filter) {
    activeFilter = filter;
    if (!portfolioGrid) return;

    const portfolioItems = portfolioGrid.querySelectorAll('.portfolio-item');
    if (portfolioItems.length === 0) return;

    portfolioItems.forEach((item, index) => {
      const category = item.dataset.category;
      if (filter === 'all' || category === filter) {
        item.style.display = 'block';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, index * 40);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 200);
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  function renderDrivePhotos(photos) {
    if (!portfolioGrid) return;
    currentDrivePhotos = Array.isArray(photos) ? photos : [];

    // Clear everything from the grid - if no photos, leave it completely blank
    portfolioGrid.innerHTML = '';

    if (currentDrivePhotos.length === 0) {
      return;
    }

    // Render exclusively the photos from Google Drive
    currentDrivePhotos.forEach((photo, idx) => {
      const item = document.createElement('div');
      const isTall = (idx % 3 === 0) && (currentDrivePhotos.length >= 3);
      item.className = `portfolio-item gdrive-live-item ${isTall ? 'tall' : ''} reveal visible`;
      item.dataset.category = photo.category || 'general';

      const thumbUrl = `https://lh3.googleusercontent.com/d/${photo.id}=w800`;
      const fullUrl = `https://lh3.googleusercontent.com/d/${photo.id}=w2048`;
      item.dataset.fullsrc = fullUrl;

      const categoryDisplay = photo.categoryName || photo.folderName || categoryNames[photo.category] || photo.category;
      const photoTitle = (photo.title && photo.title.toLowerCase() !== 'untitled' && photo.title.toLowerCase() !== photo.category) 
        ? photo.title 
        : categoryDisplay;

      item.innerHTML = `
        <img src="${thumbUrl}" alt="${photoTitle}" loading="lazy" onerror="this.onerror=null;this.src='https://drive.google.com/thumbnail?id=${photo.id}&sz=w800'">
        <div class="portfolio-item-overlay">
          <span>${photoTitle}</span>
          <span class="portfolio-cat">${categoryDisplay}</span>
        </div>
      `;

      portfolioGrid.appendChild(item);
    });

    bindPortfolioInteractions();
    applyFilter(activeFilter);
  }

  // Instant render from local cache if available
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        renderDrivePhotos(parsed);
      }
    }
  } catch (e) {}

  // Live background fetch from Google Drive Web App (Completely silent - no toast/banners)
  async function loadGoogleDrivePhotos() {
    const lingeringPill = document.getElementById('gdrive-status-pill');
    if (lingeringPill) lingeringPill.remove();

    if (!portfolioGrid) return;

    try {
      const res = await fetch(GOOGLE_DRIVE_API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && data.success && Array.isArray(data.photos)) {
        console.log("Synced " + data.photos.length + " live photos from Google Drive:", data.photos);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data.photos));
        renderDrivePhotos(data.photos);
      } else if (data && data.error) {
        throw new Error(data.error);
      }
    } catch (e) {
      console.log('Google Drive sync note:', e);
    }
  }

  loadGoogleDrivePhotos();

  // ── Showreel Play Button ──
  const playBtn = document.getElementById('playBtn');
  const showreelVideo = document.getElementById('showreelVideo');

  playBtn.addEventListener('click', () => {
    // Replace thumbnail with YouTube embed or show a message
    // For now, we'll create a placeholder experience
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0';
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:20px;';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; encrypted-media');

    // Clear thumbnail and play button
    showreelVideo.innerHTML = '';
    showreelVideo.appendChild(iframe);
  });

  // ── Phone Input: Strictly Numeric Only ──
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('keydown', (e) => {
      // Allow navigation and editing keys (Backspace, Delete, Tab, Arrows, Enter, Ctrl/Cmd shortcuts)
      if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Home', 'End'].includes(e.key) ||
          e.ctrlKey || e.metaKey) {
        return;
      }
      // Block any non-digit character from being typed
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    // Strip non-numbers on paste, drag-and-drop, or autofill
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  // ── Contact Form Handling (Route to Google Sheet) ──
  const contactForm = document.getElementById('contactForm');
  const GOOGLE_SHEET_FORM_URL = "https://script.google.com/macros/s/AKfycbwl1skA6FmIoxzQvTYEB8ASe2cwrz1RtdtFBz_vlrblGQaHIz-WEktNjSXhlP8ZF19N/exec"; 

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('formSubmitBtn');
    const originalText = submitBtn.textContent;

    const formData = {
      firstName: document.getElementById('firstName')?.value.trim() || '',
      lastName: document.getElementById('lastName')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      phone: document.getElementById('phone')?.value.trim() || '',
      eventType: document.getElementById('eventType')?.value || '',
      eventDate: document.getElementById('eventDate')?.value || '',
      message: document.getElementById('message')?.value.trim() || '',
      submittedAt: new Date().toLocaleString()
    };

    submitBtn.textContent = 'Sending Inquiry...';
    submitBtn.style.pointerEvents = 'none';

    try {
      if (GOOGLE_SHEET_FORM_URL) {
        await fetch(GOOGLE_SHEET_FORM_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(formData)
        });
      }

      submitBtn.textContent = '✓ Inquiry Sent!';
      submitBtn.style.background = '#8FA38B';
      submitBtn.style.color = 'white';
      contactForm.reset();

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.style.pointerEvents = '';
      }, 4000);
    } catch (err) {
      console.error('Submission error:', err);
      submitBtn.textContent = '✓ Inquiry Received!';
      submitBtn.style.background = '#8FA38B';
      submitBtn.style.color = 'white';
      contactForm.reset();

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.style.pointerEvents = '';
      }, 4000);
    }
  });

  // ── Stat Counter Animation ──
  const stats = document.querySelectorAll('.stat-number');

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => statsObserver.observe(stat));

  function animateCounter(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const hasPercent = text.includes('%');
    const number = parseInt(text.replace(/[^0-9]/g, ''));

    if (isNaN(number)) return;

    let current = 0;
    const duration = 2000;
    const start = performance.now();

    function update(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * number);

      let display = current.toString();
      if (hasPlus) display += '+';
      if (hasPercent) display += '%';

      element.textContent = display;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ── Smooth Scroll for Nav Links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ── Parallax-like effect for hero background ──
  const heroBg = document.querySelector('.hero-bg img');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroBg.style.transform = `scale(${1.05 + scrollY * 0.0003}) translateY(${scrollY * 0.3}px)`;
    }
  });

});

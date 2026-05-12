/* ==========================================
   Finwise.rocks — Main JavaScript
   ========================================== */

// ── Dark Mode Toggle ──
function initDarkMode() {
  const toggle = document.getElementById('dark-toggle');
  const html = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
  }
  if (toggle) {
    toggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
      updateToggleIcon();
    });
    updateToggleIcon();
  }
}

function updateToggleIcon() {
  const toggle = document.getElementById('dark-toggle');
  if (!toggle) return;
  const isDark = document.documentElement.classList.contains('dark');
  toggle.innerHTML = isDark
    ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
    : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>';
}

// ── Mobile Menu ──
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
  });
}

// ── Navbar scroll effect ──
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ── Copy to clipboard ──
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        const original = btn.innerHTML;
        const codeSpan = btn.querySelector('.copy-code-text');
        const labelSpan = btn.querySelector('.copy-label');
        if (labelSpan) labelSpan.textContent = 'Copiato!';
        showToast('Codice copiato negli appunti!');
        setTimeout(() => {
          btn.classList.remove('copied');
          if (labelSpan) labelSpan.textContent = 'Copia codice';
        }, 2000);
      });
    });
  });
}

// ── Toast notification ──
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Accordion / FAQ ──
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      const isOpen = content.classList.contains('open');
      // Close all in same group
      const parent = trigger.closest('.accordion-group');
      if (parent) {
        parent.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
        parent.querySelectorAll('.accordion-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
      }
      if (!isOpen) {
        content.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ── Checklist ──
function initChecklists() {
  document.querySelectorAll('.checklist-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      const check = item.querySelector('.checklist-check');
      if (item.classList.contains('checked')) {
        check.innerHTML = '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>';
      } else {
        check.innerHTML = '';
      }
      // Save state
      const id = item.getAttribute('data-check-id');
      if (id) {
        const states = JSON.parse(localStorage.getItem('checklist') || '{}');
        states[id] = item.classList.contains('checked');
        localStorage.setItem('checklist', JSON.stringify(states));
      }
    });
    // Restore state
    const id = item.getAttribute('data-check-id');
    if (id) {
      const states = JSON.parse(localStorage.getItem('checklist') || '{}');
      if (states[id]) {
        item.classList.add('checked');
        const check = item.querySelector('.checklist-check');
        check.innerHTML = '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>';
      }
    }
  });
}

// ── Calculator ──
function initCalculators() {
  const input = document.getElementById('calc-friends');
  const result = document.getElementById('calc-result');
  const bonusAmount = document.getElementById('calc-bonus-amount');
  if (!input || !result) return;
  const amount = bonusAmount ? parseInt(bonusAmount.value) : 50;
  function update() {
    const friends = Math.max(0, parseInt(input.value) || 0);
    const total = friends * amount;
    result.textContent = total.toLocaleString('it-IT') + '€';
  }
  input.addEventListener('input', update);
  update();
}

// ── Grid filter/sort ──
function initGridFilters() {
  const grid = document.getElementById('bonus-grid');
  const noResults = document.getElementById('no-results');
  if (!grid) return;

  // Filter
  const filterBtns = document.querySelectorAll('[data-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      filterBtns.forEach(b => {
        b.classList.remove('active', 'bg-brand-100', 'dark:bg-brand-900', 'text-brand-700');
        b.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
      });
      // Add active to clicked
      btn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
      btn.classList.add('active', 'bg-brand-100', 'dark:bg-brand-900', 'text-brand-700');
      
      const filter = btn.getAttribute('data-filter');
      const cards = grid.querySelectorAll('.card-promo');
      let visibleCount = 0;

      cards.forEach(card => {
        if (filter === 'all') {
          card.style.display = '';
          visibleCount++;
        } else {
          const diff = card.getAttribute('data-difficulty') || '';
          if (diff === filter) {
            card.style.display = '';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        }
      });

      if (noResults) {
        noResults.classList.toggle('hidden', visibleCount > 0);
      }
    });
  });
}

// ── Intersection Observer for animations ──
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// ── UTM tracking ──
function addUTMToLinks() {
  document.querySelectorAll('a[data-referral]').forEach(link => {
    const url = new URL(link.href);
    url.searchParams.set('ref', 'finwise2026');
    link.href = url.toString();
  });
}

// ── Init all ──
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initMobileMenu();
  initNavbarScroll();
  initCopyButtons();
  initAccordions();
  initChecklists();
  initCalculators();
  initGridFilters();
  initScrollAnimations();
  addUTMToLinks();
});

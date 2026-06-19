(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initMobileMenu() {
    const toggle = $('.mobile-toggle');
    const menu = $('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    $$('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const input = form.querySelector('input');
        const query = input ? input.value.trim() : '';
        const target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.location.href = target;
      });
    });
  }

  function initHero() {
    const hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = $$('.hero-slide', hero);
    const dots = $$('.hero-dot', hero);
    if (!slides.length) {
      return;
    }
    let index = 0;
    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    const areas = $$('[data-filter-area]');
    areas.forEach(function (area) {
      const cards = $$('[data-movie-card]', area);
      const input = $('[data-filter-keyword]', area);
      const typeSelect = $('[data-filter-type]', area);
      const regionSelect = $('[data-filter-region]', area);
      const yearSelect = $('[data-filter-year]', area);
      const empty = $('.empty-state', area);
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');
      if (input && query) {
        input.value = query;
      }
      const apply = function () {
        const keyword = normalize(input ? input.value : '');
        const type = normalize(typeSelect ? typeSelect.value : '');
        const region = normalize(regionSelect ? regionSelect.value : '');
        const year = normalize(yearSelect ? yearSelect.value : '');
        let shown = 0;
        cards.forEach(function (card) {
          const text = normalize(card.getAttribute('data-search'));
          const cardType = normalize(card.getAttribute('data-type'));
          const cardRegion = normalize(card.getAttribute('data-region'));
          const cardYear = normalize(card.getAttribute('data-year'));
          const ok = (!keyword || text.indexOf(keyword) !== -1) &&
            (!type || cardType === type) &&
            (!region || cardRegion.indexOf(region) !== -1) &&
            (!year || cardYear === year);
          card.style.display = ok ? '' : 'none';
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      };
      [input, typeSelect, regionSelect, yearSelect].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    $$('[data-player]').forEach(function (wrap) {
      const video = $('video', wrap);
      const button = $('.play-button', wrap);
      const stream = wrap.getAttribute('data-stream');
      let hlsInstance = null;
      if (!video || !stream) {
        return;
      }
      const start = function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = stream;
          }
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          }
          video.play().catch(function () {});
        }
      };
      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', start, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeaderSearch();
    initHero();
    initFilters();
    initPlayers();
  });
})();

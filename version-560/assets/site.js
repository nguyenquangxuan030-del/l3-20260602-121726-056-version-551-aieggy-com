(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('[data-slide-target]');
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = Number(dot.getAttribute('data-slide-target')) || 0;
        show(target);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var lists = selectAll('.js-filter-list');
    if (!lists.length) {
      return;
    }
    var input = document.querySelector('.js-filter-input');
    var year = document.querySelector('.js-year-filter');
    var category = document.querySelector('.js-category-filter');
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var categoryValue = category ? category.value : '';
      lists.forEach(function (list) {
        selectAll('[data-search]', list).forEach(function (item) {
          var text = (item.getAttribute('data-search') || '').toLowerCase();
          var itemYear = item.getAttribute('data-year') || '';
          var itemCategory = item.getAttribute('data-category') || '';
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && itemYear !== yearValue) {
            matched = false;
          }
          if (categoryValue && itemCategory !== categoryValue) {
            matched = false;
          }
          item.classList.toggle('hidden-card', !matched);
        });
      });
    }
    [input, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initPlayers() {
    selectAll('.player-card').forEach(function (card) {
      var video = card.querySelector('video');
      var button = card.querySelector('.player-start');
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute('data-video');
      var connected = false;
      var pendingPlay = false;
      function connect() {
        if (connected || !src) {
          return;
        }
        connected = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.load();
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (pendingPlay) {
              video.play().catch(function () {});
            }
          });
        } else {
          video.src = src;
          video.load();
        }
      }
      function play() {
        pendingPlay = true;
        connect();
        button.classList.add('hidden');
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            button.classList.remove('hidden');
          });
        }
      }
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();

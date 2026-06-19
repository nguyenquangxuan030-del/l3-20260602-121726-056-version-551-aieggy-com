document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupLocalFilters();
  setupSearchPage();
  setupPlayers();
});

function setupMobileMenu() {
  var button = document.querySelector('.mobile-menu-button');
  var panel = document.querySelector('.mobile-nav-panel');
  if (!button || !panel) {
    return;
  }

  button.addEventListener('click', function () {
    panel.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length === 0) {
    return;
  }

  var active = 0;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      show(index);
    });
  });

  window.setInterval(function () {
    show(active + 1);
  }, 5600);
}

function setupLocalFilters() {
  var scope = document.querySelector('[data-filter-scope]');
  var input = document.querySelector('[data-filter-input]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  if (!scope || !input) {
    return;
  }

  var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

  function applyFilter() {
    var keyword = (input.value || '').trim().toLowerCase();
    var type = typeFilter ? typeFilter.value : '';
    var minYear = yearFilter && yearFilter.value ? Number(yearFilter.value) : 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();

      var year = Number(card.getAttribute('data-year')) || 0;
      var typeOk = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
      var yearOk = !minYear || year >= minYear;
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;

      card.style.display = typeOk && yearOk && keywordOk ? '' : 'none';
    });
  }

  input.addEventListener('input', applyFilter);
  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilter);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }
}

function setupSearchPage() {
  var input = document.getElementById('globalSearchInput');
  var box = document.getElementById('searchResults');
  var info = document.getElementById('searchResultInfo');
  if (!input || !box || !window.SEARCH_DATA) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  input.value = initialQuery;

  function render() {
    var keyword = (input.value || '').trim().toLowerCase();
    if (!keyword) {
      info.textContent = '输入关键词后显示匹配结果。';
      box.innerHTML = '';
      return;
    }

    var results = window.SEARCH_DATA.filter(function (item) {
      return item.searchText.toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 120);

    info.textContent = '找到 ' + results.length + ' 条相关结果，最多显示前 120 条。';
    box.innerHTML = results.map(function (item) {
      return '<article>' +
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.desc) + '</p>' +
        '<div class="tag-row">' +
        '<span>' + escapeHtml(item.year) + '</span>' +
        '<span>' + escapeHtml(item.region) + '</span>' +
        '<span>' + escapeHtml(item.type) + '</span>' +
        '<span>' + escapeHtml(item.category) + '</span>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  input.addEventListener('input', render);
  render();
}

function setupPlayers() {
  var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-trigger');
    var source = shell.getAttribute('data-m3u8');
    if (!video || !button || !source) {
      return;
    }

    function startPlayback() {
      button.classList.add('is-hidden');

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[character];
  });
}

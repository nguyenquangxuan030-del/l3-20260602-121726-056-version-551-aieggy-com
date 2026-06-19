(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;
    var show = function (next) {
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
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });
    if (slides.length > 1) {
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var grid = document.querySelector('[data-filter-grid]');
    var input = panel.querySelector('[data-local-search]');
    var year = panel.querySelector('[data-year-filter]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var selected = '';
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      if (!grid) {
        return;
      }
      Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        var matchText = !q || text.indexOf(q) !== -1;
        var matchYear = !y || (card.getAttribute('data-year') || '') === y;
        var matchTag = !selected || text.indexOf(selected.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden', !(matchText && matchYear && matchTag));
      });
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (b) {
          b.classList.remove('is-active');
        });
        button.classList.add('is-active');
        selected = button.getAttribute('data-filter-value') || '';
        apply();
      });
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-overlay');
    var m3u8 = box.getAttribute('data-m3u8');
    var hls = null;
    var started = false;
    var start = function () {
      if (!video || !m3u8) {
        return;
      }
      box.classList.add('is-playing');
      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = m3u8;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(m3u8);
          hls.attachMedia(video);
        } else {
          video.src = m3u8;
        }
        started = true;
      }
      var p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });

  var results = document.querySelector('[data-search-results]');
  if (results && window.SEARCH_MOVIES) {
    var title = document.querySelector('[data-search-title]');
    var input = document.querySelector('[data-search-page-input]');
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    if (input) {
      input.value = q;
    }
    if (q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      var matched = window.SEARCH_MOVIES.filter(function (item) {
        var hay = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase();
        return terms.every(function (term) {
          return hay.indexOf(term) !== -1;
        });
      }).slice(0, 180);
      if (title) {
        title.textContent = '“' + q + '”的搜索结果';
      }
      results.innerHTML = matched.map(function (item) {
        return [
          '<article class="movie-card">',
          '<a href="' + item.url + '" class="movie-link">',
          '<div class="poster-wrap">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="score-pill">热度 ' + item.score + '</span>',
          '</div>',
          '<div class="movie-info">',
          '<h3>' + escapeHtml(item.title) + '</h3>',
          '<div class="meta-line">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</div>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
          '</div>',
          '</a>',
          '</article>'
        ].join('');
      }).join('');
      if (!matched.length) {
        results.innerHTML = '<div class="content-card"><h2>暂无匹配内容</h2><p>可以尝试更短的片名、地区、年份或类型关键词。</p></div>';
      }
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();

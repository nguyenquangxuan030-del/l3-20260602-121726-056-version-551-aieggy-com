(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var searches = document.querySelectorAll(".site-search");
  searches.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        return;
      }
    });
  });

  var hero = document.querySelector(".hero-slider");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var active = 0;

    function showHero(index) {
      active = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showHero(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero((active + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterSelect = document.querySelector("[data-filter-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
  var empty = document.querySelector(".empty-result");

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var typeValue = filterSelect ? filterSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchType = !typeValue || text.indexOf(typeValue.toLowerCase()) !== -1;
      var matched = matchKeyword && matchType;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("active", visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      filterInput.value = q;
    }
    filterInput.addEventListener("input", applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", applyFilter);
  }

  applyFilter();

  var player = document.querySelector(".player-box[data-stream]");
  if (player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".play-cover");
    var streamUrl = player.getAttribute("data-stream");
    var attached = false;

    function startVideo() {
      if (!video || !streamUrl) {
        return;
      }
      if (!attached) {
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 30
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      if (button) {
        button.classList.add("is-hidden");
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", startVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!attached) {
          startVideo();
        }
      });
    }
  }
})();

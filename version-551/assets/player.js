(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('.play-trigger');
    var source = shell.getAttribute('data-video-src') || '';
    var loaded = false;

    function loadAndPlay() {
      if (!video || !source) {
        return;
      }

      if (!loaded) {
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
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
        loaded = true;
      } else {
        video.play().catch(function () {});
      }

      shell.classList.add('is-playing');
    }

    if (trigger) {
      trigger.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          loadAndPlay();
        }
      });
    }
  });
})();

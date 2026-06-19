(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var status = box.querySelector('.player-status');
    var configNode = box.querySelector('.player-config');
    var config = {};
    var attached = false;
    var hls = null;

    try {
      config = JSON.parse(configNode ? configNode.textContent : '{}');
    } catch (error) {
      config = {};
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function attach() {
      if (attached || !video || !config.stream) {
        return;
      }

      attached = true;
      setStatus('正在准备播放');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放暂时不可用，请稍后再试');
          }
        });
      } else {
        video.src = config.stream;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
        }, { once: true });
      }
    }

    function play() {
      attach();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
          setStatus('点击画面继续播放');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        setStatus('');
      });

      video.addEventListener('pause', function () {
        if (cover && video.currentTime === 0) {
          cover.classList.remove('is-hidden');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    }
  });
})();

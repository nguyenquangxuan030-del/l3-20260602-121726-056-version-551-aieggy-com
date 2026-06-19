(function() {
    function initVideoPlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.playButtonId);
        var cover = document.getElementById(options.coverId);
        var sourceUrl = options.sourceUrl;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function loadSource() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            video.setAttribute("data-ready", "1");
        }

        function startPlayback() {
            loadSource();
            hideCover();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {});
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        if (cover && cover !== button) {
            cover.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function() {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", hideCover);
        loadSource();
    }

    window.initVideoPlayer = initVideoPlayer;
})();

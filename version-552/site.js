
(function () {
    var nav = document.querySelector('.nav-links');
    var toggle = document.querySelector('.menu-toggle');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });

        show(0);

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        var input = document.querySelector('[data-filter-input]');
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
        var sort = document.querySelector('[data-sort-select]');

        if (!lists.length) {
            return;
        }

        var groups = lists.map(function (list) {
            return {
                list: list,
                cards: Array.prototype.slice.call(list.querySelectorAll('.movie-card'))
            };
        });

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            groups.forEach(function (group) {
                group.cards.forEach(function (card) {
                    var visible = !keyword || textOf(card).indexOf(keyword) !== -1;
                    card.classList.toggle('hidden-card', !visible);
                });
            });
        }

        function sortCards(cards, value) {
            return cards.slice().sort(function (a, b) {
                var titleA = a.getAttribute('data-title') || '';
                var titleB = b.getAttribute('data-title') || '';
                var yearA = parseInt(a.getAttribute('data-year') || '0', 10);
                var yearB = parseInt(b.getAttribute('data-year') || '0', 10);
                var heatA = parseFloat(a.getAttribute('data-heat') || '0');
                var heatB = parseFloat(b.getAttribute('data-heat') || '0');

                if (value === 'title-asc') {
                    return titleA.localeCompare(titleB, 'zh-Hans-CN');
                }

                if (value === 'heat-desc') {
                    return heatB - heatA || yearB - yearA || titleA.localeCompare(titleB, 'zh-Hans-CN');
                }

                return yearB - yearA || titleA.localeCompare(titleB, 'zh-Hans-CN');
            });
        }

        function applySort() {
            if (!sort) {
                return;
            }

            var value = sort.value;
            groups.forEach(function (group) {
                var sorted = sortCards(group.cards, value);
                sorted.forEach(function (card) {
                    group.list.appendChild(card);
                });
                group.cards = sorted;
            });
            applyFilter();
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (sort) {
            sort.addEventListener('change', applySort);
        }
    }

    function initPlayers() {
        var frames = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        frames.forEach(function (frame) {
            var video = frame.querySelector('video');
            var overlay = frame.querySelector('.player-overlay');
            var playButton = frame.querySelector('[data-play-button]');
            var muteButton = frame.querySelector('[data-mute-button]');
            var fullscreenButton = frame.querySelector('[data-fullscreen-button]');
            var source = video ? video.getAttribute('data-hls') : '';
            var isReady = false;

            function prepare() {
                if (!video || !source || isReady) {
                    return;
                }

                isReady = true;

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                }
            }

            function play() {
                prepare();
                if (!video) {
                    return;
                }

                if (video.paused) {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                } else {
                    video.pause();
                }
            }

            function sync() {
                if (!video) {
                    return;
                }

                if (overlay) {
                    overlay.classList.toggle('hidden', !video.paused);
                }

                if (playButton) {
                    playButton.textContent = video.paused ? '▶' : '❚❚';
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }

            if (playButton) {
                playButton.addEventListener('click', play);
            }

            if (video) {
                video.addEventListener('click', play);
                video.addEventListener('play', sync);
                video.addEventListener('pause', sync);
                video.addEventListener('ended', sync);
            }

            if (muteButton && video) {
                muteButton.addEventListener('click', function () {
                    video.muted = !video.muted;
                    muteButton.textContent = video.muted ? '🔇' : '🔊';
                });
            }

            if (fullscreenButton) {
                fullscreenButton.addEventListener('click', function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (frame.requestFullscreen) {
                        frame.requestFullscreen();
                    }
                });
            }

            sync();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
        initPlayers();
    });
}());

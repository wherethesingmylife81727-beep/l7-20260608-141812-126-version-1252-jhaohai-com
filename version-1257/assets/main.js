(function () {
    var header = document.querySelector('.site-header');
    var navToggle = document.querySelector('[data-nav-toggle]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (navToggle && header) {
        navToggle.addEventListener('click', function () {
            var active = header.classList.toggle('mobile-active');
            document.body.classList.toggle('nav-open', active);
        });
    }

    document.querySelectorAll('.mobile-nav a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (header) {
                header.classList.remove('mobile-active');
            }
            document.body.classList.remove('nav-open');
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        if (slides.length < 2) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-local-search]');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = scope.querySelector('.empty-state');
        var activeFilter = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year'));
                var tags = normalize(card.getAttribute('data-tags'));
                var type = normalize(card.getAttribute('data-type'));
                var year = normalize(card.getAttribute('data-year'));
                var region = normalize(card.getAttribute('data-region'));
                var filterOk = activeFilter === 'all' || tags.indexOf(activeFilter) !== -1 || type.indexOf(activeFilter) !== -1 || year.indexOf(activeFilter) !== -1 || region.indexOf(activeFilter) !== -1;
                var queryOk = !query || haystack.indexOf(query) !== -1;
                var show = filterOk && queryOk;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
            if (document.body.getAttribute('data-page') === 'search') {
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeFilter = normalize(chip.getAttribute('data-filter-value')) || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });

        apply();
    });
})();

window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-player]');
    var overlay = document.querySelector('.player-overlay');
    var started = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function bindSource() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
        video.controls = true;
    }

    function play() {
        bindSource();
        if (overlay) {
            overlay.classList.add('hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                if (overlay) {
                    overlay.classList.remove('hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
};

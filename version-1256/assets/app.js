(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function updateHeader() {
        var header = document.getElementById("siteHeader");
        if (!header) {
            return;
        }
        if (window.scrollY > 12) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    function initMenu() {
        var header = document.getElementById("siteHeader");
        var button = document.querySelector(".menu-toggle");
        var menu = document.getElementById("mobileMenu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(open));
            if (header) {
                header.classList.toggle("menu-open", open);
            }
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === index;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", String(!active));
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var container = form.parentElement || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
            var empty = container.querySelector(".empty-state");
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q") || "";
            var searchInput = form.querySelector('input[name="q"]');
            var typeSelect = form.querySelector('select[name="type"]');
            var yearSelect = form.querySelector('select[name="year"]');
            if (queryValue && searchInput && !searchInput.value) {
                searchInput.value = queryValue;
            }

            function apply() {
                var query = normalize(searchInput ? searchInput.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre")
                    ].join(" "));
                    var typeMatch = !type || normalize(card.getAttribute("data-type")) === type;
                    var yearMatch = !year || normalize(card.getAttribute("data-year")) === year;
                    var queryMatch = !query || haystack.indexOf(query) !== -1;
                    var showCard = typeMatch && yearMatch && queryMatch;
                    card.hidden = !showCard;
                    if (showCard) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-video");
        var button = document.querySelector("[data-play-trigger]");
        var poster = document.querySelector(".player-poster");
        var hlsInstance = null;
        var initialized = false;

        if (!video || !streamUrl) {
            return;
        }

        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function prepare() {
            if (initialized) {
                return;
            }
            initialized = true;
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.load();
                video.addEventListener("loadedmetadata", play, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, play);
            } else {
                video.src = streamUrl;
                video.load();
            }
        }

        function start() {
            prepare();
            if (poster) {
                poster.classList.add("is-hidden");
            }
            play();
        }

        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        updateHeader();
        initMenu();
        initHero();
        initFilters();
        window.addEventListener("scroll", updateHeader, { passive: true });
    });
})();

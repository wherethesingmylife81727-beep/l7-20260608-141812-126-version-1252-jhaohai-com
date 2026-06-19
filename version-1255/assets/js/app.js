(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    if (toggle && header && menu) {
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            header.classList.toggle('is-open', !expanded);
            document.body.classList.toggle('nav-open', !expanded);
        });
    }

    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        }, { once: true });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var clear = root.querySelector('[data-filter-clear]');
        var type = root.querySelector('[data-filter-type]');
        var region = root.querySelector('[data-filter-region]');
        var year = root.querySelector('[data-filter-year]');
        var category = root.querySelector('[data-filter-category]');
        var scope = root.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
        var empty = scope.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var selectedType = normalize(type && type.value);
            var selectedRegion = normalize(region && region.value);
            var selectedYear = normalize(year && year.value);
            var selectedCategory = normalize(category && category.value);
            var visible = 0;

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute('data-search'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var matched = true;

                if (keyword && search.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedCategory && cardCategory !== selectedCategory) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, type, region, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                [type, region, year, category].forEach(function (control) {
                    if (control) {
                        control.value = '';
                    }
                });
                apply();
            });
        }

        apply();
    });
})();

(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('.hero-carousel');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                play();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                play();
            });
        });

        showSlide(0);
        play();
    }

    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

    filters.forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var typeSelect = root.querySelector('[data-filter-type]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-search]'));
        var empty = root.querySelector('.empty-state');

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(input ? input.value : '');
            var typeValue = normalize(typeSelect ? typeSelect.value : '');
            var yearValue = normalize(yearSelect ? yearSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }

                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    });
})();

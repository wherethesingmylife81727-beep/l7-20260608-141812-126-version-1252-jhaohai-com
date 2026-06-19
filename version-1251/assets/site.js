(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5600);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var input = filterPanel.querySelector('[data-filter-input]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var emptyState = document.querySelector('[data-empty-state]');
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute('data-title'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-type'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-tags')
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || normalize(item.getAttribute('data-year')) === year;
                var matchesType = !type || normalize(item.getAttribute('data-type')) === type;
                var show = matchesKeyword && matchesYear && matchesType;

                item.classList.toggle('hidden-by-filter', !show);

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }
})();

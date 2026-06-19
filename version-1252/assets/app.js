(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
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

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  function initSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');

        if (!input) {
          return;
        }

        var query = input.value.trim();

        if (!query) {
          event.preventDefault();
          input.focus();
          return;
        }

        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function initCardFilters() {
    selectAll('[data-card-filter]').forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var selects = selectAll('[data-filter-select]', panel);
      var scopeSelector = panel.getAttribute('data-filter-scope') || 'body';
      var scope = document.querySelector(scopeSelector) || document;
      var cards = selectAll('[data-movie-card]', scope);
      var empty = document.querySelector('[data-empty-state]');

      function normalized(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function apply() {
        var query = normalized(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalized(card.getAttribute('data-search-text'));
          var matched = !query || haystack.indexOf(query) !== -1;

          selects.forEach(function (select) {
            var field = select.getAttribute('data-filter-select');
            var value = normalized(select.value);
            var cardValue = normalized(card.getAttribute('data-' + field));

            if (value && cardValue !== value) {
              matched = false;
            }
          });

          card.style.display = matched ? '' : 'none';

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q && input) {
        input.value = q;
      }

      apply();
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('moviePlayer');
    var button = document.querySelector('[data-player-start]');
    var activated = false;
    var hls;

    if (!video || !source) {
      return;
    }

    function bindSource() {
      if (activated) {
        return;
      }

      activated = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      bindSource();

      if (button) {
        button.classList.add('is-hidden');
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!activated) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initSearchForms();
    initCardFilters();
  });
})();

(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var emptyState = filterRoot.querySelector('[data-empty-state]');
    var chips = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter-chip]'));
    var activeType = 'all';

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var type = (card.getAttribute('data-type') || '').toLowerCase();
        var typeMatched = activeType === 'all' || type.indexOf(activeType) !== -1 || haystack.indexOf(activeType) !== -1;
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var visible = typeMatched && keywordMatched;

        card.classList.toggle('hidden-by-filter', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeType = chip.getAttribute('data-filter-chip') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-player-start]'));
    var started = false;

    function startPlayer() {
      if (!video || started) {
        if (video) {
          video.play().catch(function () {});
        }
        return;
      }

      var source = video.getAttribute('data-src');
      if (!source) {
        return;
      }

      started = true;

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.play().catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
        started = false;
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer();
      });
    });

    if (overlay) {
      overlay.addEventListener('click', startPlayer);
    }
  });
})();

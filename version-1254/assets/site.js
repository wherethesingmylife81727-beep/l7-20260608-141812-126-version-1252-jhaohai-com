(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var hero = document.querySelector(".hero");
  if (hero) {
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(nextSlide, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });
    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function applyFilter(scope) {
    var input = scope.querySelector("[data-filter-input]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var yearSelect = scope.querySelector("[data-filter-year]");
    var regionSelect = scope.querySelector("[data-filter-region]");
    var cards = selectAll(".movie-card", scope);

    function currentValue(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function filterCards() {
      var query = currentValue(input);
      var type = currentValue(typeSelect);
      var year = currentValue(yearSelect);
      var region = currentValue(regionSelect);
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = !type || (card.getAttribute("data-type") || "").toLowerCase().indexOf(type) !== -1;
        var matchesYear = !year || (card.getAttribute("data-year") || "").toLowerCase().indexOf(year) !== -1;
        var matchesRegion = !region || (card.getAttribute("data-region") || "").toLowerCase().indexOf(region) !== -1;
        card.classList.toggle("is-filtered-out", !(matchesQuery && matchesType && matchesYear && matchesRegion));
      });
    }

    [input, typeSelect, yearSelect, regionSelect].forEach(function (element) {
      if (!element) {
        return;
      }
      element.addEventListener("input", filterCards);
      element.addEventListener("change", filterCards);
    });
  }

  selectAll("[data-filter-scope]").forEach(applyFilter);

  selectAll("[data-play-trigger]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var targetId = trigger.getAttribute("data-play-trigger");
      var target = document.getElementById(targetId);
      if (target) {
        target.click();
        var video = document.getElementById("movie-video");
        if (video) {
          video.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  });
})();

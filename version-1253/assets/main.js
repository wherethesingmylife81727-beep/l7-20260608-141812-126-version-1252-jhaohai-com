document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function restartTimer() {
    if (!slides.length) {
      return;
    }

    if (timer) {
      clearInterval(timer);
    }

    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      restartTimer();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      restartTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      restartTimer();
    });
  });

  showSlide(0);
  restartTimer();

  var query = new URLSearchParams(window.location.search).get("q") || "";
  var filterInput = document.querySelector(".filter-input");
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
  var filterItems = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card, .filter-grid .ranking-row"));

  if (filterInput && query) {
    filterInput.value = query;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    if (!filterItems.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : "");
    var values = {};

    filterSelects.forEach(function (select) {
      var key = select.getAttribute("data-filter");
      if (key) {
        values[key] = normalize(select.value);
      }
    });

    filterItems.forEach(function (item) {
      var haystack = normalize([
        item.getAttribute("data-title"),
        item.getAttribute("data-year"),
        item.getAttribute("data-region"),
        item.getAttribute("data-type"),
        item.getAttribute("data-genre")
      ].join(" "));

      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (values.year && normalize(item.getAttribute("data-year")) !== values.year) {
        matched = false;
      }

      if (values.region && normalize(item.getAttribute("data-region")) !== values.region) {
        matched = false;
      }

      if (values.type && normalize(item.getAttribute("data-type")) !== values.type) {
        matched = false;
      }

      item.classList.toggle("is-filter-hidden", !matched);
    });
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyFilters);
  }

  filterSelects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });

  applyFilters();

  var video = document.querySelector(".player-video");
  var cover = document.querySelector(".player-cover");

  function prepareVideo() {
    if (!video || video.getAttribute("data-ready") === "true") {
      return;
    }

    var stream = video.getAttribute("data-stream-url");

    if (!stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hlsPlayer = hls;
    } else {
      video.src = stream;
    }

    video.setAttribute("data-ready", "true");
  }

  function playVideo() {
    if (!video) {
      return;
    }

    prepareVideo();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    video.controls = true;
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  }
});

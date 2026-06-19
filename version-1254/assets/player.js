(function () {
  window.bindMoviePlayer = function (options) {
    if (!options) {
      return;
    }

    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var streamUrl = options.streamUrl;
    var loaded = false;
    var hls = null;

    function loadVideo() {
      if (loaded || !video || !streamUrl) {
        return;
      }
      loaded = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      if (!video) {
        return;
      }
      loadVideo();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button && button !== overlay) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();

(function () {
    var video = document.getElementById("video-player");
    var button = document.querySelector("[data-play-button]");
    var shell = document.querySelector("[data-player-shell]");
    var instance = null;
    var started = false;

    function start() {
        if (!video || started) {
            if (video) {
                video.play().catch(function () {});
            }
            return;
        }
        started = true;
        var url = video.getAttribute("data-hls");
        if (button) {
            button.classList.add("hidden");
        }
        if (!url) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            instance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            instance.loadSource(url);
            instance.attachMedia(video);
            instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            instance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && instance) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        instance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        instance.recoverMediaError();
                    } else {
                        instance.destroy();
                        instance = null;
                    }
                }
            });
            return;
        }
        video.src = url;
        video.play().catch(function () {});
    }

    if (button) {
        button.addEventListener("click", start);
    }
    if (shell) {
        shell.addEventListener("click", function (event) {
            if (event.target === video) {
                return;
            }
            start();
        });
    }
    if (video) {
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("hidden");
            }
        });
    }
})();

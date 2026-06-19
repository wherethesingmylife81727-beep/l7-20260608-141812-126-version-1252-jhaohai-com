(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    players.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-layer');
        var stream = shell.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function prepare() {
            if (ready || !video || !stream) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 60
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function start() {
            prepare();
            shell.classList.add('is-playing');

            if (video) {
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();

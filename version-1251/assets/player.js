function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('movie-play-button');
    var hlsInstance = null;
    var attached = false;

    if (!video || !button || !streamUrl) {
        return;
    }

    function attachStream() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function startPlayback() {
        attachStream();
        button.classList.add('hidden');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                button.classList.remove('hidden');
            });
        }
    }

    button.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        button.classList.add('hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('hidden');
        }
    });

    video.addEventListener('ended', function () {
        button.classList.remove('hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

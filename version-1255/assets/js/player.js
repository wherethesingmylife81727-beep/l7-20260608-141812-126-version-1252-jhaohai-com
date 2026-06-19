(function () {
    function setStatus(box, text) {
        var status = box.querySelector('[data-player-status]');
        if (status) {
            status.textContent = text;
        }
    }

    function attachPlayer(box) {
        var video = box.querySelector('video[data-src]');
        var button = box.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute('data-src');
        var ready = false;
        var hls = null;

        function initialize() {
            if (ready) {
                return;
            }
            ready = true;
            setStatus(box, '正在加载播放源');

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus(box, '播放源已就绪');
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus(box, '播放连接异常，请稍后重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus(box, '播放源已就绪');
            } else {
                video.src = source;
                setStatus(box, '正在尝试原生播放');
            }
        }

        function play() {
            initialize();
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    box.classList.add('is-playing');
                    setStatus(box, '正在播放');
                }).catch(function () {
                    box.classList.remove('is-playing');
                    setStatus(box, '点击播放按钮继续观看');
                });
            } else {
                box.classList.add('is-playing');
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            box.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            box.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
            box.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();

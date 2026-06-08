(function () {
    function initMoviePlayer(config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var hasStarted = false;
        var hlsInstance = null;

        if (!video || !button || !config.source) {
            return;
        }

        function attachSource() {
            if (video.src) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = config.source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(config.source);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = config.source;
        }

        function play() {
            attachSource();
            video.controls = true;
            button.classList.add('is-hidden');
            hasStarted = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!hasStarted || video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();

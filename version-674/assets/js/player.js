(function () {
  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function setupMoviePlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var button = document.querySelector(options.buttonSelector);
    var shell = document.querySelector(options.shellSelector);
    var source = options.source;
    var started = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    video.crossOrigin = 'anonymous';

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function attach() {
      if (started) {
        playVideo(video);
        return;
      }
      started = true;
      hideButton();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          playVideo(video);
        }, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        });
        return;
      }

      video.src = source;
      video.load();
      playVideo(video);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        attach();
      });
    }

    if (shell) {
      shell.addEventListener('click', function (event) {
        if (!started && event.target === shell) {
          attach();
        }
      });
    }

    video.addEventListener('click', function () {
      if (!started) {
        attach();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
}());

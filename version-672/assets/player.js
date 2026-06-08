(function () {
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-player-button]');
  var panel = document.querySelector('[data-player-panel]');
  var initialized = false;
  var hlsInstance = null;

  function attachStream() {
    if (!video || initialized) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    } else {
      video.src = stream;
    }

    initialized = true;
  }

  function hidePanel() {
    if (panel) {
      panel.classList.add('is-hidden');
    }
  }

  function playVideo() {
    if (!video) {
      return;
    }
    attachStream();
    hidePanel();
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (panel) {
          panel.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', hidePanel);
    video.addEventListener('pause', function () {
      if (panel && video.currentTime === 0) {
        panel.classList.remove('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    attachStream();
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();

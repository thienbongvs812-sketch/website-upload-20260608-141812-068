(function () {
  function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || attached) {
        return;
      }
      attached = true;
      video.crossOrigin = "anonymous";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      if (!video) {
        return;
      }
      attach();
      video.controls = true;
      if (button) {
        button.classList.add("is-hidden");
      }
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();

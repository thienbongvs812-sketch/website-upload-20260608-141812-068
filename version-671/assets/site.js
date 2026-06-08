var MovieSite = (function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-search]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));

      function value(el) {
        return el ? String(el.value || "").trim().toLowerCase() : "";
      }

      function apply() {
        var q = value(input);
        var r = value(region);
        var t = value(type);
        var y = value(year);
        cards.forEach(function (card) {
          var hay = String(card.getAttribute("data-search") || "").toLowerCase();
          var ok = true;
          if (q && hay.indexOf(q) === -1) {
            ok = false;
          }
          if (r && String(card.getAttribute("data-region") || "").toLowerCase().indexOf(r) === -1) {
            ok = false;
          }
          if (t && String(card.getAttribute("data-type") || "").toLowerCase().indexOf(t) === -1) {
            ok = false;
          }
          if (y && String(card.getAttribute("data-year") || "") !== y) {
            ok = false;
          }
          card.classList.toggle("hidden-card", !ok);
        });
      }

      [input, region, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayer(videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !url) {
      return;
    }

    var started = false;
    var hls;

    function load() {
      if (started) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      started = true;
    }

    function play() {
      load();
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!started) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });

  return {
    ready: ready,
    initPlayer: initPlayer
  };
})();

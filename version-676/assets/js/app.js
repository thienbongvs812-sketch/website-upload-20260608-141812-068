(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (menuToggle && siteNav) {
      menuToggle.addEventListener("click", function () {
        siteNav.classList.toggle("open");
      });
    }

    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG") {
        target.style.opacity = "0";
      }
    }, true);

    initHero();
    initFilters();
    initPlayers();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
      var searchInput = scope.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
      var items = Array.prototype.slice.call(scope.querySelectorAll(".searchable-item"));
      var emptyState = scope.querySelector("[data-empty-state]");

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function itemText(item) {
        return normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-year"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-category")
        ].join(" "));
      }

      function applyFilter() {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var activeFilters = {};

        selects.forEach(function (select) {
          var key = select.getAttribute("data-filter-select");
          var value = normalize(select.value);
          if (key && value) {
            activeFilters[key] = value;
          }
        });

        var visibleCount = 0;

        items.forEach(function (item) {
          var matchKeyword = !keyword || itemText(item).indexOf(keyword) !== -1;
          var matchSelects = Object.keys(activeFilters).every(function (key) {
            return normalize(item.getAttribute("data-" + key)) === activeFilters[key];
          });
          var visible = matchKeyword && matchSelects;

          item.style.display = visible ? "" : "none";

          if (visible) {
            visibleCount += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("show", visibleCount === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", applyFilter);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
      });

      applyFilter();
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video[data-video-url]");
      var playButton = shell.querySelector("[data-play-button]");
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function playVideo() {
        var src = video.getAttribute("data-video-url");

        if (!src) {
          return;
        }

        shell.classList.add("playing");

        if (video.getAttribute("data-loaded") !== "true") {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
          } else {
            video.src = src;
          }

          video.setAttribute("data-loaded", "true");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            shell.classList.remove("playing");
          });
        }
      }

      if (playButton) {
        playButton.addEventListener("click", playVideo);
      }

      shell.addEventListener("click", function (event) {
        if (event.target === shell) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove("playing");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }
})();

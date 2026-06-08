(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function norm(value) {
    return String(value || "").toLowerCase().trim();
  }

  function loadScript(src, id) {
    return new Promise(function (resolve, reject) {
      var existing = id ? document.getElementById(id) : null;
      if (existing) {
        if (existing.getAttribute("data-ready") === "1") {
          resolve();
          return;
        }
        existing.addEventListener("load", function () {
          resolve();
        }, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      if (id) {
        script.id = id;
      }
      script.onload = function () {
        script.setAttribute("data-ready", "1");
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupMenu() {
    var button = qs("[data-menu-button]");
    var nav = qs("[data-site-nav]");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = qsa(".hero-slide", slider);
    var dots = qsa("[data-hero-dot]", slider);
    var prev = qs("[data-hero-prev]", slider);
    var next = qs("[data-hero-next]", slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    qsa("[data-filter-scope]").forEach(function (scope) {
      var searchInput = qs("[data-search-input]", scope);
      var typeFilter = qs("[data-type-filter]", scope);
      var yearFilter = qs("[data-year-filter]", scope);
      var cards = qsa(".movie-card", scope);
      var empty = qs("[data-empty-state]", scope);

      function apply() {
        var text = norm(searchInput ? searchInput.value : "");
        var type = norm(typeFilter ? typeFilter.value : "");
        var year = norm(yearFilter ? yearFilter.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = norm([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchText = !text || haystack.indexOf(text) !== -1;
          var matchType = !type || norm(card.getAttribute("data-type")) === type;
          var matchYear = !year || norm(card.getAttribute("data-year")) === year;
          var ok = matchText && matchType && matchYear;

          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", apply);
      }
      if (typeFilter) {
        typeFilter.addEventListener("change", apply);
      }
      if (yearFilter) {
        yearFilter.addEventListener("change", apply);
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && searchInput) {
        searchInput.value = query;
      }

      apply();
    });
  }

  function readPlayerConfig(player) {
    var config = qs(".player-config", player);
    if (!config) {
      return null;
    }

    try {
      return JSON.parse(config.textContent || "{}");
    } catch (error) {
      return null;
    }
  }

  function setupPlayers() {
    qsa("[data-player]").forEach(function (player) {
      var video = qs(".player-video", player);
      var frame = qs(".player-frame", player);
      var overlay = qs(".player-overlay", player);
      var config = readPlayerConfig(player);

      if (!video || !frame || !overlay || !config || !config.src) {
        return;
      }

      function attachSource() {
        if (player.getAttribute("data-ready") === "1") {
          return Promise.resolve();
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = config.src;
          player.setAttribute("data-ready", "1");
          return Promise.resolve();
        }

        return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js", "hls-js").then(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(config.src);
            hls.attachMedia(video);
            player.hls = hls;
            player.setAttribute("data-ready", "1");
            return;
          }

          video.src = config.src;
          player.setAttribute("data-ready", "1");
        });
      }

      function start() {
        attachSource().then(function () {
          overlay.classList.add("is-hidden");
          video.controls = true;
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              overlay.classList.remove("is-hidden");
            });
          }
        });
      }

      overlay.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });

      frame.addEventListener("click", function (event) {
        if (event.target === video && video.controls) {
          return;
        }
        start();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();

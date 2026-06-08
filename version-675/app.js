(function () {
  var hlsPromise = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.searchable-item'));
    if (!items.length) {
      return;
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    searchInputs.forEach(function (input) {
      input.value = query;
    });

    function run() {
      var words = searchInputs.map(function (input) {
        return normalize(input.value);
      }).filter(Boolean).join(' ');
      var selectValues = selects.map(function (select) {
        return normalize(select.value);
      }).filter(Boolean);
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-filter-text'));
        var matchesText = !words || words.split(/\s+/).every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
        var matchesSelect = selectValues.every(function (value) {
          return haystack.indexOf(value) !== -1;
        });
        var matched = matchesText && matchesSelect;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', run);
    });
    selects.forEach(function (select) {
      select.addEventListener('change', run);
    });

    run();
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function initPlayer() {
    var box = document.querySelector('[data-player]');
    if (!box) {
      return;
    }

    var video = box.querySelector('video');
    var button = box.querySelector('[data-player-start]');
    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        prepared = true;
        return Promise.resolve();
      }

      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          prepared = true;
          return;
        }
        video.src = stream;
        prepared = true;
      });
    }

    function startPlayback() {
      box.classList.add('is-loading');
      prepare().then(function () {
        box.classList.add('is-started');
        return video.play();
      }).catch(function () {
        box.classList.remove('is-started');
      }).finally(function () {
        box.classList.remove('is-loading');
      });
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      box.classList.add('is-started');
    });
    video.addEventListener('ended', function () {
      box.classList.remove('is-started');
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayer();
  });
}());

(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var carousel = document.querySelector('.hero-carousel');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        if (i === current) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var input = document.querySelector('.js-search-input');
    var filters = Array.prototype.slice.call(document.querySelectorAll('.js-filter'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty]');
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (input && q) {
      input.value = q;
    }

    function matchesYear(card, value) {
      if (!value) {
        return true;
      }
      return normalize(card.getAttribute('data-year')).indexOf(value) === 0;
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var active = {};
      filters.forEach(function (filter) {
        active[filter.getAttribute('data-filter')] = normalize(filter.value);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var ok = !query || text.indexOf(query) !== -1;
        if (ok && active.category) {
          ok = normalize(card.getAttribute('data-category')) === active.category;
        }
        if (ok && active.type) {
          ok = normalize(card.getAttribute('data-type')).indexOf(active.type) !== -1;
        }
        if (ok && active.year) {
          ok = matchesYear(card, active.year);
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener('change', apply);
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());

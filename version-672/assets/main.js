(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-fallback-image]').forEach(function (image) {
    image.addEventListener('error', function () {
      var poster = image.closest('.poster') || image.parentElement;
      if (poster) {
        poster.classList.add('is-empty');
      }
      image.remove();
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === active);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        showSlide(position);
        startAuto();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(active - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startAuto();
      });
    }

    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    showSlide(0);
    startAuto();
  }

  document.querySelectorAll('[data-global-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        event.preventDefault();
        window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var input = document.querySelector('[data-search-input]');
  var grid = document.querySelector('[data-card-grid]');
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';
  var sortSelect = document.querySelector('[data-sort-select]');

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilter() {
    var keyword = normalize(input ? input.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var source = normalize(card.getAttribute('data-search'));
      var type = card.getAttribute('data-type') || '';
      var matchesKeyword = !keyword || source.indexOf(keyword) !== -1;
      var matchesType = activeFilter === 'all' || type.indexOf(activeFilter) !== -1;
      var shouldShow = matchesKeyword && matchesType;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  function applySort() {
    if (!grid || !sortSelect) {
      return;
    }
    var mode = sortSelect.value;
    var sorted = cards.slice();

    sorted.sort(function (a, b) {
      if (mode === 'newest') {
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      }
      if (mode === 'oldest') {
        return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
      }
      if (mode === 'title') {
        return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
      }
      return 0;
    });

    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
    cards = sorted;
    applyFilter();
  }

  document.querySelectorAll('[data-filter-value]').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('[data-filter-value]').forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      activeFilter = button.getAttribute('data-filter-value') || 'all';
      applyFilter();
    });
  });

  if (input) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
    }
    input.addEventListener('input', applyFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }

  applyFilter();
})();

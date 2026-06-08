(function() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const searchInput = document.querySelector('[data-movie-search]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyTip = document.querySelector('[data-empty-tip]');
  const filters = Array.from(document.querySelectorAll('[data-filter-value]'));
  let filterValue = '';

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function textFor(card) {
    return [
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.textContent
    ].join(' ').toLowerCase();
  }

  function updateCards() {
    if (!cards.length) {
      return;
    }
    const keyword = normalize(searchInput ? searchInput.value : '');
    let visible = 0;
    cards.forEach(function(card) {
      const haystack = textFor(card);
      const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchedFilter = !filterValue || haystack.indexOf(filterValue.toLowerCase()) !== -1;
      const matched = matchedKeyword && matchedFilter;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (emptyTip) {
      emptyTip.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateCards);
  }

  filters.forEach(function(button) {
    button.addEventListener('click', function() {
      filters.forEach(function(item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      filterValue = button.dataset.filterValue || '';
      updateCards();
    });
  });
})();

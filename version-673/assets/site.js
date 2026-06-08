(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initPageSearch() {
        var input = document.querySelector('[data-page-search]');
        var cards = selectAll('[data-movie-card]');
        var chips = selectAll('[data-filter-category]');
        var activeCategory = 'all';

        if (!input && !chips.length) {
            return;
        }

        function filter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var category = card.getAttribute('data-category') || '';
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedCategory = activeCategory === 'all' || category === activeCategory;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedCategory));
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('search');
            if (initial) {
                input.value = initial;
            }
            input.addEventListener('input', filter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeCategory = chip.getAttribute('data-filter-category') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                filter();
            });
        });

        filter();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initPageSearch();
    });
})();

import { H as Hls } from "./hls.js";

const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

ready(() => {
    setupMobileNavigation();
    setupHeroCarousel();
    setupCatalogFilters();
    setupSearchPage();
    setupVideoPlayers();
});

function setupMobileNavigation() {
    const toggle = document.querySelector("[data-mobile-nav-toggle]");
    const menu = document.querySelector("[data-mobile-nav]");

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener("click", () => {
        menu.classList.toggle("is-open");
        toggle.classList.toggle("is-active");
    });
}

function setupHeroCarousel() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const thumbs = Array.from(hero.querySelectorAll("[data-hero-thumb]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let currentIndex = 0;
    let timer = null;

    const showSlide = (targetIndex) => {
        if (slides.length === 0) {
            return;
        }

        currentIndex = (targetIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === currentIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === currentIndex);
        });

        thumbs.forEach((thumb, index) => {
            thumb.classList.toggle("is-active", index === currentIndex);
        });
    };

    const startTimer = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5200);
    };

    prev?.addEventListener("click", () => {
        showSlide(currentIndex - 1);
        startTimer();
    });

    next?.addEventListener("click", () => {
        showSlide(currentIndex + 1);
        startTimer();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            startTimer();
        });
    });

    hero.addEventListener("mouseenter", () => window.clearInterval(timer));
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
}

function setupCatalogFilters() {
    const roots = Array.from(document.querySelectorAll("[data-filter-root]"));

    roots.forEach((root) => {
        const keywordInput = root.querySelector("[data-filter-keyword]");
        const yearSelect = root.querySelector("[data-filter-year]");
        const regionSelect = root.querySelector("[data-filter-region]");
        const typeSelect = root.querySelector("[data-filter-type]");
        const result = root.querySelector("[data-filter-result]");
        const section = root.closest(".content-section") || document;
        const cards = Array.from(section.querySelectorAll("[data-movie-card]"));

        const applyFilter = () => {
            const keyword = normalizeText(keywordInput?.value);
            const year = normalizeText(yearSelect?.value);
            const region = normalizeText(regionSelect?.value);
            const type = normalizeText(typeSelect?.value);
            let visibleCount = 0;

            cards.forEach((card) => {
                const fields = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent,
                ].map(normalizeText).join(" ");

                const matchesKeyword = !keyword || fields.includes(keyword);
                const matchesYear = !year || normalizeText(card.dataset.year) === year;
                const matchesRegion = !region || normalizeText(card.dataset.region) === region;
                const matchesType = !type || normalizeText(card.dataset.type) === type;
                const isVisible = matchesKeyword && matchesYear && matchesRegion && matchesType;

                card.classList.toggle("is-hidden-by-filter", !isVisible);

                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (result) {
                result.textContent = `正在显示 ${visibleCount} 部影片`;
            }
        };

        [keywordInput, yearSelect, regionSelect, typeSelect].forEach((control) => {
            control?.addEventListener("input", applyFilter);
            control?.addEventListener("change", applyFilter);
        });

        applyFilter();
    });
}

function setupSearchPage() {
    const page = document.querySelector("[data-search-page]");

    if (!page) {
        return;
    }

    const input = page.querySelector("[data-site-search-input]");
    const button = page.querySelector("[data-site-search-button]");
    const results = page.querySelector("[data-site-search-results]");
    const status = page.querySelector("[data-site-search-status]");
    const quickTerms = Array.from(page.querySelectorAll("[data-search-term]"));
    const movies = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    const renderMovie = (movie) => {
        const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
        return `
            <article class="movie-card" data-movie-card>
                <a href="${escapeAttribute(movie.url)}" class="movie-card__link">
                    <figure class="poster-frame">
                        <img src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.title)}" loading="lazy" onerror="this.classList.add('is-hidden-image')">
                        <span class="poster-year">${escapeHtml(movie.year)}</span>
                        <span class="poster-play" aria-hidden="true">▶</span>
                    </figure>
                    <div class="movie-card__body">
                        <h3>${escapeHtml(movie.title)}</h3>
                        <p class="movie-card__meta">${escapeHtml(movie.region)} · ${escapeHtml(movie.type)} · ${escapeHtml(movie.genre)}</p>
                        <p class="movie-card__line">${escapeHtml(movie.oneLine || "")}</p>
                        <div class="movie-card__tags">${tags}</div>
                    </div>
                </a>
            </article>`;
    };

    const search = () => {
        const query = normalizeText(input?.value);

        if (!query) {
            results.innerHTML = "";
            status.textContent = "请输入关键词开始搜索，也可以点击上方快捷词。";
            return;
        }

        const matched = movies.filter((movie) => {
            const fields = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                ...(movie.tags || []),
            ].map(normalizeText).join(" ");
            return fields.includes(query);
        }).slice(0, 120);

        results.innerHTML = matched.map(renderMovie).join("\n");
        status.textContent = matched.length > 0
            ? `找到 ${matched.length} 个相关结果，最多展示前 120 个。`
            : "没有找到相关影片，请尝试更换关键词。";
    };

    button?.addEventListener("click", search);
    input?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            search();
        }
    });

    quickTerms.forEach((termButton) => {
        termButton.addEventListener("click", () => {
            input.value = termButton.dataset.searchTerm || "";
            search();
        });
    });

    if (initialQuery && input) {
        input.value = initialQuery;
        search();
    }
}

function setupVideoPlayers() {
    const players = Array.from(document.querySelectorAll("[data-video-player]"));

    players.forEach((player) => {
        const video = player.querySelector("video");
        const playButton = player.querySelector("[data-video-play]");
        const message = player.querySelector("[data-video-message]");
        const sourceUrl = player.dataset.videoSrc;
        let hls = null;
        let hasLoaded = false;

        if (!video || !sourceUrl) {
            return;
        }

        const setMessage = (text) => {
            if (message) {
                message.textContent = text || "";
            }
        };

        const loadSource = () => {
            if (hasLoaded) {
                return Promise.resolve();
            }

            hasLoaded = true;
            setMessage("正在加载播放源...");

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90,
                });

                hls.loadSource(sourceUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setMessage("");
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        setMessage("网络连接异常，正在尝试重新加载。")
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        setMessage("媒体加载异常，正在尝试恢复。")
                        hls.recoverMediaError();
                    } else {
                        setMessage("当前播放源暂时无法播放。")
                        hls.destroy();
                    }
                });

                return Promise.resolve();
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                setMessage("");
                return Promise.resolve();
            }

            setMessage("当前浏览器不支持该播放格式。")
            return Promise.resolve();
        };

        const play = async () => {
            await loadSource();

            try {
                await video.play();
                player.classList.add("is-playing");
                setMessage("");
            } catch (error) {
                setMessage("请再次点击播放按钮。")
            }
        };

        playButton?.addEventListener("click", play);

        video.addEventListener("play", () => {
            player.classList.add("is-playing");
        });

        video.addEventListener("pause", () => {
            player.classList.remove("is-playing");
        });

        window.addEventListener("beforeunload", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
}

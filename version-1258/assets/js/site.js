(function () {
    var root = document.body ? document.body.getAttribute("data-root") || "" : "";

    function resolvePath(path) {
        if (!path) {
            return root || "";
        }
        if (/^(https?:)?\/\//.test(path)) {
            return path;
        }
        return root + path;
    }

    function markImage(frame) {
        if (frame) {
            frame.classList.add("cover-muted");
        }
    }

    document.querySelectorAll(".poster-frame img").forEach(function (img) {
        img.addEventListener("error", function () {
            markImage(img.closest(".poster-frame"));
        }, { once: true });
    });

    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeSlide);
        });
    }

    function startHero() {
        if (heroTimer || slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
            showSlide(index);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                heroTimer = null;
            }
            startHero();
        });
    });
    startHero();

    var searchLayer = document.querySelector("[data-search-layer]");
    var searchInput = document.querySelector("[data-global-search-input]");
    var searchResults = document.querySelector("[data-global-search-results]");
    var searchData = window.MOVIE_SEARCH_INDEX || [];

    function openSearch() {
        if (!searchLayer) {
            return;
        }
        searchLayer.hidden = false;
        window.setTimeout(function () {
            if (searchInput) {
                searchInput.focus();
            }
        }, 30);
        renderSearch("");
    }

    function closeSearch() {
        if (searchLayer) {
            searchLayer.hidden = true;
        }
    }

    function renderSearch(value) {
        if (!searchResults) {
            return;
        }
        var query = (value || "").trim().toLowerCase();
        var list = searchData;
        if (query) {
            list = searchData.filter(function (item) {
                var haystack = [
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    item.category,
                    (item.tags || []).join(" "),
                    item.desc
                ].join(" ").toLowerCase();
                return haystack.indexOf(query) !== -1;
            });
        }
        list = list.slice(0, 18);
        if (!list.length) {
            searchResults.innerHTML = '<p class="empty-result">没有找到匹配影片</p>';
            return;
        }
        searchResults.innerHTML = list.map(function (item) {
            var tags = (item.tags || []).slice(0, 3).join(" · ");
            return [
                '<a class="search-result" href="' + resolvePath(item.url) + '">',
                '<span class="poster-frame"><img src="' + resolvePath(item.cover) + '" alt="' + escapeHtml(item.title) + '"></span>',
                '<span>',
                '<h3>' + escapeHtml(item.title) + '</h3>',
                '<p>' + escapeHtml(item.desc || "") + '</p>',
                '<small>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(tags) + '</small>',
                '</span>',
                '</a>'
            ].join("");
        }).join("");
        searchResults.querySelectorAll(".poster-frame img").forEach(function (img) {
            img.addEventListener("error", function () {
                markImage(img.closest(".poster-frame"));
            }, { once: true });
        });
    }

    function escapeHtml(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    document.querySelectorAll("[data-open-search]").forEach(function (button) {
        button.addEventListener("click", openSearch);
    });
    document.querySelectorAll("[data-close-search]").forEach(function (button) {
        button.addEventListener("click", closeSearch);
    });
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            renderSearch(searchInput.value);
        });
    }
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSearch();
        }
    });

    document.querySelectorAll("[data-inline-filter]").forEach(function (filterBox) {
        var section = filterBox.closest("section") || document;
        var list = section.querySelector("[data-card-list]");
        if (!list) {
            list = filterBox.parentElement ? filterBox.parentElement.querySelector("[data-card-list]") : null;
        }
        if (!list) {
            return;
        }
        var input = filterBox.querySelector("[data-filter-input]");
        var yearSelect = filterBox.querySelector("[data-year-filter]");
        var sortSelect = filterBox.querySelector("[data-sort-filter]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var sort = sortSelect ? sortSelect.value : "score";
            var visible = cards.filter(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-region") || ""
                ].join(" ").toLowerCase();
                var itemYear = card.getAttribute("data-year") || "";
                var ok = (!query || text.indexOf(query) !== -1) && (!year || itemYear === year);
                card.hidden = !ok;
                return ok;
            });
            visible.sort(function (a, b) {
                if (sort === "title") {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
                }
                var key = sort === "year" ? "data-year" : "data-score";
                return parseFloat(b.getAttribute(key) || "0") - parseFloat(a.getAttribute(key) || "0");
            });
            visible.forEach(function (card) {
                list.appendChild(card);
            });
        }

        [input, yearSelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    });
})();

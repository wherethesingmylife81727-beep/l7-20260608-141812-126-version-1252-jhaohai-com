(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var subtitle = document.querySelector('[data-search-subtitle]');
    var empty = document.querySelector('[data-search-empty]');
    var movies = window.SEARCH_MOVIES || [];

    if (!form || !input || !results) {
        return;
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
            '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
            '<div class="poster-art" style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.92)), url(\'' + movie.cover + '\');">' +
            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
            '</div>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function runSearch(query) {
        var keyword = normalize(query);
        var matched = keyword ? movies.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' '));

            return haystack.indexOf(keyword) !== -1;
        }) : movies.slice(0, 24);

        results.innerHTML = matched.slice(0, 120).map(card).join('');

        if (title) {
            title.textContent = keyword ? '搜索结果' : '推荐影片';
        }

        if (subtitle) {
            subtitle.textContent = keyword ? '以下为匹配关键词的影视内容。' : '可通过关键词检索片名、简介、地区、类型和标签。';
        }

        if (empty) {
            empty.classList.toggle('show', matched.length === 0);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
        input.value = initialQuery;
        runSearch(initialQuery);
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        runSearch(input.value);
        var query = input.value.trim();
        var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.history.replaceState(null, '', nextUrl);
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".searchTrackInput");
    const recentList = document.querySelector(".recent-searches-list");
    const recentPanel = document.querySelector(".recent-searches-panel");

    if (!searchInput || !recentList || !recentPanel) return;

    const form = searchInput.closest("form");
    if (form) form.addEventListener("submit", (e) => e.preventDefault());

    const MAX_RECENT = 5;

    function filterTracks(query) {
        const wraps = document.querySelectorAll(".track-wrap");
        const q = query.toLowerCase().trim();
        wraps.forEach(wrap => {
            const name = wrap.querySelector(".trackName")?.textContent.toLowerCase() || "";
            wrap.style.display = q === "" || name.includes(q) ? "" : "none";
        });
    }

    function saveRecentSearch(term) {
        let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
        recent = recent.filter(item => item !== term);
        recent.unshift(term);
        if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
        localStorage.setItem("recentSearches", JSON.stringify(recent));
        renderRecentSearches();
    }

    function renderRecentSearches() {
        const recent = JSON.parse(localStorage.getItem("recentSearches")) || [];

        if (recent.length === 0) {
            recentList.innerHTML = "<div class='recent-empty'>No recent searches</div>";
            return;
        }

        recentList.innerHTML = recent
            .map(item => `<div class="recent-item">${item}</div>`)
            .join("");

        recentList.querySelectorAll(".recent-item").forEach(el => {
            el.addEventListener("click", () => {
                searchInput.value = el.textContent;
                filterTracks(el.textContent.trim());
            });
        });
    }

    searchInput.addEventListener("input", () => {
        filterTracks(searchInput.value);
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const val = searchInput.value.trim().toLowerCase();
        if (val) saveRecentSearch(val);
    });

    renderRecentSearches();
});
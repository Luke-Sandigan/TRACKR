document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // PAGE GUARD (ONLY TRACKS PAGE)
    // =====================
    const searchInput = document.querySelector(".searchTrackInput");
    const recentList = document.querySelector(".recent-searches-list");
    const recentPanel = document.querySelector(".recent-searches-panel");

    if (!searchInput || !recentList || !recentPanel) return;

    // =====================
    // PREVENT FORM SUBMIT RELOAD
    // =====================
    const form = searchInput.closest("form");
    if (form) {
        form.addEventListener("submit", (e) => e.preventDefault());
    }

    const MAX_RECENT = 5;

    // =====================
    // SAVE RECENT SEARCH
    // =====================
    function saveRecentSearch(term) {
        let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
        recent = recent.filter(item => item !== term);
        recent.unshift(term);
        if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
        localStorage.setItem("recentSearches", JSON.stringify(recent));
        renderRecentSearches();
    }

    // =====================
    // RENDER RECENT SEARCHES (RIGHT PANEL)
    // =====================
    function renderRecentSearches() {
        const recent = JSON.parse(localStorage.getItem("recentSearches")) || [];

        if (recent.length === 0) {
            recentList.innerHTML = "<div class='recent-empty'>No recent searches</div>";
            return;
        }

        recentList.innerHTML = recent
            .map(item => `<div class="recent-item">${item}</div>`)
            .join("");

        // click to re-run search
        recentList.querySelectorAll(".recent-item").forEach(el => {
            el.addEventListener("click", () => {
                searchInput.value = el.textContent;
                runSearch(el.textContent.trim().toLowerCase());
            });
        });
    }

    // =====================
    // SEARCH LOGIC (uses current shelves + tracks from tracks.js)
    // =====================
    async function runSearch(searchValue) {
        if (!searchValue) return;

        const shelvesData = (typeof shelves !== "undefined") ? shelves : [];

        if (shelvesData.length === 0) {
            alert("No shelves loaded yet. Try again in a moment.");
            return;
        }

        let foundShelfId = null;

        for (const shelf of shelvesData) {
            try {
                const res = await fetch(`/api/shelves/${shelf.id}/tracks`, {
                    headers: { "Accept": "application/json" }
                });
                if (!res.ok) continue;
                const tracks = await res.json();
                const match = tracks.find(t =>
                    t.name.toLowerCase().includes(searchValue)
                );
                if (match) {
                    foundShelfId = shelf.id;
                    foundTrack = match;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        saveRecentSearch(searchValue);

        if (foundShelfId) {
            currentShelfId = foundShelfId;
            if (typeof renderTracks === "function") await renderTracks();
            searchInput.value = "";
        } else {
            alert("No matching track found.");
        }
    }

    // =====================
    // KEYDOWN HANDLER
    // =====================
    searchInput.addEventListener("keydown", async (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const searchValue = searchInput.value.trim().toLowerCase();
        if (!searchValue) return;
        await runSearch(searchValue);
    });

    // =====================
    // INIT
    // =====================
    renderRecentSearches();

});
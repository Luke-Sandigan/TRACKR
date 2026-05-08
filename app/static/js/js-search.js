(() => {
    // =====================
    // PAGE GUARD (ONLY TRACKS PAGE)
    // =====================
    const searchInput = document.querySelector(".searchTrackInput");
    const recentContainer = document.querySelector(".recent-searches");

    if (!searchInput || !recentContainer) return;

    // =====================
    // PREVENT FORM SUBMIT RELOAD
    // =====================
    const form = searchInput.closest("form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
        });
    }

    // =====================
    // CONFIG
    // =====================
    const MAX_RECENT = 5;

    // =====================
    // SAVE RECENT SEARCH
    // =====================
    function saveRecentSearch(term) {
        let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];

        recent = recent.filter(item => item !== term);
        recent.unshift(term);

        if (recent.length > MAX_RECENT) {
            recent = recent.slice(0, MAX_RECENT);
        }

        localStorage.setItem("recentSearches", JSON.stringify(recent));
        renderRecentSearches();
    }

    // =====================
    // RENDER RECENT SEARCHES
    // =====================
    function renderRecentSearches() {
        const recent = JSON.parse(localStorage.getItem("recentSearches")) || [];

        if (recent.length === 0) {
            recentContainer.style.display = "none";
            recentContainer.innerHTML = "";
            return;
        }

        recentContainer.style.display = "flex";

        recentContainer.innerHTML = recent
            .map(item => `<div class="recent-item">${item}</div>`)
            .join("");
    }

    // =====================
    // MAIN SEARCH LOGIC
    // =====================
    searchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();

        const searchValue = searchInput.value.trim().toLowerCase();
        if (!searchValue) return;

        // safety check
        if (typeof lists === "undefined" || typeof renderTracks === "undefined") {
            console.error("Dependencies not loaded: lists or renderTracks missing");
            return;
        }

        let found = false;

        for (let listName in lists) {
            const foundTrack = lists[listName].find(track =>
                track.name.toLowerCase().includes(searchValue)
            );

            if (foundTrack) {
                saveRecentSearch(searchValue);

                currentList = listName;
                renderTracks();

                searchInput.value = "";
                found = true;
                break;
            }
        }

        if (!found) {
            alert("No matching track found.");
            saveRecentSearch(searchValue);
        }
    });

    // =====================
    // CLICK TO REUSE SEARCH
    // =====================
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("recent-item")) {
            searchInput.value = e.target.textContent;

            searchInput.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Enter" })
            );
        }
    });

    // =====================
    // SHOW ON FOCUS
    // =====================
    searchInput.addEventListener("focus", renderRecentSearches);

    searchInput.addEventListener("blur", () => {
        setTimeout(() => {
            recentContainer.style.display = "none";
        }, 150);
    });

    // =====================
    // INIT
    // =====================
    document.addEventListener("DOMContentLoaded", () => {
        renderRecentSearches();
    });

})();
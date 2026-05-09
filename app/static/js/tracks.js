// Tracks + shelves are persisted via backend APIs.
// This script is included site-wide, so everything is guarded.

const addListInput = document.querySelector(".addList");
const addListButton = document.querySelector(".addListButton");
const listParent = document.querySelector(".listParent");

const addNameInput = document.querySelector(".addName");
const addLinkInput = document.querySelector(".addLink");
const addTrackButton = document.querySelector(".addTrackButton");

const tracksContainer = document.querySelector(".tracks");
const headerTitle = document.querySelector(".headerContent");

let shelves = [];
let currentShelfId = null;

function isTracksPage() {
    return Boolean(tracksContainer && headerTitle && addNameInput && addLinkInput && addTrackButton);
}

function getCurrentShelfFromUrl() {
    const url = new URL(window.location.href);
    const shelfId = url.searchParams.get("shelf");
    return shelfId ? Number(shelfId) : null;
}

function navigateToTracks(shelfId) {
    if (!shelfId) {
        window.location.href = "/tracks";
        return;
    }
    window.location.href = `/tracks?shelf=${encodeURIComponent(String(shelfId))}`;
}

async function apiGet(path) {
    const res = await fetch(path, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
    return await res.json();
}

async function apiPost(path, body) {
    const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `POST ${path} failed (${res.status})`);
    return data;
}

async function apiDelete(path) {
    const res = await fetch(path, { method: "DELETE", headers: { "Accept": "application/json" } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `DELETE ${path} failed (${res.status})`);
    return data;
}

function normalizeUrl(raw) {
    const v = (raw || "").trim();
    if (!v) return "";
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    return "https://" + v;
}


async function loadShelves() {
    shelves = await apiGet("/api/shelves");
}

function pickDefaultShelfId() {
    const fromUrl = getCurrentShelfFromUrl();
    if (fromUrl && shelves.some(s => s.id === fromUrl)) return fromUrl;
    return shelves[0]?.id ?? null;
}

// =====================
// ADD SHELF
// =====================
if (addListButton && addListInput) {
    addListButton.addEventListener("click", async () => {
        const name = addListInput.value.trim();
        if (!name) return;

        try {
            const created = await apiPost("/api/shelves", { name });
            await loadShelves();
            currentShelfId = created.id;
            renderShelves();

            // Requirement: shelf buttons should direct to tracks page.
            if (!isTracksPage()) navigateToTracks(currentShelfId);
            if (isTracksPage()) await renderTracks();

            addListInput.value = "";
        } catch (e) {
            alert(e?.message || "Failed to create shelf");
        }
    });
}


// =====================
// RENDER SHELVES (LEFT SIDE)
// =====================
function renderShelves() {
    if (!listParent) return;
    listParent.innerHTML = "";

    shelves.forEach((shelf) => {
        const listDiv = document.createElement("div");
        listDiv.classList.add("listChild");

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.classList.add("removeList");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("grandChild");
        nameDiv.textContent = shelf.name;

        // CLICK SHELF → switch or route to tracks page
        nameDiv.addEventListener("click", async () => {
            currentShelfId = shelf.id;
            if (!isTracksPage()) {
                navigateToTracks(currentShelfId);
                return;
            }
            await renderTracks();
        });

        // DELETE SHELF
        removeBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                await apiDelete(`/api/shelves/${shelf.id}`);
                await loadShelves();
                if (currentShelfId === shelf.id) currentShelfId = pickDefaultShelfId();
                renderShelves();
                if (isTracksPage()) await renderTracks();
            } catch (err) {
                alert(err?.message || "Failed to delete shelf");
            }
        });

        listDiv.appendChild(removeBtn);
        listDiv.appendChild(nameDiv);
        listParent.appendChild(listDiv);
    });
}


// =====================
// ADD TRACK
// =====================
if (addTrackButton) {
    const submitTrack = async () => {
        if (!currentShelfId) {
            alert("Select a shelf first!");
            return;
        }

        const name = (addNameInput?.value || "").trim();
        const link = normalizeUrl(addLinkInput?.value || "");
        if (!name || !link) return;

        try {
            await apiPost("/api/tracks", { shelf_id: currentShelfId, name, link });
            await renderTracks();
            addNameInput.value = "";
            addLinkInput.value = "";
        } catch (e) {
            alert(e?.message || "Failed to add track");
        }
    };

    addTrackButton.addEventListener("click", submitTrack);

    // UX: Enter key should also submit the track.
    if (addNameInput) {
        addNameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submitTrack();
        });
    }
    if (addLinkInput) {
        addLinkInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submitTrack();
        });
    }
}


// =====================
// RENDER TRACKS (RIGHT SIDE)
// =====================
async function renderTracks() {
    if (!isTracksPage()) return;
    tracksContainer.innerHTML = "";

    if (!currentShelfId) {
        headerTitle.textContent = "No Shelf Selected";
        return;
    }

    const shelfName = shelves.find(s => s.id === currentShelfId)?.name || "Tracks";
    headerTitle.textContent = shelfName;

    let tracks = [];
    try {
        tracks = await apiGet(`/api/shelves/${currentShelfId}/tracks`);
    } catch (e) {
        headerTitle.textContent = `${shelfName} (failed to load)`;
        console.error(e);
        return;
    }

    tracks.forEach((track) => {
        const trackDiv = document.createElement("div");
        trackDiv.classList.add("addTrack");

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("trackContent");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("trackName");
        nameDiv.textContent = track.name;

        const linkDiv = document.createElement("div");
        linkDiv.classList.add("trackLink");
        linkDiv.textContent = track.link;

        // =====================
        // REMOVE BUTTON (X)
        // =====================
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.classList.add("removeTrackBtn");

        removeBtn.addEventListener("click", async (e) => {
            e.stopPropagation(); 

            try {
                await apiDelete(`/api/tracks/${track.id}`);
                await renderTracks();
            } catch (err) {
                alert(err?.message || "Failed to delete track");
            }
        });

        // =====================
        // OPEN LINK ON CLICK (except X)
        // =====================
        trackDiv.addEventListener("click", () => {
            let url = track.link;

            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            window.open(url, "_blank");
        });

        contentDiv.appendChild(nameDiv);
        contentDiv.appendChild(linkDiv);
        trackDiv.appendChild(contentDiv);
        trackDiv.appendChild(removeBtn); 
        tracksContainer.appendChild(trackDiv);
    });
}


// =====================
// INITIAL LOAD (VERY IMPORTANT)
// =====================
async function init() {
    try {
        await loadShelves();
        currentShelfId = pickDefaultShelfId();

        // If no shelves exist yet, bootstrap one so the app is usable immediately.
        if (!currentShelfId) {
            const created = await apiPost("/api/shelves", { name: "My Shelf" });
            await loadShelves();
            currentShelfId = created.id;
        }

        renderShelves();
        if (isTracksPage()) await renderTracks();
    } catch (e) {
        // Don't hard-crash the whole site if API isn't reachable.
        // This keeps non-tracks pages usable.
        console.error(e);
    }
}

init();
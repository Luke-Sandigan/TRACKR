const addListInput = document.querySelector(".addList");
const addListButton = document.querySelector(".addListButton");
const listParent = document.querySelector(".listParent");

const addNameInput = document.querySelector(".addName");
const addLinkInput = document.querySelector(".addLink");
const addOriginalPriceInput = document.querySelector(".addOriginalPrice");
const addCurrentPriceInput = document.querySelector(".addCurrentPrice");
const addNotesInput = document.querySelector(".addNotes");
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

async function apiPatch(path, body) {
    const res = await fetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `PATCH ${path} failed (${res.status})`);
    return data;
}

function normalizeUrl(raw) {
    const v = (raw || "").trim();
    if (!v) return "";
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    return "https://" + v;
}

function formatPrice(val) {
    if (val == null) return null;
    return "₱" + Number(val).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcSavingsPct(original, current) {
    if (!original || !current || original <= 0) return null;
    const pct = ((original - current) / original) * 100;
    return pct > 0 ? Math.round(pct) : null;
}

async function loadShelves() {
    shelves = await apiGet("/api/shelves");
}

const shelfTrackCounts = {};

async function fetchTrackCount(shelfId) {
    try {
        const tracks = await apiGet(`/api/shelves/${shelfId}/tracks`);
        shelfTrackCounts[shelfId] = Array.isArray(tracks) ? tracks.length : 0;
    } catch {
        shelfTrackCounts[shelfId] = 0;
    }
}

function pickDefaultShelfId() {
    const fromUrl = getCurrentShelfFromUrl();
    if (fromUrl && shelves.some(s => s.id === fromUrl)) return fromUrl;
    if (shelves.length > 0) {
        window.history.replaceState({}, "", `/tracks?shelf=${shelves[0].id}`);
        return shelves[0].id;
    }
    return null;
}

if (addListButton && addListInput) {
    addListButton.addEventListener("click", async () => {
        const name = addListInput.value.trim();
        if (!name) return;

        try {
            const created = await apiPost("/api/shelves", { name });
            await loadShelves();
            currentShelfId = created.id;
            shelfTrackCounts[created.id] = 0;
            renderShelves();

            if (!isTracksPage()) navigateToTracks(currentShelfId);
            if (isTracksPage()) await renderTracks();

            addListInput.value = "";
        } catch (e) {
            alert(e?.message || "Failed to create shelf");
        }
    });
}

function renderShelves() {
    if (!listParent) return;
    listParent.innerHTML = "";

    shelves.forEach((shelf) => {
        const listDiv = document.createElement("div");
        listDiv.classList.add("listChild");
        if (shelf.id === currentShelfId) listDiv.classList.add("active-shelf");

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.classList.add("removeList");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("grandChild");

        const count = shelfTrackCounts[shelf.id] ?? "·";
        nameDiv.innerHTML = `<span class="shelf-name-text">${shelf.name}</span><span class="shelf-badge">${count}</span>`;

        nameDiv.addEventListener("click", async () => {
            currentShelfId = shelf.id;
            if (!isTracksPage()) {
                navigateToTracks(currentShelfId);
                return;
            }
            renderShelves();
            await renderTracks();
        });

        removeBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                await apiDelete(`/api/shelves/${shelf.id}`);
                delete shelfTrackCounts[shelf.id];
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

if (addTrackButton) {
    const submitTrack = async () => {
        if (!currentShelfId) {
            alert("Select a shelf first!");
            return;
        }

        const name = (addNameInput?.value || "").trim();
        const link = normalizeUrl(addLinkInput?.value || "");
        if (!name || !link) return;

        const originalPrice = addOriginalPriceInput?.value ? parseFloat(addOriginalPriceInput.value) : null;
        const currentPrice = addCurrentPriceInput?.value ? parseFloat(addCurrentPriceInput.value) : null;
        const notes = (addNotesInput?.value || "").trim() || null;

        try {
            await apiPost("/api/tracks", {
                shelf_id: currentShelfId,
                name,
                link,
                original_price: originalPrice,
                current_price: currentPrice,
                notes,
            });

            shelfTrackCounts[currentShelfId] = (shelfTrackCounts[currentShelfId] ?? 0) + 1;
            renderShelves();
            await renderTracks();

            if (addNameInput) addNameInput.value = "";
            if (addLinkInput) addLinkInput.value = "";
            if (addOriginalPriceInput) addOriginalPriceInput.value = "";
            if (addCurrentPriceInput) addCurrentPriceInput.value = "";
            if (addNotesInput) addNotesInput.value = "";
        } catch (e) {
            alert(e?.message || "Failed to add track");
        }
    };

    addTrackButton.addEventListener("click", submitTrack);

    [addNameInput, addLinkInput, addOriginalPriceInput, addCurrentPriceInput, addNotesInput].forEach(el => {
        if (el) el.addEventListener("keydown", (e) => { if (e.key === "Enter") submitTrack(); });
    });
}

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

    shelfTrackCounts[currentShelfId] = tracks.length;
    renderShelves();

    if (tracks.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("tracks-empty");
        empty.innerHTML = `<i class="ph ph-shopping-bag-open"></i><p>No items in this shelf yet.</p>`;
        tracksContainer.appendChild(empty);
        return;
    }

    tracks.forEach((track) => {
        const trackDiv = document.createElement("div");
        trackDiv.classList.add("addTrack");

        const savingsPct = calcSavingsPct(track.original_price, track.current_price);
        const hasPrices = track.original_price != null || track.current_price != null;

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("trackContent");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("trackName");
        nameDiv.textContent = track.name;

        const linkDiv = document.createElement("div");
        linkDiv.classList.add("trackLink");
        linkDiv.textContent = track.link;

        contentDiv.appendChild(nameDiv);
        contentDiv.appendChild(linkDiv);

        if (hasPrices) {
            const priceRow = document.createElement("div");
            priceRow.classList.add("trackPriceRow");

            if (track.original_price != null) {
                const origSpan = document.createElement("span");
                origSpan.classList.add("trackOriginalPrice");
                origSpan.textContent = formatPrice(track.original_price);
                priceRow.appendChild(origSpan);
            }

            if (track.current_price != null) {
                const arrow = document.createElement("span");
                arrow.classList.add("trackPriceArrow");
                arrow.innerHTML = `<i class="ph ph-arrow-right"></i>`;
                priceRow.appendChild(arrow);

                const curSpan = document.createElement("span");
                curSpan.classList.add("trackCurrentPrice");
                curSpan.textContent = formatPrice(track.current_price);
                priceRow.appendChild(curSpan);
            }

            if (savingsPct !== null) {
                const badge = document.createElement("span");
                badge.classList.add("trackSavingsBadge");
                badge.textContent = `-${savingsPct}%`;
                priceRow.appendChild(badge);
            }

            contentDiv.appendChild(priceRow);
        }

        if (track.notes) {
            const notesDiv = document.createElement("div");
            notesDiv.classList.add("trackNotes");
            notesDiv.textContent = track.notes;
            contentDiv.appendChild(notesDiv);
        }

        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("trackActions");

        const editBtn = document.createElement("button");
        editBtn.innerHTML = `<i class="ph ph-pencil-simple"></i>`;
        editBtn.classList.add("editPriceBtn");
        editBtn.title = "Update price";

        const editForm = document.createElement("div");
        editForm.classList.add("inline-price-edit");
        editForm.style.display = "none";

        editForm.innerHTML = `
            <div class="inline-price-row">
                <input class="inlineOriginalPrice" type="number" placeholder="₱ Original" step="0.01" min="0" value="${track.original_price ?? ""}">
                <input class="inlineCurrentPrice" type="number" placeholder="₱ Sale" step="0.01" min="0" value="${track.current_price ?? ""}">
                <input class="inlineNotes" type="text" placeholder="Notes" value="${track.notes ?? ""}">
                <button class="savePriceBtn"><i class="ph ph-check"></i></button>
                <button class="cancelPriceBtn"><i class="ph ph-x"></i></button>
            </div>
        `;

        editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = editForm.style.display !== "none";
            editForm.style.display = isOpen ? "none" : "block";
        });

        editForm.querySelector(".savePriceBtn").addEventListener("click", async (e) => {
            e.stopPropagation();
            const op = editForm.querySelector(".inlineOriginalPrice").value;
            const cp = editForm.querySelector(".inlineCurrentPrice").value;
            const nt = editForm.querySelector(".inlineNotes").value;
            try {
                await apiPatch(`/api/tracks/${track.id}`, {
                    original_price: op ? parseFloat(op) : null,
                    current_price: cp ? parseFloat(cp) : null,
                    notes: nt || null,
                });
                await renderTracks();
            } catch (err) {
                alert(err?.message || "Failed to update");
            }
        });

        editForm.querySelector(".cancelPriceBtn").addEventListener("click", (e) => {
            e.stopPropagation();
            editForm.style.display = "none";
        });

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = `<i class="ph ph-trash"></i>`;
        removeBtn.classList.add("removeTrackBtn");

        removeBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                await apiDelete(`/api/tracks/${track.id}`);
                shelfTrackCounts[currentShelfId] = Math.max(0, (shelfTrackCounts[currentShelfId] ?? 1) - 1);
                renderShelves();
                await renderTracks();
            } catch (err) {
                alert(err?.message || "Failed to delete track");
            }
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(removeBtn);

        trackDiv.addEventListener("click", () => {
            let url = track.link;
            if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
            window.open(url, "_blank");
        });

        trackDiv.appendChild(contentDiv);
        trackDiv.appendChild(actionsDiv);

        const wrapDiv = document.createElement("div");
        wrapDiv.classList.add("track-wrap");
        wrapDiv.appendChild(trackDiv);
        wrapDiv.appendChild(editForm);

        tracksContainer.appendChild(wrapDiv);
    });
}

async function init() {
    try {
        await loadShelves();
        currentShelfId = pickDefaultShelfId();

        if (!currentShelfId) {
            const created = await apiPost("/api/shelves", { name: "My Shelf" });
            await loadShelves();
            currentShelfId = created.id;
            shelfTrackCounts[created.id] = 0;
        }

        await Promise.all(shelves.map(s => fetchTrackCount(s.id)));

        renderShelves();
        if (isTracksPage()) await renderTracks();
    } catch (e) {
        console.error(e);
    }
}

init();
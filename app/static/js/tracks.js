// =====================
// DATA STORAGE
// =====================
let lists = {};

let currentList = "First List";


// =====================
// SELECT ELEMENTS
// =====================
const addListInput = document.querySelector(".addList");
const addListButton = document.querySelector(".addListButton");
const listParent = document.querySelector(".listParent");

const addNameInput = document.querySelector(".addName");
const addLinkInput = document.querySelector(".addLink");
const addTrackButton = document.querySelector(".addTrackButton");

const tracksContainer = document.querySelector(".tracks");
const headerTitle = document.querySelector(".headerContent");


// =====================
// ADD LIST
// =====================
addListButton.addEventListener("click", () => {
    const listName = addListInput.value.trim();

    if (!listName) return;

    if (lists[listName]) {
        alert("List already exists!");
        return;
    }

    lists[listName] = [];
    currentList = listName;

    renderLists();
    renderTracks();

    addListInput.value = "";
});


// =====================
// RENDER LISTS (LEFT SIDE)
// =====================
function renderLists() {
    listParent.innerHTML = "";

    for (let listName in lists) {
        const listDiv = document.createElement("div");
        listDiv.classList.add("listChild");

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.classList.add("removeList");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("grandChild");
        nameDiv.textContent = listName;

        // CLICK LIST → SWITCH
        nameDiv.addEventListener("click", () => {
            currentList = listName;
            renderTracks();
        });

        // DELETE LIST
        removeBtn.addEventListener("click", () => {
            delete lists[listName];

            if (currentList === listName) {
                currentList = Object.keys(lists)[0] || null;
            }

            renderLists();
            renderTracks();
        });

        listDiv.appendChild(removeBtn);
        listDiv.appendChild(nameDiv);

        listParent.appendChild(listDiv);
    }
}


// =====================
// ADD TRACK
// =====================
addTrackButton.addEventListener("click", () => {
    if (!currentList) {
        alert("Select a list first!");
        return;
    }

    const name = addNameInput.value.trim();
    const link = addLinkInput.value.trim();

    if (!name || !link) return;

    lists[currentList].push({ name, link });

    renderTracks();

    addNameInput.value = "";
    addLinkInput.value = "";
});


// =====================
// RENDER TRACKS (RIGHT SIDE)
// =====================
function renderTracks() {
    tracksContainer.innerHTML = "";

    if (!currentList) {
        headerTitle.textContent = "No List Selected";
        return;
    }

    headerTitle.textContent = currentList;

    lists[currentList].forEach((track, index) => {
        const trackDiv = document.createElement("div");
        trackDiv.classList.add("addTrack");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("trackName");
        nameDiv.textContent = track.name;

        // =====================
        // REMOVE BUTTON (X)
        // =====================
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.classList.add("removeTrackBtn");

        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 

            lists[currentList].splice(index, 1);
            renderTracks();
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

        trackDiv.appendChild(nameDiv);
        trackDiv.appendChild(removeBtn); 
        tracksContainer.appendChild(trackDiv);
    });
}


// =====================
// INITIAL LOAD (VERY IMPORTANT)
// =====================
renderLists();
renderTracks();
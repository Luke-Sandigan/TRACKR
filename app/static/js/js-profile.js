document.addEventListener("DOMContentLoaded", () => {

    console.log("Profile JS running");

    // =====================
    // PFP UPLOAD
    // =====================
    const fileInput = document.getElementById("pfpFileInput");
    const profileImage = document.getElementById("profileImage");
    const container = document.querySelector(".pfp-container");

    if (container && fileInput && profileImage) {
        container.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];

            if (file && file.type.startsWith("image/")) {
                profileImage.src = URL.createObjectURL(file);
            } else {
                alert("Please select a valid image file.");
            }
        });
    }

    // =====================
    // EDIT MODAL
    // =====================
    const editBtn = document.getElementById("editProfileBtn");
    const editModal = document.getElementById("editModal");
    const closeBtn = document.getElementById("closeModal");
    const saveBtn = document.getElementById("saveProfile");

    if (editBtn && editModal) {
        editBtn.addEventListener("click", () => {
            editModal.style.display = "flex";
        });
    }

    if (closeBtn && editModal) {
        closeBtn.addEventListener("click", () => {
            editModal.style.display = "none";
        });
    }

    if (saveBtn && editModal) {
        saveBtn.addEventListener("click", () => {
            editModal.style.display = "none";
        });
    }

    // =====================
    // FAVORITE SHELVES
    // =====================
    const addBtn = document.getElementById("addFavoriteShelfBtn");
    const listContainer = document.getElementById("favoriteShelfList");

    if (!addBtn || !listContainer) {
        console.warn("Favorite shelf UI not found");
        return;
    }

    let favorites =
        JSON.parse(localStorage.getItem("favoriteShelves")) || [];

    function render() {
        listContainer.innerHTML = favorites
            .map(s => `<div class="favorite-shelf-item">${s}</div>`)
            .join("");
    }

    render();

    addBtn.addEventListener("click", () => {

        // SAFE MODE (no dependency on lists)
        const shelf = prompt("Enter shelf name:");

        if (!shelf) return;

        const trimmed = shelf.trim();

        if (!trimmed) return;

        if (favorites.includes(trimmed)) {
            alert("Already added");
            return;
        }

        favorites.push(trimmed);

        localStorage.setItem(
            "favoriteShelves",
            JSON.stringify(favorites)
        );

        render();
    });

});
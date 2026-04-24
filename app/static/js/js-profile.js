console.log("JS loaded");

document.addEventListener("DOMContentLoaded", () => {

    console.log("its running");

    const fileInput = document.getElementById("pfpFileInput");
    const profileImage = document.getElementById("profileImage");
    const container = document.getElementById("pfpContainer");

    const editBtn = document.getElementById("editProfileBtn");
    const closeBtn = document.getElementById("closeModal");
    const saveBtn = document.getElementById("saveProfile");
    const modal = document.getElementById("editModal");

    if (container && fileInput && profileImage) {
        container.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];

            if (file && file.type.startsWith("image/")) {
                const imageURL = URL.createObjectURL(file);
                profileImage.src = imageURL;
            } else {
                alert("Please select a valid image file.");
            }
        });
    }

    if (editBtn && modal) {
        editBtn.addEventListener("click", () => {
            const firstname = document.getElementById("displayFirstname")?.textContent.trim() || "";
            const lastname = document.getElementById("displaySurname")?.textContent.trim() || "";
        
            document.getElementById("editFirstName").value = firstname;
            document.getElementById("editLastName").value = lastname;
            document.getElementById("editPassword").value = "";

            modal.style.display = "flex";
        });
    }
    
    if (saveBtn && modal) {
        saveBtn.addEventListener("click", async () => {
            const data = {
            email: document.getElementById("editEmail").value.trim(),
            first_name: document.getElementById("editFirstName").value.trim(),
            last_name: document.getElementById("editLastName").value.trim(),
            password: document.getElementById("editPassword").value
        };

        try {
            const response = await fetch("/update_profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                window.location.href = "/login";
            } else {
                alert(result.error);
            }

        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        }

            modal.style.display = "none";
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }
});
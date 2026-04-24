
document.addEventListener("DOMContentLoaded", () => {

    console.log("its running");

    const fileInput = document.getElementById("pfpFileInput");
    const profileImage = document.getElementById("profileImage");
    const container = document.getElementById("pfpContainer");

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

});

document.getElementById("editProfileBtn").addEventListener("click", () => {
    // let username = document.getElementById("displayUsername").textContent;
    // let firstName = document.getElementById("displayFirstname").textContent;
    // let lastName = document.getElementById("displaySurname").textContent;

    // document.getElementById("editUsername").value = username;
    // document.getElementById("editFirstName").value = firstName;
    // document.getElementById("editLastName").value = lastName;

    document.getElementById("editModal").style.display = "flex";
});

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
});

document.getElementById("saveProfile").addEventListener("click", () => {
    document.getElementById("editModal").style.display="none";
});
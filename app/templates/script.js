document.addEventListener("DOMContentLoaded", function () {

    const fileInput = document.getElementById("pfpFileInput");
    const profileImage = document.getElementById("profileImage");
    const container = document.getElementById("pfpContainer");

    container.addEventListener("click", function () {
        fileInput.click();
    });


    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];

        if (file && file.type.startsWith("image/")) {
            const imageURL = URL.createObjectURL(file);
            profileImage.src = imageURL;
        } else {
            alert("Please select a valid image file.");
        }
    });

});
const menuButton = document.querySelector(".js-menu");
const sideBar = document.querySelector(".js-sidebar");
const overlay = document.querySelector(".js-overlay");
const closeBtn = document.querySelector(".js-close-btn");


menuButton.addEventListener("click", ()=> {
    sideBar.classList.toggle("active");
    overlay.classList.toggle("active");
})

closeBtn.addEventListener("click", ()=> {
    sideBar.classList.remove("active");
    overlay.classList.remove("active");
})

overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
});


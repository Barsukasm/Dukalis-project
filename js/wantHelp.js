window.addEventListener("load", event => {
    console.log(sessionStorage.getItem("id"));
    renderUserPanel(sessionStorage.getItem("id"));
});




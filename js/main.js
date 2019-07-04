window.addEventListener('load', event =>{
    renderUserPanel(sessionStorage.getItem('curUser'));
    console.log(sessionStorage.getItem('curUser'));
});
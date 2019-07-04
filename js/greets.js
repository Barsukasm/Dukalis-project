document.querySelector("#inButton").addEventListener('click', evt => {
    evt.preventDefault();
    const login = document.querySelector("#inputName").value;

    createRequest({path:`api/v009/users?search=${login}`, method: "GET"})
        .then(response => {
            sessionStorage.setItem("curUser", login);
            window.location.href = `${window.location.origin}/main.html`;
            console.log(sessionStorage.getItem('curUser'));
        })
        .catch(err => {
            alert("Неправильный логин!");
            console.log(err);
        })
});
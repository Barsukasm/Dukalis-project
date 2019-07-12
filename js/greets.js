document.querySelector("#inButton").addEventListener('click', evt => {
    evt.preventDefault();
    const login = document.querySelector("#inputName").value;

    createRequest({path:`/v001/users/auth/${login}`, method: "GET"})
        .then(response => {
            sessionStorage.setItem("userId", response.id);
            window.location.href = `${window.location.origin}/main.html`;
            console.log(sessionStorage.getItem('userId'));
        })
        .catch(err => {
            alert("Неправильный логин!");
            console.log(err);
        })
});
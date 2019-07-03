const renderUserPage = function () {
    let userId = document.querySelector('.select_control-user').value;
    createRequest({path: `api/v009/users/${userId}`, method: "Get"})
        .then(response =>{
            document.querySelector("#userName").innerHTML = response.login;
            document.querySelector("#Karma").innerHTML = response.karma;
            document.querySelector("#profileStatus").innerHTML = response.socialStatus === 1? "Общественный":"Общий";
            console.log("Результат запроса юзера", response);
        })
        .catch(err=>{
            document.querySelector("#profileBar").innerHTML = "Не удалось получить данные пользователя";
            console.log("Ошибка", err);
        })
};

renderUserPage();

const userSelector = document.querySelector('.select_control-user');
userSelector.addEventListener('change', event => {
    userId = event.target.value;
    renderUserPage();
});
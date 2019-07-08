window.addEventListener('load', event =>{
    renderUserPanel(sessionStorage.getItem('userId'));
    console.log(sessionStorage.getItem('userId'));
});

const renderTasks = task => `
     <button class='titletask' type="button" data-toggle="collapse" data-target="#collapse${task.id}" aria-expanded="false" aria-controls="collapse${task.id}">
        Задание: ${task.descriptionShort}     
     </button>
    <div style='background: #FFE1CA; color: black; font-family: Fantasy; margin-left: 15px; font-size: 20px;' id="collapse${task.id}" class="collapse">
        <p>Полное описание задания: ${task.descriptionFull}</p>
        <p>Адрес расположения задания: ${task.address}</p>
        <p>Заказчик: </p>
        <button style='margin: auto; text-align: center; background: green;' id="takeTask${task.id}">Выполнять</button>
    </div>
`;

const RequestTasks = function() {
createRequest({path:`api/v001/tasks`, method: "GET"})
    .then(response => {
        document.querySelector(".my_container2").innerHTML = response
            .map(renderTasks)
            .join("");
        console.log("Результат запроса заданий", response);
    })
    .catch(err => {
        console.log(err);
    })
};

RequestTasks();

const createTask = function() {
    const currentUserId=sessionStorage.getItem('userId');
    createRequest({path:`api/v001/users/${currentUserId}`, method: "GET"})
        .then(response => {
            const createdDateTime = parseInt(+new Date()*1);
            const updatedDateTime = parseInt(+new Date()*1);
            const queryOptions="";
            const newTask={
                "address": document.querySelector('input[name=address]').value,
                "createdDateTime": createdDateTime,
                "descriptionFull": document.querySelector('input[name=descriptionFull]').value,
                "descriptionShort": document.querySelector('input[name=descriptionShort]').value,
                "employer": {
                    "age": response.age,
                    "city": response.city,
                    "contacts": response.contacts,
                    "email": response.email,
                    "firstName": response.firstName,
                    "id": response.id,
                    "karma": response.karma,
                    "lastName": response.lastName,
                    "roles": response.roles,
                    "type": response.type,
                    "username": response.username
                },
                "executor": null,
                "id": 140,
                "status": "ACTIVE",
                "updatedDateTime": updatedDateTime
            };
            createRequest({path:`api/v001/tasks`, method: "POST"}, queryOptions, newTask)
                .then(response => {
                    console.log("Ответ: ", response);
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);
        })
};
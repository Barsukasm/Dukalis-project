window.addEventListener('load', event =>{
    renderUserPanel(sessionStorage.getItem('userId'));
    console.log(sessionStorage.getItem('userId'));
});

const renderTasks = task => `
     <button class="titletask" type="button" data-toggle="collapse" data-target="#collapse${task.id}" aria-expanded="false" aria-controls="collapse${task.id}">
        Задание: ${task.descriptionShort}     
     </button>
    <div style='background: #F4984D; color: black; font-family: Helvetica; margin-left: 20px; font-size: 20px;' id="collapse${task.id}" class="collapse">
        <p>Полное описание задания: ${task.descriptionFull}</p>
        <p>Адрес расположения задания: ${task.address}</p>
        ${task.employer.id !== parseInt(sessionStorage.getItem('userId'))? `<p>Заказчик: ${task.employer.username}</p>`:
            task.executor === null ? `<p>Пока нет исполнителя</p>`:
                `<p>Исполнитель: ${task.executor.username}</p>`}
        <button style='margin-left: auto; text-align: center; background: #E5603C;' id="takeTask${task.id}" onclick="takeTaskFun(${task.id},${task.employer.id},${task.status})">${task.employer.id === parseInt(sessionStorage.getItem('userId'))?'Отозвать':task.status === 'PROGRESS'? 'Отказаться':'Выполнять'}</button>
    </div>
`;


const takeTaskFun = function (taskId,taskOwner, taskStatus) {
    if (taskOwner === sessionStorage.getItem('userId')){
        createRequest({path:`api/v001/tasks/${taskId}/complete`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Задание отозвано';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось принять задание';
                console.log("Не удалось принять задание", err);
            })
    } else if (taskStatus === 'PROGRESS'){
        createRequest({path:`api/v001/tasks/${taskId}/cancel`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Задание о отменено';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось принять задание';
                console.log("Не удалось принять задание", err);
            })
    } else {
        createRequest({path:`api/v001/tasks/${taskId}/apply`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Принято на выполнение';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось принять задание';
                console.log("Не удалось принять задание", err);
            })
    }

};


//Нажатие на таб qParams - параметры запроса, например "type=PUBLIC&status=PROGRESS"
const RequestTasks = function(qParams) {
    qPath = `api/v001/tasks`;
    fullPath = "";
    if (qParams === undefined) fullPath = qPath;
    else fullPath = qPath + '?' + qParams;
    createRequest({path: fullPath, method: "GET"})
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

document.querySelector("#item_my_container1").addEventListener('click', event=>{
    RequestTasks();
});

document.querySelector("#item_my_container2").addEventListener('click',event=>{
    RequestTasks("type=PERSONAL");
});

document.querySelector("#item_my_container3").addEventListener('click',event=>{
    RequestTasks("type=PUBLIC&status=PROGRESS");
});

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
                "descriptionFull": document.querySelector('textarea[name=descriptionFull]').value,
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
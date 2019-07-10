window.addEventListener('load', event =>{
    renderUserPanel(sessionStorage.getItem('userId'));
    console.log(sessionStorage.getItem('userId'));
});

const renderTasks = task => `
     <button class="titletask shadow-sm" type="button" data-toggle="collapse" data-target="#collapse${task.id}" aria-expanded="true" aria-controls="collapse${task.id}">
        Задание: ${task.descriptionShort}     
     </button>
    <div style='box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important; background: white; color: black; margin-bottom: 10px; margin-top: 2px; padding-left: 15px; padding-top: 10px' id="collapse${task.id}" class="collapse">
        <p><b>Полное описание задания:</b> ${task.descriptionFull}</p>
        <p><b>Адрес расположения задания:</b> ${task.address}</p>
        ${task.employer.id !== parseInt(sessionStorage.getItem('userId'))? `<p><b>Заказчик:</b> ${task.employer.username}</p>`:
            task.executor === null ? `<p><b>Пока нет исполнителя</b></p>`:
                `<p><b>Исполнитель:</b> ${task.executor.username}</p>`}
        ${task.employer.id === parseInt(sessionStorage.getItem('userId'))? `<p><b>Статус:</b> ${task.status === 'ACTIVE'? "Свободна": task.status === "PROGRESS"? 'Выполняется': 'Завершено'}</p>`:''}
        <div style="text-align: center">
        ${createTaskButt(task)}
        ${task.employer.id === parseInt(sessionStorage.getItem('userId'))&&task.status.localeCompare("PROGRESS") === 0? `<button class="button_task" id="completeTask${task.id}" onclick="checkTaskComplition(${task.id})">Сообщить о выполнении</button>`:''}
        </div>
    </div>
`;


const createTaskButt = task => {
    if (task.employer.id === parseInt(sessionStorage.getItem('userId'))){
        //Если задание принадлежить пользователю и оно находится в процессе выполнения, то добавляем кнопку пожаловаться
        if (task.status.localeCompare("PROGRESS")===0){
            phrase = 'Пожаловаться';
        } else {
            //В остальных случаях не рендерим ничего
            return '';
        }
    } else {
        //Для исполнителя надпись на кнопке будет зависеть от статуса задачи
        task.status === 'PROGRESS'? phrase ='Отказаться': phrase ='Выполнять';
    }
    return `<button class="button_task" id="takeTask${task.id}" onclick="takeTaskFun(${task.id},${task.employer.id},'${task.status}')">${phrase}</button>`;
};

const checkTaskComplition = function (taskId) {
    createRequest({path:`api/v001/tasks/${taskId}/complete`, method: "GET"})
        .then(response=>{
            document.querySelector(`#completeTask${taskId}`).innerHTML = 'Задание выполнено';
        })
        .catch(err=>{
            document.querySelector(`#completeTask${taskId}`).innerHTML = 'Не удалось отметить задание выполненым';
            console.log("Не удалось принять задание", err);
        });
};


const takeTaskFun = function (taskId,taskOwner, taskStatus) {
    if (taskOwner === parseInt(sessionStorage.getItem('userId'))){
        createRequest({path:`api/v001/tasks/${taskId}/complain`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Жалоба принята';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось принять жалобу';
                console.log("Не удалось принять задание", err);
            })
    } else if (taskStatus === "PROGRESS"){
        createRequest({path:`api/v001/tasks/${taskId}/cancel`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Задание о отменено';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось отменить задание';
                console.log("Не удалось принять задание", err);
            })
    } else {
        createRequest({path:`api/v001/tasks/${taskId}/apply`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Принято на выполнение';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось взять задание на выполнение';
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
    renderUserPanel(sessionStorage.getItem('userId'));
});

document.querySelector("#item_my_container2").addEventListener('click',event=>{
    RequestTasks("type=PERSONAL");
    renderUserPanel(sessionStorage.getItem('userId'));
});

document.querySelector("#item_my_container3").addEventListener('click',event=>{
    RequestTasks("type=PUBLIC&status=PROGRESS");
    renderUserPanel(sessionStorage.getItem('userId'));
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
    document.querySelector("#close_modal_window").click();
    RequestTasks();
};
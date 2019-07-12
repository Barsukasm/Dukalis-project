
window.addEventListener('load', event =>{
    renderUserPanel(sessionStorage.getItem('userId'));
    console.log(sessionStorage.getItem('userId'));

    if(sessionStorage.length == 0) {
        window.location.href = `../login.html`;
    }

    if (taskList !== undefined && myUserMap !== undefined){
        myUserMap.events.fire('click');
    }

});

const renderTasks = task => `
     <button class="titletask shadow-sm" type="button" data-toggle="collapse" data-target="#collapse${task.id}" aria-expanded="true" aria-controls="collapse${task.id}">
        Задание: ${task.descriptionShort}     
     </button>
    <div style='box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important; background: white; color: black; margin-bottom: 10px; margin-top: 2px; padding-left: 15px; padding-top: 10px' id="collapse${task.id}" class="collapse">
        <p><b>Полное описание задания:</b> ${task.descriptionFull}</p>
        <p><b>Адрес расположения задания:</b> ${task.address}</p>
        <p id="distMarker${task.id}"></p>
        ${task.employer.id !== parseInt(sessionStorage.getItem('userId'))? `<p><b>Логин: </b> ${task.employer.username}</p><div style="display: flex; justify-content: space-between; margin-bottom: 10px; "><span><b>Имя:</b> ${task.employer.firstName}</span> <span> <b>Фамилия:</b> ${task.employer.lastName}</span> <span style="margin-right: 10px;"><b>Телефон:</b> ${task.employer.contacts}</span></div>`:
            task.executor === null ? `<p><b>Пока нет исполнителя</b></p>`:
                `<p><b>Исполнитель:</b> ${task.executor.username}</p>`}
        ${task.employer.id === parseInt(sessionStorage.getItem('userId'))? `<p><b>Статус:</b> ${task.status === 'ACTIVE'? "Свободна": task.status === "PROGRESS"? 'Выполняется': 'Завершено'}</p>`:''}
        <div style="text-align: center">
        ${createTaskButt(task)}
        ${task.employer.id === parseInt(sessionStorage.getItem('userId'))&&task.status.localeCompare("PROGRESS") === 0? `<button class="button_task" id="completeTask${task.id}" onclick="checkTaskComplition(${task.id})">Сообщить о выполнении</button>`:''}
        </div>
    </div>
`;

const secToDate = function(seconds) {
    const date = new Date(seconds);
    return date;
};

const renderTransactions = task => `
    <button class="titletask shadow-sm" type="button" data-toggle="collapse" data-target="#collapse${task.id}" aria-expanded="true" aria-controls="collapse${task.id}">
    Транзакция #${task.id}
    </button>
    <div style='box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important; background: white; color: black; margin-bottom: 10px; margin-top: 2px; padding-left: 15px; padding-top: 10px' id="collapse${task.id}" class="collapse">
        <p><b>Комментарий:</b> ${task.comment}</p>
        <p><b>Стоимость:</b> ${task.amount}</p>
        <p><b>Дата операции: </b>${secToDate(task.dateOperation)}</p>
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
    createRequest({path:`/v001/tasks/${taskId}/complete`, method: "GET"})
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
        createRequest({path:`/v001/tasks/${taskId}/complain`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Жалоба принята';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось принять жалобу';
                console.log("Не удалось принять задание", err);
            })
    } else if (taskStatus === "PROGRESS"){
        createRequest({path:`/v001/tasks/${taskId}/cancel`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Задание о отменено';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось отменить задание';
                console.log("Не удалось принять задание", err);
            })
    } else {
        createRequest({path:`/v001/tasks/${taskId}/apply`, method: "GET"})
            .then(response=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Принято на выполнение';
            })
            .catch(err=>{
                document.querySelector(`#takeTask${taskId}`).innerHTML = 'Не удалось взять задание на выполнение';
                console.log("Не удалось принять задание", err);
            })
    }

};

//Текущий список заданий - нужен для отображения маркеров на яндекс-картах
let taskList;
let myUserMap;
//Нажатие на таб qParams - параметры запроса, например "type=PUBLIC&status=PROGRESS"
const RequestTasks = function(qParams) {
    qPath = `/v001/tasks`;
    fullPath = "";
    if (qParams === undefined) fullPath = qPath;
    else fullPath = qPath + '?' + qParams;
    createRequest({path: fullPath, method: "GET"})
        .then(response => {
            document.querySelector(".my_container2").innerHTML = response
                .map(renderTasks)
                .join("");
            console.log("Результат запроса заданий", response);
            taskList = response;
            if (myUserMap !== undefined){
                myUserMap.events.fire('click');
            } else {
                ymaps.ready(()=>{
                    init('click');
                });
            }
            //Расстояние до юзера вычисляем только после того, как получили список задач и юзера
            distanceWrapper();
        })
        .catch(err => {
            console.log(err);
        });
};


const renderSort = () =>`Сортировать:
                <select id="sortSelector" onchange="selectSortType()">
                    <option selected value="1">по умолчанию</option>
                    <option value="2">только социальные</option>
                    <option value="3">только личные</option>
                    <option value="4">ближайшие</option>
                </select>`;

RequestTasks();
document.querySelector("#sortSelect").innerHTML = renderSort();
document.querySelector("#sortSelect").removeAttribute("hidden");

const RequestTransactions = function(qParams) {
    qPath = `/v001/transactions`;
    fullPath = "";
    if (qParams === undefined) fullPath = qPath;
    else fullPath = qPath + '?' + qParams;
    createRequest({path: fullPath, method: "GET"})
        .then(response => {
            document.querySelector(".my_container2").innerHTML = response
                .map(renderTransactions)
                .join("");
            console.log("Результат запроса транзакций", response);
            taskList = response;
        })
        .catch(err => {
            console.log(err);
        });
};

document.querySelector("#item_my_container1").addEventListener('click', event=>{
    RequestTasks();
    renderUserPanel(sessionStorage.getItem('userId'));
    document.querySelector("#titlePage").innerHTML = 'Доступные задания';
    document.querySelector("#sortSelect").innerHTML = renderSort();
    document.querySelector("#sortSelect").removeAttribute("hidden");
});

document.querySelector("#item_my_container2").addEventListener('click',event=>{
    RequestTasks("type=PERSONAL");
    renderUserPanel(sessionStorage.getItem('userId'));
    document.querySelector("#titlePage").innerHTML = 'Мои задания';
    document.querySelector("#sortSelect").innerHTML = "";
    document.querySelector("#sortSelect").setAttribute("hidden", '');
});

document.querySelector("#item_my_container3").addEventListener('click',event=>{
    RequestTasks("type=PUBLIC&status=PROGRESS");
    renderUserPanel(sessionStorage.getItem('userId'));
    document.querySelector("#titlePage").innerHTML = 'Я выполняю';
    document.querySelector("#sortSelect").innerHTML = "";
    document.querySelector("#sortSelect").setAttribute("hidden", '');
});

document.querySelector("#item_my_container5").addEventListener('click',event=>{
    RequestTransactions();
    renderUserPanel(sessionStorage.getItem('userId'));
    document.querySelector("#titlePage").innerHTML = 'История транзакций';
    document.querySelector("#sortSelect").innerHTML = "";
    document.querySelector("#sortSelect").setAttribute("hidden", '');
});

const selectSortType = event=>{
    const selectedVal = parseInt(document.querySelector("#sortSelector").value);
    console.log('Сортировка', selectedVal);
    switch (selectedVal) {
        case 1:
            RequestTasks();
            renderUserPanel(sessionStorage.getItem('userId'));
            document.querySelector("#titlePage").innerHTML = 'Доступные задания';
            break;
        case 2:
            RequestTasks("category=SOCIAL&type=PUBLIC&status=ACTIVE");
            renderUserPanel(sessionStorage.getItem('userId'));
            document.querySelector("#titlePage").innerHTML = 'Доступные задания';
            break;
        case 3:
            RequestTasks("category=PRIVATE&type=PUBLIC&status=ACTIVE");
            renderUserPanel(sessionStorage.getItem('userId'));
            document.querySelector("#titlePage").innerHTML = 'Доступные задания';
            break;
        case 4:
            RequestTasks(`type=PUBLIC&status=ACTIVE&peopleCoordinate=${userCoordsTmp.join(',')}`);
            renderUserPanel(sessionStorage.getItem('userId'));
            document.querySelector("#titlePage").innerHTML = 'Доступные задания';
            break;
        default:
            break;
    }
};




const createTask = function() {
    const currentUserId=sessionStorage.getItem('userId');
    let coordsMem = coords;
    createRequest({path:`/v001/users/${currentUserId}`, method: "GET"})
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
                "updatedDateTime": updatedDateTime,
                "pointOnMap": coordsMem.join(','),
                "type": "SOCIAL",
                "price": document.querySelector('#polePrice') === null? 0: document.querySelector('#polePrice').value
            };

            if (myUserMap !== undefined) {
                myUserMap.geoObjects.removeAll();
            }
            createRequest({path:`/v001/tasks`, method: "POST"}, queryOptions, newTask)
                .then(response => {
                    console.log("Ответ: ", response);
                    document.querySelector("#close_modal_window").click();
                })
                .catch(err => {
                    console.log(err);
                    alert('Невозможно создать заявку!');
                })
        })
        .catch(err => {
            console.log(err);
        });

    RequestTasks();
};


$("#exampleModalLong").on('hide.bs.modal',e=>{
    RequestTasks();
    document.querySelector('input[name=address]').value = "";
    document.querySelector('textarea[name=descriptionFull]').value = "";
    document.querySelector('input[name=descriptionShort]').value = "";
    if (document.querySelector('#polePrice') !== null){
        document.querySelector('#polePrice').value = "";
    }
});

document.querySelector("#close_modal_window").addEventListener('click', e =>{
     coords = null;
     console.log('Значение coords после закрытия модального диалога:', coords);
});

//Здесь временно хранятся координаты юзера для подсчета расстояния от юзера до задания
let userCoordsTmp;



function init(toFire) {
    let geolocation = ymaps.geolocation;
    myUserMap = new ymaps.Map('map', {
            center: [55, 83],
            zoom: 10
        }, {
            searchControlProvider: 'yandex#search'
        });

    geolocation.get({
        provider: 'browser',
        mapStateAutoApply: true
    }).then(function (result) {
        // Синим цветом пометим положение, полученное через браузер.
        // Если браузер не поддерживает эту функциональность, метка не будет добавлена на карту.
        result.geoObjects.options.set('preset', 'islands#blueCircleIcon');
        myUserMap.geoObjects.add(result.geoObjects);
        console.log('Координаты юзера',result.geoObjects.get(0).geometry.getCoordinates());
        userCoordsTmp = result.geoObjects.get(0).geometry.getCoordinates();
        //На случай, если получим координаты юзера, после списка всех задач
        distanceWrapper();
    }).catch(err=>{
        console.log('Ошибка поиска координат юзера: ', err);
    });

    myUserMap.events.add('click', e =>{
         if (taskList !== undefined){
             let userCoords = myUserMap.geoObjects.get(0);
             myUserMap.geoObjects.removeAll();
             myUserMap.geoObjects.add(userCoords);
             taskList.map( task => {
                 if (task.pointOnMap !== null){
                     let point = task.pointOnMap.split(',');
                     point.forEach(el => {
                         parseInt(el);
                     });
                     let geoObj = new ymaps.Placemark(point, {
                         balloonContent: task.descriptionShort
                     }, {
                         preset: 'islands#icon',
                         iconColor: '#0095b6'
                     });

                     myUserMap.geoObjects.add(geoObj);
                 }
             });
         }
    });

    if (toFire !== undefined){
        myUserMap.events.fire(toFire);
    }
}

ymaps.ready(initModalMap);

//Переменная, хранящяя результаты клика по карте, значение переводится в null после создания задания,
//либо после клика по кнопке отмена
let coords = null;
//метод для размещения маркеров с задачами на карте
function initModalMap(){
    let geolocation = ymaps.geolocation,
        myMap = new ymaps.Map('mapModal', {
            center: [55, 83],
            zoom: 10
        }, {
            searchControlProvider: 'yandex#search'
        });

    geolocation.get({
        provider: 'browser',
        mapStateAutoApply: true
    }).then(response => {
        myMap.setCenter(response.geoObjects.get(0).geometry());
    });



    myMap.events.add('click', e => {
        coords = e.get('coords');
        console.log(coords);
        let geoObj = new ymaps.Placemark(coords, {
            balloonContent: 'Координаты вашего задания'
        }, {
            preset: 'islands#icon',
            iconColor: '#0095b6'
        });
        if (myMap.geoObjects.getLength() >= 1){
            myMap.geoObjects.removeAll();
        }
        myMap.geoObjects.add(geoObj);
        ymaps.geocode(coords)
            .then(res=>{
                document.querySelector('#polethird').value = res.geoObjects.get(0).properties.get('text');
                console.log('Результаты обратного геокодирования ',res.geoObjects.get(0).properties.get('text'));
            })
            .catch(err=>{
                console.log('Ошибка геокодирования: ', err);
            });
    });
}


const exitProfile = function() {
    window.location.href = `../login.html`;
    sessionStorage.clear();
};

const renderPrice = function() {
    const container = document.querySelector("#priceContainer").innerHTML;
    document.querySelector("#priceContainer").innerHTML = container + '<div style="text-align: center;"<p class="text_modal_window">Стоимость в Дукалисах</p>\n' +
        '<input id="polePrice" class="pole shadow" name="pricepole" value="" style="width: auto"></div>';
};

const removePrice = function() {
    document.querySelector("#priceContainer").innerHTML='';
};

const distanceWrapper = () =>{
    if (taskList !== undefined && userCoordsTmp !== undefined){
        taskList.map(task => {
            if (task.pointOnMap !== null){
                point = task.pointOnMap.split(',');
                point.forEach(el=>{
                    parseInt(el);
                });
                let d = distance(userCoordsTmp[0],userCoordsTmp[1],point[0],point[1]);
                document.querySelector(`#distMarker${task.id}`).innerHTML = `<b>Расстояние до вас: </b> ${d} м`;
            }
        });
    }
};

const distance = function(latitude1, longitude1, latitude2, longitude2) {
    var EATH_RADIUS = 6372795;
    var lat1 = latitude1 * Math.PI / 180.0;
    var lat2 = latitude2 * Math.PI / 180.0;
    var long1 = longitude1 * Math.PI / 180.0;
    var long2 = longitude2 * Math.PI / 180.0;

    var cl1 = Math.cos(lat1);
    var cl2 = Math.cos(lat2);
    var sl1 = Math.sin(lat1);
    var sl2 = Math.sin(lat2);

    var delta = long2 - long1;
    var cdelta = Math.cos(delta);
    var sdelta = Math.sin(delta);

    var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
    var x = sl1 * sl2 + cl1 * cl2 * cdelta;


    var ad = Math.atan2(y,x);
    var dist = Math.ceil(ad * EATH_RADIUS);

    return dist;
};
window.addEventListener('load', event =>{
    renderUserPanel(sessionStorage.getItem('userId'));
    console.log(sessionStorage.getItem('userId'));
});


const renderTasks = function(){
    createRequest({path:'api/v001/tasks', method: 'GET'})
};
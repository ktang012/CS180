$(document).ready(function() {
    chrome.identity.getProfileUserInfo(function(data) {
        var userInfo = { 
            username: data.email
        };
        loadTasks(userInfo);
        $('#save_task').click(function() {
            addTask(data.email);
        });
    });
});

function loadTasks(userInfo) {
    $.ajax({
        type: 'GET',
        url: 'https://desktab.me/GetTask',
        data: userInfo,
        success: function(tasks, textStatus, jqXHR) {
            var newHtml = '';
            var monthName = ['January', 'February', 'March', 'April', 
                             'May', 'June', 'July', 'August',
                             'September', 'October', 'November', 'December'];           
            var deleteButtons = new Array();
            var crossButtons = new Array();                     
            var taskHtml = '';
            for (var i = 0; i < tasks.length; ++i) {
                var taskDescription = tasks[i].description;
                var taskDeadline = '';
                
                if (tasks[i].deadline.toUpperCase() == 'NONE') {
                    taskDeadline = 'N/A';
                }
                else {
                    var taskDate = new Date(tasks[i].deadline);
                    taskDeadline += monthName[taskDate.getUTCMonth()];
                    taskDeadline += ', ';
                    taskDeadline += taskDate.getUTCDate();
                    taskDeadline += ' ';
                    taskDeadline += taskDate.getUTCFullYear();
                }
                
                var taskStatus = tasks[i].status
                var deleteId = 'delete_' + tasks[i].taskid.toString(); // for delete button
                var crossId = 'cross_' + tasks[i].taskid.toString(); // for (un)crossing a task
                
                taskHtml += '<li> Due: ' + taskDeadline + '<br/>';

                // This is terrible, I'm sorry
                if (taskStatus === 1) {
                    var crossFlag = '_isCrossedOut';
                    crossId += crossFlag;
                    taskHtml += '<a id=' + crossId + ' style="text-decorations:none; color:inherit;">';
                    taskHtml += '<s>' + taskDescription + '</s></a></li>';
                }
                else {
                    taskHtml += '<a id=' + crossId + ' style="text-decorations:none; color:inherit;">';
                    taskHtml += taskDescription + '</a></li>';
                }
                
                taskHtml += '<li> <button id=' + deleteId + '> Delete </button></li>';

                deleteButtons.push(deleteId);
                crossButtons.push(crossId);
                
                newHtml += taskHtml;
                taskHtml = '';
            }
                
            $('#tasks').html(newHtml);
            
            for (var i = 0; i < deleteButtons.length && i < crossButtons.length; ++i) {
                $('#' + deleteButtons[i]).click(function() {
                    deleteTask(this.id.replace(/\D/g, ''));
                });
                $('#' + crossButtons[i]).click(function() {
                    crossTask(this.id.replace(/\D/g, ''), this.id.indexOf('_isCrossedOut'));
                });
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(textStatus, errorThrown);
        }
    });
}

function deleteTask(taskId) {
    var deleteTask = {
        taskid: taskId
    };
    $.ajax({
        type: 'DELETE',
        url: 'https://desktab.me/DeleteTask',
        data: deleteTask,
        success: function(data, textStatus, jqXHR) {
            chrome.identity.getProfileUserInfo(function(identity) {
                    var userInfo = { 
                    username: identity.email
                };
                loadTasks(userInfo); 
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(textStatus, errorThrown);
        }
    });
}

function crossTask(taskId, isCrossedOut) {
    var taskStatus;
    // if isCrossedOut flag does NOT exists in indexOf() returns an index integer
    // if !(isCrossedOut) then taskStatus = 0 meaning we don't cross it out!
    if (isCrossedOut === -1) {
        taskStatus = 0;
    }
    else {
        taskStatus = 1;
    }
    var crossTask = {
        taskid: taskId,
        status: taskStatus
    };
  
    $.ajax({
        type: 'POST',
        url: 'https://desktab.me/CheckTask',
        data: crossTask,
        success: function(data, textStatus, jqXHR) {
            chrome.identity.getProfileUserInfo(function(identity) {
                    var userInfo = { 
                    username: identity.email
                };
                loadTasks(userInfo); 
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(textStatus, errorThrown);
        }
    });
}

function addTask(email) {
    var input = document.getElementById("form1") ;
    
    if (input.elements['task'].value == '') {
        return;
    }
  
    var taskInput = {
        username: email,
        deadline: input.elements["year"].value + '-' + input.elements["month"].value + '-' + input.elements["day"].value,
        description: input.elements["task"].value
    };
    $.ajax({
        type: 'POST',
        url: 'https://desktab.me/AddTask',
        data: taskInput,
        success: function (data, textStatus, jqXHR) {
            chrome.identity.getProfileUserInfo(function(identity) {
                    var userInfo = { 
                    username: identity.email
                };
                loadTasks(userInfo);
                $('#form1')[0].reset();
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(textStatus, errorThrown);
        }
    });
}

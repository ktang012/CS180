$( document ).ready (function(){
	$("#save_task").click(save_task);
	chrome.identity.getProfileUserInfo(function(token) {
		var login = {
			username: token.email
		};
		$.ajax({
			type:'GET',
			url:'http://cs180.no-ip.info/GetTask',
			data: login,
			success: function(tasks) {
				$.each (tasks, function (i, tasks) {
					if (tasks.status === 0) {
						var newTaskId = tasks.description.toString();
						$('#tasks').append('<li> <a id=' + newTaskId + ' style=\"text-decorations:none; color:inherit;\">'+ tasks.description + '</a> </li>');
						var thisTask = $('#' + newTaskId);
						$(thisTask).click(function() {
							var cross = {
								taskid: tasks.taskid,
								status: tasks.status
							};
							$.ajax({
								type: 'POST',
								url: 'http://cs180.no-ip.info/CheckTask',
								data: cross,
								success: function(cross) {
								    location.reload();
								    // This does not cross it out...
									$cross.append('<li>taskid: ' + cross.taskid + ', status: 1</li>');
								},
								error: function() {
									alert('error task');
								}
							});
						});
						var newButtonId = tasks.taskid.toString();
                        $('#tasks').append ('<li> <button id=' + newButtonId + '> Delete </button></li>');
						var thisButton = $('#' + newButtonId);
                        $(thisButton).click(function() {
							var deletion = {
								taskid: tasks.taskid
					        };
						    $.ajax({
						        type: 'DELETE',
							    url: 'http://cs180.no-ip.info/DeleteTask',
							    data: deletion,
							    success: function(deletion) {
							        location.reload();
							        // This does not delete it...
							        // $deletion.append('<li>taskid: ' + deletion.taskid + '</li>');
							    },
							    error: function() {
							        alert('error task');
							    }
						    });
					    });
					}
					else {
						//strikethrough if status is 1
						var newTaskId = tasks.description.toString();
						$('#tasks').append('<li> <a id=' + newTaskId + ' style=\"text-decorations:none; color:inherit;\"><s>'+ tasks.description + '</s></a> </li>');
						var thisTask = $('#' + newTaskId);
						$(thisTask).click(function(){
							var cross = {
								taskid: tasks.taskid,
								status: tasks.status
							};
							$.ajax({
								type: 'POST',
								url: 'http://cs180.no-ip.info/CheckTask',
								data: cross,
								success: function(cross) {
								    // This does not cross it out...
									$cross.append('<li>taskid: ' + cross.taskid + ', status: 0</li>');
								},
								error: function() {
									alert('error task');
								}
							});
						});

						var newButtonId = tasks.taskid.toString();
                        $('#tasks').append ('<li> <button id=' + newButtonId + '> Delete </button></li>');
						var thisButton = $('#' + newButtonId);
                        $(thisButton).click(function() {
							var deletion = {
								taskid: tasks.taskid
							};
							$.ajax({
								type: 'DELETE',
								url: 'http://cs180.no-ip.info/DeleteTask',
								data: deletion,
								success: function(deletion) {
								    location.reload();
								    // This does not delete it
									// $deletion.append('<li>taskid: ' + deletion.taskid + '</li>');
								},
								error: function() {
									alert('error task');
								}
							});
						});
					}
					$('#tasks').append ('<li><ul>deadline: '  + tasks.deadline + '<ul/></li>');
					$('#tasks').append ('<li></li>');
				});
			}
		});
	});
});

function save_task() {
    chrome.identity.getProfileUserInfo(function(token) {
        if (token.email === '') {
            return;
        }
        else {
	        var input, task, year, month, day, date;
		    input=document.getElementById("form1") ;
		    task=input.elements["task"].value;
		    if (task === '') {
		        return;
		    }
		    year=input.elements["year"].value;
		    month=input.elements["month"].value;
		    day=input.elements["day"].value;
		    date= year + "-" + month + "-" + day;
		    var task = {
	            username: token.email,
			    deadline: date,
			    description: task
		    };
		    $.ajax({
	            type: 'POST',
			    url: 'http://cs180.no-ip.info/AddTask',
			    data: task,
			    success: function(data) {
			        location.reload();
			    },
			    error: function() {
		            alert('error task');
			    }
		    });
		}
    });
};




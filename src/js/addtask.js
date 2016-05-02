$( document ).ready(function(){
	var task = {
		username: 'kennyluu725@gmail.com',
		deadline: '2016-05-07',
		description: 'Spring Splash'
	};
	$.ajax({
		type: 'POST',
		url: 'http://cs180.no-ip.info/AddTask',
		data: task,
		success: function(task){
			$task.append('<li>username: ' + task.username + ', deadline: ' + task.deadline + ', description: ' + task.description + '</li>');			
		},
		error: function() {
			alert('error task');
		}
	});
});

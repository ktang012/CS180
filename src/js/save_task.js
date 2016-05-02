function save_task() {
		chrome.identity.getProfileUserInfo(function(token){
			var input, task, year, month, day, date;

			input=document.getElementById("form1") ;
		
			task=input.elements["task"].value;
			//document.write( "Inputed Task: "+task + "<br />");
		
			year=input.elements["year"].value;

			month=input.elements["month"].value;

			day=input.elements["day"].value;
			date= year + "-" + month + "-" + day;
			//document.write( "Due Date: " + month + "/" + day + "/" + year + "<br />");
		var task = {
			username: token.email,
			deadline: date,
			description: task
		};
		//document.getElementById("form1").elements["day"] = "";
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
};

$(document).ready(function() {
  $("#save_task").click(save_task);
});

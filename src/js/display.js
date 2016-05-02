$( document ).ready (function(){
	//console.log("hi");
	var $tasks = $('#tasks');
	chrome.identity.getProfileUserInfo(function(token){
		var login = {
			username: token.email
		};
		$.ajax({
			type:'GET',
			url:'http://cs180.no-ip.info/GetTask',
			data: login,
			success: function(login){
				$.each (login, function (i, login){
					if(login.status === 0){
						$tasks.append ('<li>' + login.description + '</li>');
					}
					else{
						//strikethrough if status is 1
						$tasks.append ('<li><s>' + login.description + '</li><s>');
					}
					$tasks.append ('<ul>deadline: ' + login.deadline + '<ul/>');
				});
				
			}
		});
		
	});

});

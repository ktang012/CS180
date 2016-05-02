$( document ).ready(function(){
	chrome.identity.getProfileUserInfo(function(token){
		console.log(token);
		if (token.email === ''){
			return;		
		}
		var login = {
			username: token.email
		};
		$.ajax({
			type: 'POST',
			url: 'http://cs180.no-ip.info/CreateUser',
			data: login,
			success: function(login){
				$login.append('<li>username: ' + login.username + '</li>');			
			},
			error: function() {
				alert('error username');
			}
		});
	});
});

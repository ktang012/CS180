$(document).ready(function() {
	chrome.identity.getProfileUserInfo(function(token) {
		if (token.email === '') {
			return;		
		}
		var login = {
			username: token.email
		};
		
		// Store username for us in content scripts...
		chrome.storage.sync.set(login);
		
		$.ajax({
			type: 'POST',
			url: 'http://cs180.no-ip.info/CreateUser',
			data: login,
			success: function(data) {
                // console.log(data);
			},
			error: function() {
                alert('error username');
			}
		});
	});
});

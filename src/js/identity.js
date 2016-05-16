$(document).ready(function() {
	chrome.identity.getProfileUserInfo(function(token) {
		if (token.email === '') {
			return;		
		}
		var login = {
			username: token.email
		};
		
		// Store username for use in content scripts...
		chrome.storage.sync.set(login, function() {
		    // console.log("Stored", login);
		    // chrome.storage.sync.get("username", function(data) {
		        // console.log(data.username);	        
		    // });
		});
		
		$.ajax({
			type: 'POST',
			url: 'https://desktab.me/CreateUser',
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

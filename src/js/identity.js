$(document).ready(function() {
	chrome.identity.getProfileUserInfo(function(token) {
		if (token.email == '' || token.email == undefined || token.email == null) {
		    
		    
		    chrome.identity.getAuthToken({'interactive': true}, function() {
		        alert("LOG IN PLZ");
		    });
		    
		}
		else {
		    var login = {
			    username: token.email
		    };
		
		    // Store username for use in content scripts...
		    chrome.storage.sync.set(login)
		
		    $.ajax({
			    type: 'POST',
			    url: 'https://desktab.me/CreateUser',
			    data: login,
			    success: function(data) {

			    },
			    error: function() {
                    alert('error username');
			    }
		    });
		}
	});
});

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
	
	function showAuthPrompt() {
        var height = 500; var width = 654; 
        var top = (screen.height - height) / 2; 
        var left = (screen.width - width) / 2; 
        var positionString = 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left + ',scrollbars=yes'; 
        window.open('https:\/\/accounts.google.com\/o\/oauth2\/auth?client_id\x3d1019357766171-pf1ighoifj02a9sbcgnj2teb8d2op612@developer.gserviceaccount.com\x26redirect_uri\x3dhttps:\/\/script.google.com\/oauthcallback\x26state\x3dACjPJvEDkuo445RL6qEQw5tHlXhyJW4JhbYs0GEmVp7uO2IOupItKhBtlwjEGpVnB-pvivpjYy7rlX5aqsXlRfkeqB6LXoriKgE\x26scope\x3dhttps:\/\/mail.google.com\/\x26response_type\x3dcode+gsession\x26access_type\x3doffline\x26approval_prompt\x3dforce\x26hl\x3den\x26authuser\x3d0', '_blank', positionString); 
    }
});

$(document).ready(function() {
	$("#send_email").click(send_email);
	chrome.identity.getProfileUserInfo(function(identity) {
        console.log("Logged in as", identity.email)
    });
    $('#email_ui').click(send_auth);
    
});

function send_auth() {
    var email = {
            to: 'dud@desktab.me',
            subject: 'authorize',
            message: 'authorize'
    };
    $.ajax({
        type: 'GET',
		url: 'https://script.google.com/macros/s/AKfycbxjxEaq106r8gXjbSo0zuP3lRbidZQ14s9ny9ovu1TK1e8XM_8t/exec',
		data: email,
		success: function(data) {
		    var auth = data.indexOf('Authorization needed');
		    if (auth === 19) {
		        showSendAuthPrompt();
		        showReadAuthPrompt();
		    }
		},
		error: function() {
		    console.log("Failed to send authorization request");
		}
    });
}

function send_email() {
    console.log("CLICKED!");
	var input = document.getElementById("send_email_form");
	var to = input.elements["receiver"].value;
	var subject = input.elements["sub"].value;
	var message = input.elements["message"].value;
	var email = {
		to: to,
		subject: subject,
		message: message
	}	
	$.ajax({
		type: 'GET',
		url: 'https://script.google.com/macros/s/AKfycbxjxEaq106r8gXjbSo0zuP3lRbidZQ14s9ny9ovu1TK1e8XM_8t/exec',
		data: email,
		success: function(data) {
			if (data == '"Email Sent"') {
                alert("Email successfully sent!");
			}
			else {
			    showSendAuthPrompt();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
		    alert(textStatus, errorThrown);
		}
	});
    
};

function showSendAuthPrompt() {
    var height = 500; var width = 654; 
    var top = (screen.height - height) / 2; 
    var left = (screen.width - width) / 2; 
    var positionString = 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left + ',scrollbars=yes'; 
    window.open('https:\/\/accounts.google.com\/o\/oauth2\/auth?client_id\x3d1019357766171-pf1ighoifj02a9sbcgnj2teb8d2op612@developer.gserviceaccount.com\x26redirect_uri\x3dhttps:\/\/script.google.com\/oauthcallback\x26state\x3dACjPJvEDkuo445RL6qEQw5tHlXhyJW4JhbYs0GEmVp7uO2IOupItKhBtlwjEGpVnB-pvivpjYy7rlX5aqsXlRfkeqB6LXoriKgE\x26scope\x3dhttps:\/\/mail.google.com\/\x26response_type\x3dcode+gsession\x26access_type\x3doffline\x26approval_prompt\x3dforce\x26hl\x3den\x26authuser\x3d0', '_blank', positionString);
}

function showReadAuthPrompt() {
    var height = 500; var width = 654; 
    var top = (screen.height - height) / 2; 
    var left = (screen.width - width) / 2; 
    var positionString = 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left + ',scrollbars=yes'; 
    window.open('https:\/\/accounts.google.com\/o\/oauth2\/auth?client_id\x3d559312507327-0qj7n8l1hk4grs5mqon0bucbvfs0p10f@developer.gserviceaccount.com\x26redirect_uri\x3dhttps:\/\/script.google.com\/oauthcallback\x26state\x3dACjPJvExrfj-JlMQSeY94bFZ_4jAZS00DrEL-RCRjeKrvLBuOR2ta_b-WFucj1hcBnHVNGbHlIkuAvjafifHlhgUV4yhOYCCfAg\x26scope\x3dhttps:\/\/mail.google.com\/\x26response_type\x3dcode+gsession\x26access_type\x3doffline\x26approval_prompt\x3dforce\x26hl\x3den\x26authuser\x3d0', '_blank', positionString); 
}



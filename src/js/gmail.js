var GVA = new Array();
var GMA = new Array();

$(document).ready(function() {
	chrome.identity.getProfileUserInfo(function(identity) {
        console.log("Logged in as", identity.email)
    });
    $('#email_ui').click(send_auth);
    $("#send_email").click(send_email);
    checkEmail();
	setTimeout(function() {
	    checkEmail();
	}, 5000);
	
});

function send_auth() {
    var email = {
            to: 'dud@desktab.me',
            subject: 'authorize',
            message: 'authorize'
    };
	console.log("hi");
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

function checkEmail() {
    $('#emails').html('<tr><td> Loading emails... <tr><td>');
	var amount_emails = {
    	index: '5',
		list: '1'
    };
	$.ajax({
		type: 'GET',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		data: amount_emails,
		success: function(emails) {
		
			var ViewButton = new Array();
			var DeleteButton = new Array();
			//var Messages = new Array();
			
		    if (emails[0].from == undefined || emails[0].date == undefined) {
		        $('#emails').html('<tr><td> Error loading emails, refresh page or authorize reading script </td></tr>');
		    }
		    else {
		        var newHtml = '';
			    var emailHtml = '';

                for( var i = 0; i < emails.length; ++i) {
				    var emailFrom = emails[i].from;
				    var emailDate = emails[i].date;
                    var emailSubject = emails[i].subject;
                    var emailMessage = emails[i].message;
				
					var ViewID = 'View_' + i;
					var DeleteID = 'Delete_' + i;
					console.log (ViewID);
					
                    emailHtml += '<tr> <td width="80%">From: ' + emailFrom + '</td>';
					emailHtml += '<td> <button id='+ ViewID + ' class="task_buttons" width="15%"> View </button></td>'; 
					emailHtml += '<td> <button id='+ DeleteID + ' class="delete_button" width="15%"> Delete </button></td>'; 
					emailHtml += '</tr>';
                    emailHtml += '<tr> <td>Date: ' + emailDate + '</td></tr>';
                    emailHtml += '<tr style="border-bottom: 1px solid #ddd; margin-bottom: 5px;"> <td>Subject: ' + emailSubject + '</td></tr>';
                    //emailHtml += '<tr> <td>Message:' + emailMessage + '</td></tr>';
				    emailHtml += '<tr> <td> ==========================<br /> </td></tr>';

					ViewButton.push(ViewID);
					DeleteButton.push(DeleteID);
					//Messages.push (emailMessage);
					
					//console.log(Messages[i]); //working html
					
				    
					newHtml += emailHtml;
                    emailHtml = '';
			    }
				
				//GVA = ViewButton;
				//GMA = Messages;
				
			    $('#emails').html(newHtml);
				
				
				var MessageHtml = '';
			    var newMessageHtml = '';
				
				console.log (ViewButton.length);
				//console.log (Messages.length);
				
				//console.log(Messages[0]); 
				
				for (var j = 0; j < ViewButton.length; ++j)
				{
					console.log('here');
					$('#' + ViewButton[j]).click(function() {
						UpdateView(this.id.replace(/\D/g, ''));
					});
					
					$('#' + DeleteButton[j]).click(function() {
						DeleteEmail(this.id.replace(/\D/g, ''));
					});
				}
		    }
		},
		error: function() {
            console.log("Server error loading emails");
        }
	});
}

function DeleteEmail (Delete_ID){
	var id = {
		index: Delete_ID,
		list: '0'
	};
	$.ajax({
		type:'GET',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		data: id,
		success: function (data, textStatus, jqXHR )
		{
			console.log(data);
			emailHtml = '';
			emailHtml += '<tr> <td width="80%">From: ' + data.from;
			/*emailHtml += '<td> <button id='+ ViewID + ' class="task_buttons" width="15%"> View </button></td>';*/ 
			emailHtml += '</tr>';
            emailHtml += '<tr> <td>Date: ' + data.date + '</td></tr>';
            emailHtml += '<tr style="border-bottom: 1px solid #ddd; margin-bottom: 5px;"> <td>Subject: ' + data.subject + '</td></tr>';
            emailHtml += '<tr> <td>Message:' + data.message + '</td></tr>';
			$('#individual_email').html(emailHtml);
		},
		error: function(jqXHR, textStatus, errorThrown){
			console.log("errror");
		}
	});
	
}

function UpdateView (View_ID){
	var id = {
		index: View_ID,
		list: '0'
	};
	$.ajax({
		type:'GET',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		data: id,
		success: function (data, textStatus, jqXHR )
		{
			console.log(data);
			emailHtml = '';
			emailHtml += '<tr> <td width="80%">From: ' + data.from;
			/*emailHtml += '<td> <button id='+ ViewID + ' class="task_buttons" width="15%"> View </button></td>';*/ 
			emailHtml += '</tr>';
            emailHtml += '<tr> <td>Date: ' + data.date + '</td></tr>';
            emailHtml += '<tr style="border-bottom: 1px solid #ddd; margin-bottom: 5px;"> <td>Subject: ' + data.subject + '</td></tr>';
            emailHtml += '<tr> <td>Message:' + data.message + '</td></tr>';
			$('#individual_email').html(emailHtml);
		},
		error: function(jqXHR, textStatus, errorThrown){
			console.log("errror");
		}
	});
	
}

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



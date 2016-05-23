$(document).ready(function() {
	chrome.identity.getProfileUserInfo(function(identity) {
	    console.log("Logged in as", identity.email)
	    if (identity.email == null || identity.email == '') {
	        return;
	    }
        $('#email_ui').click(send_auth);
        $("#send_email").click(send_email);
	    $("#increment_email").click(increment_email);
        $("#decrement_email").click(decrement_email);
        checkEmail();
    });
});

function send_auth() {
    var email = {
            to: 'dud@desktab.me',
            subject: 'authorize',
            message: 'authorize'
    };
    $.ajax({
        type: 'GET',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		data: email,
		success: function(data) {
		    var auth = data.indexOf('Authorization needed');
		    if (auth === 19) {
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
		message: message,
		authorize : 'authorize'
	};
	$.ajax({
		type: 'GET',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		data: email,
		success: function(data) {
			console.log(email.authorize);
			console.log(data);
			if (data == '"Email Sent"') {
                alert("Email successfully sent!");
			}
			else {
			    //showSendAuthPrompt();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
		    alert(textStatus, errorThrown);
		}
	});
    
};

var email_index = 0;

function increment_email() {
	email_index += 5;
	checkEmail();
};

function decrement_email() {
	if(email_index == 0){
		return;
	} 
	email_index -= 5;
	checkEmail();
};

function checkEmail() {
    $('#emails').html('<tr><td> Loading emails... <tr><td>');
	var amount_emails = {
    	index: email_index,
		list: '1'
    };
	$.ajax({
		type: 'GET',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		data: amount_emails,
		success: function(emails) {
			var ViewButton = new Array();
			var DeleteButton = new Array();
		    if (emails[0].from == undefined || emails[0].date == undefined) {
		        $('#emails').html('<tr><td> Error loading emails, refresh page or authorize reading script </td></tr>');
		    }
		    else {
		        var newHtml = '';
			    var emailHtml = '';
                var monthName = ['January', 'February', 'March', 'April', 
                             'May', 'June', 'July', 'August',
                             'September', 'October', 'November', 'December']; 
                             
                for( var i = 0; i < emails.length; ++i) {
				    var emailFrom = emails[i].from;
				    
				    var date = new Date(emails[i].date);
				    var emailDate = monthName[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear();
				    
                    var emailSubject = emails[i].subject;
                    var emailMessage = emails[i].message;
					var j = i + email_index;
					var ViewID = 'View_' + j;
					var DeleteID = 'Delete_' + j;
					
                    emailHtml += '<tr> <td width="80%">From: ' + emailFrom + '</td>';
					emailHtml += '<td> <button id='+ ViewID + ' class="task_buttons" width="15%"> View </button></td>'; 
					emailHtml += '<td> <button id='+ DeleteID + ' class="delete_button" width="15%"> Delete </button></td>'; 
					emailHtml += '</tr>';
                    emailHtml += '<tr> <td>Date: ' + emailDate + '</td></tr>';
                    emailHtml += '<tr style="border-bottom: 3px solid #ddd; margin-bottom: 5px;"> <td>Subject: ' + emailSubject + '</td></tr>';
				    emailHtml += '<tr> <td> <br /> </td></tr>';
					ViewButton.push(ViewID);
					DeleteButton.push(DeleteID);

					newHtml += emailHtml;
                    emailHtml = '';
			    }
			    $('#emails').html(newHtml);
				for (var j = 0; j < ViewButton.length; ++j)
				{
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
		action: 'delete'
	};
	$.ajax({
		type:'POST',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		data: id,
		success: function (data, textStatus, jqXHR )
		{
			emailHtml = '';
			emailHtml += '<tr> <td width="80%">Email Deleted.';
			emailHtml += '</tr>';

			$('#individual_email').html(emailHtml);
			checkEmail();
		},
		error: function(jqXHR, textStatus, errorThrown){
			console.log("error");
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
			console.log("error");
		}
	});
	
}

function showReadAuthPrompt() {
    var height = 500; var width = 654; 
    var top = (screen.height - height) / 2; 
    var left = (screen.width - width) / 2; 
    var positionString = 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left + ',scrollbars=yes'; 
    window.open('https:\/\/accounts.google.com\/o\/oauth2\/auth?client_id\x3d559312507327-0qj7n8l1hk4grs5mqon0bucbvfs0p10f@developer.gserviceaccount.com\x26redirect_uri\x3dhttps:\/\/script.google.com\/oauthcallback\x26state\x3dACjPJvExrfj-JlMQSeY94bFZ_4jAZS00DrEL-RCRjeKrvLBuOR2ta_b-WFucj1hcBnHVNGbHlIkuAvjafifHlhgUV4yhOYCCfAg\x26scope\x3dhttps:\/\/mail.google.com\/\x26response_type\x3dcode+gsession\x26access_type\x3doffline\x26approval_prompt\x3dforce\x26hl\x3den\x26authuser\x3d0', '_blank', positionString); 
}

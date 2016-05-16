$(document).ready(function() {
    checkEmail();
	setTimeout(function() {
	    checkEmail();
	}, 15000);
});

function checkEmail(){
	$.ajax({
		type: 'GET',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		success: function(emails) {
		    if (emails[0].from == undefined || emails[0].date == undefined || emails[0].message == undefined) {
		        $('#emails').html('<tr><td> Requires DeskTab to read your emails </td></tr>');
		    }
		    else {
		        var newHtml = '';
			    var emailHtml = '';

                for( var i = 0; i < emails.length; ++i) {
				    var emailFrom = emails[i].from;
				    var emailDate = emails[i].date;
				    var emailSubject = emails[i].subject;
				    var emailMessage = emails[i].message;
				
				    emailHtml += '<tr> <td>From: ' + emailFrom + '</td></tr>';
				    emailHtml += '<tr> <td>Date: ' + emailDate + '</td></tr>';
				    emailHtml += '<tr> <td>Subject: ' + emailSubject + '</td></tr>';
				    emailHtml += '<tr> <td>Message:' + emailMessage + '</td></tr>';
				    emailHtml += '<tr> <td> =================================================<br /> </td></tr>';

				    newHtml += emailHtml;
                    emailHtml = '';
			    }
			    $('#emails').html(newHtml);
		    }
		},
		error: function() {
            
        }
	});
}

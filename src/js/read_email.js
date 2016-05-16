$(document).ready(function() {
	/*
	$('#check_email').click(function() {
		checkEmail();
	});*/
	checkEmail();
});

function checkEmail(){
	$.ajax({
		type: 'GET',
		url: 'https://script.google.com/macros/s/AKfycbzL4jwfov5tWs3XpSTaEpE6O1dRno8By9rT_-9sBOmciePyZFWt/exec',
		success: function(emails){
			console.log("check email");
			var newHtml = '';
			var emailHtml = '';
			console.log(emails);
			console.log(emails.length);
			//console.log(emails.from);
			//var viewButtons = new Array();
			
			
			for( var i = 0; i < emails.length; ++i){
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
			checkEmail();
		},
		error: function() {
            alert("error check emails");
        }
	});
}

$(document).ready(function () {          
	  // Create calendar.
	  $("#jqxWidget").jqxCalendar({ enableTooltips: true, width: 220, height: 220});
	  
	  
		chrome.identity.getProfileUserInfo(function(data) {
			var userInfo = { 
				username: data.email
			};
			$('#view_event').click(function() {
				loadEvents(userInfo);
			});
			$('#save_event').click(function() {
				addEvent(data.email);
			});
			
			SpecialEvent(userInfo);
			$('#delete_event').click(function() {
				deleteEvents(userInfo);
			});
		}); 
});
 
  function addEvent(email) {
	var input = document.getElementById("form_add_event");
    var tmpD = new Date();
	var eventInfo = input.elements["event"].value;
	var y = tmpD.getFullYear();
	if(tmpD.getMonth()+ 1 < 11 && tmpD.getMonth() != 0){
		var m = tmpD.getMonth()+1;
	}
	else{
		var m = tmpD.getMonth();
	}
	var d = input.elements["d"].value;
	console.log(eventInfo);
    if (eventInfo == '') {
        return;
    }
	  
	  //var eventDate = new Date(y, m, d);
	  var eventDate = y.toString() + '-' + m.toString() + '-' + d.toString();
	  var eventInput = {
		  username: email,
		  date: eventDate,
		  description: eventInfo
	  };

	  
    $.ajax({
        type: 'POST',
        url: 'https://desktab.me/Calendar/CreateEvent',
        data: eventInput,
        success: function(data) {
				//$("#jqxWidget").jqxCalendar({ enableTooltips: false, width: 220, height: 220});
				loadEvents(email);
				$('#form_add_event')[0].reset();
				SpecialEvent(eventInput);
				var sD = $("#jqxWidget").jqxCalendar('specialDates');
				$("#jqxWidget").jqxCalendar({ specialDates: sD });
		},
		error: function(errorThrown) {
			//alert(textStatus, errorThrown);
		}
	});
}
	


function SpecialEvent(userInfo) {
    $.ajax({
        type: 'GET',
        url: 'https://desktab.me/Calendar/GetSpecialEvents',
        data: userInfo,
        success: function(Event) {	
			$("#jqxWidget").jqxCalendar("specialDates", []);
			for (var i = 0; i < Event.length; ++i){
				var  strdate = Event[i].date.toString();
				var count = 2;
				//console.log(Event[i]);
				var split = strdate.split("-");
				var dates = split[2];
				var newDate = new Date();
				//console.log(parseInt(dates,10));
				newDate.setDate(dates);
				//console.log(parseInt(dates,10));
				var STR = '1. ' + Event[i].description + ' ';
				console.log(STR);
				for (var j = 1; j < Event.length; ++j){
					var  strdate2 = Event[j].date.toString();
					var split2 = strdate2.split("-");
					var dates2 = split2[2];
					if(dates == dates2){
						STR = STR + count + '. ' + Event[j].description + ' ';
						count++;
					}
				}
				$("#jqxWidget").jqxCalendar('addSpecialDate', newDate, '', STR);
				$("#jqxWidget").jqxCalendar('refresh');
			}
			
		},
			error: function(errorThrown) {
			console.log("error");
			}
	});
}


function loadEvents (userInfo){
	$.ajax({
		type: 'GET',
        url: 'https://desktab.me/Calendar/GetAllEvents',
        data: userInfo,
        success: function(Event) {
			var deleteButtons = new Array();
			var newHtml  = '';
			var eventHTML = '';
			var monthName = ['January', 'February', 'March', 'April', 
				 'May', 'June', 'July', 'August',
				 'September', 'October', 'November', 'December']; 

			for (var i = 0; i < Event.length; ++i) {
                var eventDescription = Event[i].description;
				var eventSTR = new Date(Event[i].date);
				var eventDate = '';
				eventDate += monthName[eventSTR.getUTCMonth()];
				eventDate += ', ';
				eventDate += eventSTR.getUTCDate();
				eventDate += ' ';
				eventDate += eventSTR.getUTCFullYear();
				var eventID = Event[i].event_id;

				var deleteId = 'delete_' + Event[i].event_id.toString();
				
				eventHTML += '<tr>';
				eventHTML += '<td width="70%"> Date:' +eventDate + '</td>';
				eventHTML += '<td width="30%"> <button id=' + deleteId + ' class="task_buttons">Delete </button></td>';
				eventHTML += '</tr>';
				
				eventHTML += '<tr>';
				eventHTML += '<td style="border-bottom: 1px solid #ddd;">'+ eventDescription + '</td>';
				eventHTML += '<td style="border-bottom: 1px solid #ddd;"> </td>';
				eventHTML += '</tr>';
				
				
				deleteButtons.push(deleteId);
				

				
				newHtml += eventHTML;
                eventHTML = '';
			}
			$('#event_list').html(newHtml);
			
			for (var i = 0; i < deleteButtons.length; ++i) {
                $('#' + deleteButtons[i]).click(function() {
                    deleteEvent(this.id.replace(/\D/g, ''));
                });
		SpecialEvent(userInfo);
		var sD = $("#jqxWidget").jqxCalendar('specialDates');
		$("#jqxWidget").jqxCalendar({ specialDates: sD });
			}
				
		},
		error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus, errorThrown);
		}	
	});
}
		


function deleteEvent(event_id) {
    var deleteEvent = {
        event_id: event_id
    };
    $.ajax({
        type: 'DELETE',
        url: 'https://desktab.me/Calendar/DeleteEvent',
        data: deleteEvent,
        success: function(data) {
            chrome.identity.getProfileUserInfo(function(identity) {
                    var userInfo = { 
                    username: identity.email
                };
                loadEvents(userInfo); 
		SpecialEvent(userInfo);
		var sD = $("#jqxWidget").jqxCalendar('specialDates');
		$("#jqxWidget").jqxCalendar({ specialDates: sD });
            });
			console.log(data);
        },
        error: function(errorThrown) {
            //alert(textStatus, errorThrown);
        }
    });
}		
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			

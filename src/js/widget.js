  $(document).ready(function () {          
	  // Create calendar.
	  $("#jqxWidget").jqxCalendar({ enableTooltips: false, width: 220, height: 220});
	  
	  
		chrome.identity.getProfileUserInfo(function(data) {
			var userInfo = { 
				username: data.email
			};
			loadEvents(userInfo);
			$('#save_event').click(function() {
				addEvent(data.email);
			});
			
			SpecialEvent(userInfo);
			$('#delete_event').click(function() {
				deleteEvents(userInfo);
			});
		});
		
	  // Create Date objects.
	  /*var date1 = new Date();
	  var date2 = new Date();
	  var date3 = new Date();
	  date1.setDate(16);
	  date2.setDate(15);
	  date3.setDate(16);
	  // Add special dates by invoking the addSpecialDate method.
	  $("#jqxWidget").jqxCalendar('addSpecialDate', date1, '', 'Special Date1');
	  $("#jqxWidget").jqxCalendar('addSpecialDate', date2, '', 'Special Date2');
	  $("#jqxWidget").jqxCalendar('addSpecialDate', date3, '', 'Special Date3');
	  
	  */
	  
	  
	  
  });
 
  function addEvent(email) {
	var input = document.getElementById("form_add_event");
    var tmpD = new Date();
	var eventInfo = input.elements["event"].value;
	var y = tmpD.getFullYear();
	var m = tmpD.getMonth();
	var d = input.elements["d"].value;
	console.log(eventInfo);
    if (eventInfo == '') {
		console.log('innn');
        return;
    }
	  
	  //var eventDate = new Date(y, m, d);
	  var eventDate = y.toString() + '-' + m.toString() + '-' + d.toString();
	  var eventInput = {
		  username: email,
		  date: eventDate,
		  description: eventInfo
	  };
	  console.log(eventDate);
	  
    $.ajax({
        type: 'POST',
        url: 'https://desktab.me/Calendar/CreateEvent',
        data: eventInput,
        success: function(data) {
				//$("#jqxWidget").jqxCalendar({ enableTooltips: false, width: 220, height: 220});
				loadEvents(email);
				$('#form_add_event')[0].reset();
				SpecialEvent(userInfo);
				$("#jqxWidget").jqxCalendar('refresh');
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
			console.log(Event);
			for (var i = 0; i < Event.length; ++i){
				var  strdate = Event[i].date.toString();
				//console.log(Event[i]);
				var split = strdate.split("-");
				var dates = split[2];
				var newDate = new Date();
				//console.log(parseInt(dates,10));
				newDate.setDate(dates);
				//console.log(parseInt(dates,10));
				$("#jqxWidget").jqxCalendar('addSpecialDate', newDate, '', "");
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
			console.log(Event.length);
			console.log(Event);
			for (var i = 0; i < Event.length; ++i) {
                var eventDescription = Event[i].description;
				var eventSTR = new Date(Event[i].date);
				var eventDate = '';
				eventDate += monthName[eventSTR.getMonth()];
				eventDate += ', ';
				eventDate += eventSTR.getDay();
				eventDate += ' ';
				eventDate += eventSTR.getFullYear();
				var eventID = Event[i].event_id;
				console.log( Event[i]);
				var deleteId = 'delete_' + Event[i].event_id.toString();
				
				eventHTML += '<li> Due: ' + eventDate + '<br/>';
				eventHTML += eventDescription + '</a></li>';
				eventHTML += '<li> <button id=' + deleteId + '> Delete </button></li>';
				
				deleteButtons.push(deleteId);
				
				console.log(eventHTML);
				
				newHtml += eventHTML;
                eventHTML = '';
			}
			$('#event_list').html(newHtml);
			
			for (var i = 0; i < deleteButtons.length; ++i) {
                $('#' + deleteButtons[i]).click(function() {
                    deleteEvent(this.id.replace(/\D/g, ''));
                });
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
            });
			console.log(data);
        },
        error: function(errorThrown) {
            //alert(textStatus, errorThrown);
        }
    });
}		
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
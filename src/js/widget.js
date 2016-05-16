  $(document).ready(function () {          
	  // Create calendar.
	  $("#jqxWidget").jqxCalendar({ enableTooltips: true, width: 220, height: 220});
	  
	  
		chrome.identity.getProfileUserInfo(function(data) {
		var userInfo = { 
			username: data.email
		};
		loadTasks(userInfo);
		$('#save_task').click(function() {
			addTask(data.email);
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
  /*
  function addEvent(email) {
	  
	var input = document.getElementById("addEvent");
    
    if (input.elements['task'].value == '') {
        return;
    }
	  
	  var eventInput = {
		  username: email,
		  date: input.elements["year"].value + '-' + input.elements["month"].value + '-' + input.elements["day"].value,
		  description: input.elements["Event Name"].value
	  };
	  
	  
	  
	  
	  
    $.ajax({
        type: 'POST',
        url: 'https://desktab.me/GetTask',
        data: userInfo,
        success: function(description) {
			
			
			*/
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
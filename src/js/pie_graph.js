$( document ).ready(function() {
	google.charts.load('current', {packages: ['corechart']});
	google.charts.setOnLoadCallback(drawChart);
	
	function drawChart() {
		chrome.identity.getProfileUserInfo(function(login) {
			var graphData = { username: login.email,
								domainName: "www.google.com"};
			
			$.ajax({
				type:'GET',
				url:'https://desktab.me/ListedSite/GetASiteTimeHistory',
				data: graphData,
				success: function( data ) {
					
					var graph = new google.visualization.arrayToDataTable([
					['Day', 'Wasted Time'	],
					['Yesterday', data.dailyTime_0],
					['2 Days Ago', data.dailyTime_1],
					['3 Days Ago', data.dailyTime_2],
					['4 Days Ago', data.dailyTime_3],
					['5 Days Ago', data.dailyTime_4],
					['6 Days Ago', data.dailyTime_5],
					['7 Days Ago', data.dailyTime_6]
			
			
					]);
					
					
					var options = {
						title: 'Time Spent on a Flagged Website in the Past 7 Days',
						height: 250,
						width: 400,
					};
					
					var chart = new google.visualization.PieChart(document.getElementById('pie_chart'));
					
					chart.draw(graph, options);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					alert('Error: Pie Chart');
				}
			});
		});
	}
});

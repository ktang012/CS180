$( document ).ready(function() {
	//google.charts.load('current', {packages: ['corechart', 'bar']});
	google.charts.setOnLoadCallback(drawBasic);

	function drawBasic() {
		  
		  chrome.identity.getProfileUserInfo(function(login) {
			  var graphData = { username: login.email };
			  					
			  $.ajax({
			  	type:'GET',
			  	url:'https://desktab.me/ListedSite/GetListedSites',
			  	data: graphData,
			  	success: function( data ) {
			  		var graph = new google.visualization.DataTable();
			  		var size = Object.keys(data).length
			  		graph.addColumn('string', 'Sites');
			  		graph.addColumn('number', 'Time');
			  		for (var i = 0; i < size; ++i)
			  		{
			  			
			  			graph.addRows([
			  			[data[i].domainName, data[i].dailyTime]]);
			  	
			  		}
					var options = {
				  		title: 'Time Spent on Each Flagged Website',
				  		height: '250',
				  		width: '400',
				  		animation:{
				  			startup: true,
				  			duration: 1000,
				  			easing: 'out'
				  		},
				  		hAxis:{
				  			title: 'Time'
				  		},
				  		vAxis:{
				  			title: 'Websites'
				  		},
				  	};

				  var chart = new google.visualization.BarChart(document.getElementById('bar_graph'));
				  chart.draw(graph, options);
		
			  	},
			  	error: function(jqXHR, textStatus, errorThrown) {
			  		alert('Error: Bar Graph');
			  	}
			});
			}); 
	}

});

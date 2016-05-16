$(document).ready(function() {
    //Set it to be initially hidden for toggle()
    $('#draw_graph').hide();
    $('#bar_graph').hide();
    chrome.identity.getProfileUserInfo(function(data) {
        var userInfo = { 
            username: data.email
        };
        loadListedSites(userInfo);
        google.charts.load('current', {packages: ['corechart']});
        $('#toggle_graphs').click(function() {
            $('#draw_graph').toggle();
        });
        $('#overall_bar_graph').click(function() {
            $('#bar_graph').toggle();
            displayBarGraph();
        });
    });
});

function loadListedSites(userInfo) {
    $.ajax({
        type: 'GET',
        url: 'https://desktab.me/ListedSite/GetListedSites',
        data: userInfo,
        success: function(listedSites, textStatus, jqXHR) {
            var newHtml = '';
            var timeCapButtons = new Array();
            var deleteButtons = new Array();
            var piGraphButtons = new Array();
            var lineGraphButtons = new Array();

            var siteHtml = '';
            siteHtml += '<tr>';
            siteHtml += '<td> Status </td>';
            siteHtml += '<td> Domain Name </td>';
            siteHtml += '<td> Daily Time </td>';
            siteHtml += '<td> Time Cap </td>';
            siteHtml += '<td> Update </td>';
            siteHtml += '<td> Delete </td>';                
            siteHtml += '</tr>';
            
            newHtml += siteHtml;
            siteHtml = '';
            
            // Construct HTML
            for (var i = 0; i < listedSites.length; ++i) {
                var listedSiteOwner = listedSites[i].owner;
                var listedSiteDomainName = listedSites[i].domainName;
                var listedSiteDailyTime = listedSites[i].dailyTime;
                var listedSiteBlockedTime = listedSites[i].blockedTime;
                var listedSiteIsBlocked = listedSites[i].isBlocked;
                var listedSiteTimeCap = listedSites[i].timeCap;

                // IMPORTANT: Since IDs in HTML cannot have '.', we replace it with '_'
                var trID = 'tr_' + listedSiteDomainName.replace(/\./g, '_');              
                var timeCapButtonID = 'timeCapButton_' + listedSiteDomainName.replace(/\./g, '_');
                var deleteButtonID = 'deleteButton_' + listedSiteDomainName.replace(/\./g, '_');
                var piGraphButtonID = 'piGraphButton_' + listedSiteDomainName.replace(/\./g, '_');
                var lineGraphButtonID = 'lineGraphButton_' + listedSiteDomainName.replace(/\./g, '_');

                siteHtml += '<tr id=' + trID + '>';
                
                if (listedSiteIsBlocked == 1) {
                    siteHtml += '<td> <input type="checkbox" checked></input> </td>';
                }
                else {
                    siteHtml += '<td> <input type="checkbox"></input> </td>';
                }

                siteHtml += '<td>' + listedSiteDomainName + '</td>';
                siteHtml += '<td>' + listedSiteDailyTime + '</td>';
                siteHtml += '<td><form><input type="text" name="new_time" ';
                siteHtml += 'value="' + listedSiteTimeCap + '"></input></form></td>';
                siteHtml += '<td><button id=' + timeCapButtonID + '>Update</button></td>';
                siteHtml += '<td><button id=' + deleteButtonID + '>Delete</button></td>';
                siteHtml += '<td><button id=' + piGraphButtonID + '>Pie Graph</button></td>';
                siteHtml += '<td><button id=' + lineGraphButtonID + '>Line Graph</button></td>';            
                siteHtml += '</tr>';
   
                timeCapButtons.push(timeCapButtonID);
                deleteButtons.push(deleteButtonID);
                piGraphButtons.push(piGraphButtonID);
                lineGraphButtons.push(lineGraphButtonID);

                newHtml += siteHtml;
                siteHtml = '';
            }
            
            // Load HTML
            $('#sites_table').html(newHtml);
            
            // Bind to HTML
            // I'm so sorry for this code, please don't kill me
            for (var i = 0; i < timeCapButtons.length && i < deleteButtons.length && piGraphButtons.length; ++i) {
                // First argument is the domainName we parse from the button id
                // Second argument is the value of the checkbox, we first have to find our
                // parent tr, table row, get that, then find our first td, the checkbox, in the row
                // then we find the input value of it
                // Third argument is the value we have in the forms field... it goes through
                // a similar process just like the second argument
                
                // The abomination in all its atrocity:
                // for finding the checkbox
                // $($($($(this).parents('tr').get(0)).find('td:first').get(0)).find('input').get(0)).is(':checked')
                $('#' + timeCapButtons[i]).click(function() {
                    var listedSiteTR = $(this).parents('tr').get(0);
                    
                    var listedSiteFirstTD = $(listedSiteTR).find('td:first').get(0);
                    var listedSiteCheckBox = $(listedSiteFirstTD).find('input').get(0);
                    var isChecked = $(listedSiteCheckBox).is(':checked');
                    
                    var listedSiteFourthTD = $(listedSiteTR).find('td:nth-child(4)').get(0);
                    var listedSiteForms = $(listedSiteFourthTD).find('input').get(0);
                    var timeCapInput = $(listedSiteForms).val();
                    
                    updateListedSite(this.id.replace(/timeCapButton_/g, '').replace(/_/g, '.'),
                                     isChecked, timeCapInput, listedSiteTR);
                });
                 
                $('#' + deleteButtons[i]).click(function() {
                    deleteListedSite(this.id.replace(/deleteButton_/g, '').replace(/_/g, '.'));
                });
                
                $('#' + piGraphButtons[i]).click(function() {
                    displayPiGraph(this.id.replace(/piGraphButton_/g, '').replace(/_/g, '.'));
                });
                
                $('#' + lineGraphButtons[i]).click(function() {
                    displayLineGraph(this.id.replace(/lineGraphButton_/g, '').replace(/_/g, '.'));
                });
            }    
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(textStatus, errorThrown); 
        } 
    });
}

// This can be optimized to only reload that particular tr if anyone wants to do it, I passed in the tr
function updateListedSite(domainName, isBlocked, timeCap, listedSiteTR) {
    console.log(domainName, isBlocked, timeCap, listedSiteTR);
    console.log(listedSiteTR.id);
  
    if (timeCap.match(/[a-z]/i)) {
        return;
    }
    
    chrome.identity.getProfileUserInfo(function(data) {
        var listedSiteInfo = { 
            username: data.email,
            domainName: domainName,
            isBlocked: isBlocked ? 1 : 0,
            timeCap: parseInt(timeCap, 10)
        };
        console.log(listedSiteInfo);
        $.ajax({
            type: 'POST',
            url: 'https://desktab.me/ListedSite/EditListedSite',
            data: listedSiteInfo,
            success: function(data, textStatus, jqXHR) {
                chrome.identity.getProfileUserInfo(function(identity) {
                    var userInfo = { 
                        username: identity.email
                    };
                    loadListedSites(userInfo);
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
            
            }
        });
    });
    
}

function deleteListedSite(domainName) {
    chrome.identity.getProfileUserInfo(function(data) {
        var listedSiteInfo = { 
            username: data.email,
            domainName: domainName
        };
        $.ajax({
            type: 'DELETE',
            url: 'https://desktab.me/ListedSite/DeleteListedSite',
            data: listedSiteInfo,
            success: function(data, textStatus, jqXHR) {
                chrome.identity.getProfileUserInfo(function(identity) {
                    var userInfo = { 
                        username: identity.email
                    };
                    loadListedSites(userInfo); 
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }       
        });
    });
}

function displayPiGraph(domainName) {
	google.charts.setOnLoadCallback(drawChart); 
    function drawChart() {
        chrome.identity.getProfileUserInfo(function(login) {
	        var graphData = { username: login.email,
                          domainName: domainName };
			    $.ajax({
                    type:'GET',
                    url:'https://desktab.me/ListedSite/GetASiteTimeHistory',
                    data: graphData,
                    success: function( data ) {
					    var graph = new google.visualization.arrayToDataTable([
                                    ['Day', 'Time Spent'	],
                                    ['Yesterday', data.dailyTime_0/60],
                                    ['2 Days Ago', data.dailyTime_1/60],
                                    ['3 Days Ago', data.dailyTime_2/60],
                                    ['4 Days Ago', data.dailyTime_3/60],
                                    ['5 Days Ago', data.dailyTime_4/60],
                                    ['6 Days Ago', data.dailyTime_5/60],
                                    ['7 Days Ago', data.dailyTime_6/60]
					    ]);

					    var options = {
                            title: 'Time spent on ' + domainName.toUpperCase() + ' in the past 7 days',
                            height: 250,
                            width: 750,
					    };

                        var chart = new google.visualization.PieChart(document.getElementById('draw_graph'));
                        chart.draw(graph, options);
                    },
				    error: function(jqXHR, textStatus, errorThrown) {
                        alert('Error: Pie Chart');
                    }
                });
        });
    }
}

function displayLineGraph(domainName) {
    google.charts.setOnLoadCallback(drawLineGraph);
    function drawLineGraph() {
        chrome.identity.getProfileUserInfo(function(login) {
	        var graphData = { username: login.email,
                              domainName: domainName };
			$.ajax({
                type:'GET',
                url:'https://desktab.me/ListedSite/GetASiteTimeHistory',
                data: graphData,
                success: function( data ) {
                    var graph = new google.visualization.arrayToDataTable([
                        ['Day', 'Time Spent'],
                        ['Yesterday', data.dailyTime_0/60],
                        ['2 Days Ago', data.dailyTime_1/60],
                        ['3 Days Ago', data.dailyTime_2/60],
                        ['4 Days Ago', data.dailyTime_3/60],
                        ['5 Days Ago', data.dailyTime_4/60],
                        ['6 Days Ago', data.dailyTime_5/60],
                        ['7 Days Ago', data.dailyTime_6/60]
				    ]);

                    var options = {
                        title: 'Time spent on ' + domainName.toUpperCase() + ' in the past 7 days',
                        height: 250,
                        width: 750,
                        vAxis: {
                            title: 'Time (minutes)'
                        },
                        hAxis: {
                            direction: -1
                        },
                        animation:{
				  			startup: true,
				  			duration: 1000,
				  			easing: 'out'
				  		},
                    };

                    var chart = new google.visualization.LineChart(document.getElementById('draw_graph'));
                    chart.draw(graph, options);
                },
				error: function(jqXHR, textStatus, errorThrown) {
                    alert('Error: Line Chart');
                }
            });
        });
    }
}

function displayBarGraph() {
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
			  			[data[i].domainName, data[i].dailyTime/60]]);
			  	
			  		}
					var options = {
				  		title: 'Time Spent on Each Flagged Website',
				  		height: 250,
                        width: 750,
				  		orientation: 'horizontal',
				  		animation:{
				  			startup: true,
				  			duration: 1000,
				  			easing: 'out'
				  		},
				  		vAxis:{
				  			title: 'Time (minutes)'
				  		},
				  		hAxis:{
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
}



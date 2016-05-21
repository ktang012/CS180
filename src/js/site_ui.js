$(document).ready(function() {
    //Set it to be initially hidden for toggle()
    displayOverallStatsBarGraph();
    chrome.identity.getProfileUserInfo(function(data) {
        var userInfo = { 
            username: data.email
        };
        loadListedSites(userInfo);
        google.charts.load('current', {packages: ['corechart']});
        $('#toggle_bar_graph').click(function() {
            displayOverallStatsBarGraph();
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
            
            var timeCapForms = new Array();
            var blockCheckBoxes = new Array();
            
            var siteHtml = '';
            siteHtml += '<tr>';
            siteHtml += '<td> Status </td>';
            siteHtml += '<td> Domain Name </td>';
            siteHtml += '<td> Daily Time </td>';
            siteHtml += '<td> Time Cap (minutes) </td>';                
            siteHtml += '</tr>';
            
            newHtml += siteHtml;
            siteHtml = '';
            
            // Construct HTML
            for (var i = 0; i < listedSites.length; ++i) {
                var listedSiteOwner = listedSites[i].owner;
                var listedSiteDomainName = listedSites[i].domainName;
                var listedSiteDailyTime = Math.floor(listedSites[i].dailyTime/60);
                var listedSiteBlockedTime = listedSites[i].blockedTime;
                var listedSiteIsBlocked = listedSites[i].isBlocked;
                var listedSiteTimeCap = listedSites[i].timeCap / 60;

                // IMPORTANT: Since IDs in HTML cannot have '.', we replace it with '_'
                var trID = 'tr_' + listedSiteDomainName.replace(/\./g, '_');              
                var deleteButtonID = 'deleteButton_' + listedSiteDomainName.replace(/\./g, '_');
                var piGraphButtonID = 'piGraphButton_' + listedSiteDomainName.replace(/\./g, '_');
                var lineGraphButtonID = 'lineGraphButton_' + listedSiteDomainName.replace(/\./g, '_');
                
                var timeCapFormID = 'timeCapForm_' + listedSiteDomainName.replace(/\./g, '_');
                var blockCheckBoxID = 'blockCheckBox_' + listedSiteDomainName.replace(/\./g, '_');
                

                siteHtml += '<tr id=' + trID + '>';
                
                if (listedSiteIsBlocked == 1) {
                    siteHtml += '<td> <input type="checkbox" id="' + blockCheckBoxID;
                    siteHtml += '"checked></input> </td>';
                }
                else {
                    siteHtml += '<td> <input type="checkbox" id="' + blockCheckBoxID;
                    siteHtml += '"></input> </td>';
                }

                siteHtml += '<td>' + listedSiteDomainName + '</td>';
                siteHtml += '<td>' + listedSiteDailyTime + ' minutes</td>';
                siteHtml += '<td><input type="text" class="form-control" id="' + timeCapFormID + '"';
                siteHtml += 'value="' + listedSiteTimeCap + '"></input></td>';
                siteHtml += '<td><button class="glyphicon glyphicon-remove-sign" ';
                siteHtml += 'id=' + deleteButtonID + '></button></td>';
                siteHtml += '<td><button id=' + piGraphButtonID + '>Pie Chart</button></td>';
                siteHtml += '<td><button id=' + lineGraphButtonID + '>Line Graph</button></td>';            
                siteHtml += '</tr>';
                
                timeCapForms.push(timeCapFormID);
                blockCheckBoxes.push(blockCheckBoxID);
                deleteButtons.push(deleteButtonID);
                piGraphButtons.push(piGraphButtonID);
                lineGraphButtons.push(lineGraphButtonID);

                newHtml += siteHtml;
                siteHtml = '';
            }
            
            // Load HTML
            $('#sites_table').html(newHtml);
            
            // Bind to HTML
            for (var i = 0;i < deleteButtons.length && piGraphButtons.length; ++i) {
                
                $('#' + timeCapForms[i]).keypress(function(e) {
                    if (e.keyCode == 13) { // 'Enter'
                        var timeCapInput = $(this).val();
                        
                        var listedSiteTR = $(this).parents('tr').get(0);
                        var listedSiteFirstTD = $(listedSiteTR).find('td:first').get(0);
                        var listedSiteCheckBox = $(listedSiteFirstTD).find('input').get(0);
                        var isChecked = $(listedSiteCheckBox).is(':checked');
                        
                        updateListedSite(this.id.replace(/timeCapForm_/g, '').replace(/_/g, '.'),
                                         isChecked, timeCapInput, listedSiteTR);
                    
                    }
                });
                
                $('#' + blockCheckBoxes[i]).change(function() {
                    var isChecked = $(this).is(':checked');

                    var listedSiteTR = $(this).parents('tr').get(0);
                    var listedSiteFourthTD = $(listedSiteTR).find('td:nth-child(4)').get(0);
                    var listedSiteForms = $(listedSiteFourthTD).find('input').get(0);
                    var timeCapInput = $(listedSiteForms).val();
                        
                    updateListedSite(this.id.replace(/blockCheckBox_/g, '').replace(/_/g, '.'),
                                     isChecked, timeCapInput, listedSiteTR);
                });
     
                $('#' + deleteButtons[i]).click(function() {
                    deleteListedSite(this.id.replace(/deleteButton_/g, '').replace(/_/g, '.'));
                });
                
                $('#' + piGraphButtons[i]).click(function() {
                    displayBasicPiGraph(this.id.replace(/piGraphButton_/g, '').replace(/_/g, '.'));
                });
                
                $('#' + lineGraphButtons[i]).click(function() {
                    displayBasicLineGraph(this.id.replace(/lineGraphButton_/g, '').replace(/_/g, '.'));
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
    if (timeCap.match(/[a-z]/i)) {
        alert("Error: Expected digits");
        return;
    }
    
    chrome.identity.getProfileUserInfo(function(data) {
        var listedSiteInfo = { 
            username: data.email,
            domainName: domainName,
            isBlocked: isBlocked ? 1 : 0,
            timeCap: parseInt(timeCap * 60, 10)
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

function displayBasicPiGraph(domainName) {
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
                                    ['Yesterday', Math.floor(data.dailyTime_0/60)],
                                    ['2 days ago', Math.floor(data.dailyTime_1/60)],
                                    ['3 days ago', Math.floor(data.dailyTime_2/60)],
                                    ['4 days ago', Math.floor(data.dailyTime_3/60)],
                                    ['5 days ago', Math.floor(data.dailyTime_4/60)],
                                    ['6 days ago', Math.floor(data.dailyTime_5/60)],
                                    ['7 days ago', Math.floor(data.dailyTime_6/60)]
					    ]);

					    var options = {
                            title: 'Time(minutes) spent on ' + domainName.toUpperCase() + ' in the past 7 days',
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

function displayBasicLineGraph(domainName) {
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
                        ['Yesterday', Math.floor(data.dailyTime_0/60)],
                        ['2 days ago', Math.floor(data.dailyTime_1/60)],
                        ['3 days ago', Math.floor(data.dailyTime_2/60)],
                        ['4 days ago', Math.floor(data.dailyTime_3/60)],
                        ['5 days ago', Math.floor(data.dailyTime_4/60)],
                        ['6 days ago', Math.floor(data.dailyTime_5/60)],
                        ['7 days ago', Math.floor(data.dailyTime_6/60)]
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

function displayOverallStatsBarGraph() {
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
			  		for (var i = 0; i < size; ++i) {
			  			graph.addRows([
			  			[data[i].domainName, Math.floor(data[i].dailyTime/60)]]);
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

				  var chart = new google.visualization.BarChart(document.getElementById('draw_graph'));
				  chart.draw(graph, options);
		
			  	},
			  	error: function(jqXHR, textStatus, errorThrown) {
			  		alert('Error: Overall stats: bar graph');
			  	}
			});
        }); 
	}
}


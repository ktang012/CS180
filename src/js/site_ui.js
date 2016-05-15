$(document).ready(function() {
    chrome.identity.getProfileUserInfo(function(data) {
        var userInfo = { 
            username: data.email
        };
        loadListedSites(userInfo);
    });
});

function loadListedSites(userInfo) {
    $.ajax({
        type: 'GET',
        url: 'https://desktab.me/ListedSite/GetListedSites',
        data: userInfo,
        success: function(listedSites, textStatus, jqXHR) {
            var newHtml = '';
            var timeCapForms = new Array();
            var timeCapButtons = new Array();
            var deleteButtons = new Array();
            var checkBoxes = new Array();

            var taskHtml = '';
            taskHtml += '<tr>';
            taskHtml += '<td> Status </td>';
            taskHtml += '<td> Domain Name </td>';
            taskHtml += '<td> Daily Time</td>';
            taskHtml += '<td> Time Cap</td>';
            taskHtml += '<td> Update</td>';
            taskHtml += '<td> Delete </td>';                
            taskHtml += '</tr>';
            
            newHtml += taskHtml;
            taskHtml = '';
            
            for (var i = 0; i < listedSites.length; ++i) {
                var listedSiteOwner = listedSites[i].owner;
                var listedSiteDomainName = listedSites[i].domainName;
                var listedSiteDailyTime = listedSites[i].dailyTime;
                var listedSiteBlockedTime = listedSites[i].blockedTime;
                var listedSiteIsBlocked = listedSites[i].isBlocked;
                var listedSiteTimeCap = listedSites[i].timeCap;

                // IMPORTANT: Since IDs in HTML cannot have '.', we replace it with '_'
                var timeCapFormID = 'timeCapForm_' + listedSiteDomainName.replace(/\./g, '_');              
                var timeCapButtonID = 'timeCapButton_' + listedSiteDomainName.replace(/\./g, '_');
                var deleteButtonID = 'deleteButton_' + listedSiteDomainName.replace(/\./g, '_');
                var checkBoxID = 'checkBox_' + listedSiteDomainName.replace(/\./g, '_');
                
                taskHtml += '<tr>';
                taskHtml += '<td> <input type="checkbox" id=' + checkBoxID + '> </td>';
                taskHtml += '<td id=' + listedSiteDomainName + '>' + listedSiteDomainName + '</td>';
                taskHtml += '<td>' + listedSiteDailyTime + '</td>';
                taskHtml += '<td><form id="'+ timeCapFormID;
                taskHtml += '"><input type="text" name="new_time" value="';
                taskHtml +=  listedSiteTimeCap + '"></input><form></td>';
                taskHtml += '<td><button id=' + timeCapButtonID + '>Update</button></td>';
                taskHtml += '<td><button id=' + deleteButtonID + '>Delete</button></td>';                
                taskHtml += '</tr>';
   
                timeCapForms.push(timeCapFormID);
                timeCapButtons.push(timeCapButtonID);
                deleteButtons.push(deleteButtonID);
                checkBoxes.push(checkBoxID);

                newHtml += taskHtml;
                taskHtml = '';
            }
            
            $('#sites_table').html(newHtml);
            
            
            // I'm so sorry for this code, please don't kill me
            for (var i = 0; i < timeCapForms.length && i < timeCapButtons.length && 
                 i < deleteButtons.length && i < checkBoxes.length; ++i) {
     
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
                                     isChecked, timeCapInput);
                });
                 
                $('#' + deleteButtons[i]).click(function() {
                    deleteListedSite(this.id.replace(/deleteButton_/g, '').replace(/_/g, '.'));
                });
                
            }
            
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(textStatus, errorThrown); 
        } 
    });
}

function updateListedSite(domainName, isBlocked, timeCap) {
    console.log(domainName, isBlocked, timeCap);
}

function deleteListedSite(domainName) {

}





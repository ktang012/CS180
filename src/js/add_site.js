$(document).ready(function() {
    // To send messages to content script you MUST use tabs.sendMessage!!
    // Get active and current tab, send message to content script
    
    // We want a slight delay such that the page is loaded before
    // our popup is loaded so we can register events properly
    // A better solution would be to listen to tracker.js and see
    // if the document is loaded
    setTimeout(function() {
        chrome.tabs.query({
                active: true,
                currentWindow: true
            },
            function(tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { from: 'add_site', method: 'getDomainName' },
                    outputDomain); // our responseCallback
            });
    }, 250);
});

function outputDomain(data) {
    $('#addSite').click(function() {
        addCurrentSite(data.domainName);
    });
}

function addCurrentSite(currentDomain) {
    chrome.identity.getProfileUserInfo(function(data) {
        var siteInfo = {
            username: data.email,
            domainName: currentDomain,
            timeCap: parseInt($('#minutes_input').val(), 10) // convert to int
        };
        
        // Check user input
        if (isNaN(siteInfo.timeCap)) {
            siteInfo.timeCap = 0;    
        }
        else {
            siteInfo.timeCap = siteInfo.timeCap * 60; // convert to seconds
        }

        $.ajax({
            type: 'POST',
            url: 'https://desktab.me/ListedSite/AddListedSite',
            data: siteInfo,
            success: function(data, textStatus, jqXHR) {
                // If we get a key error from server
                if (data.error) {
                    alert("You've added this site already!");
                }
                else {
                    var alertString = "Added the following site: " + currentDomain;
                    alert(alertString);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }
        });
    });
}

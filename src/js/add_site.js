$(document).ready(function() {
    // To send messages to content script you MUST use tabs.sendMessage!!
    // Get active and current tab, send message to content script
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
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus, errorThrown);
            }
        });
    });
}

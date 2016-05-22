$(document).ready(function() {
    // Set up listeners for messages
    
    // Sends the popup the domainName when the popup is loaded
    chrome.runtime.onMessage.addListener(function(message, sender, response) {
        // Verify if onMessage is from add_site and method
        // It should be sent when add_site is loaded
        if (message.from == 'add_site' && message.method == 'getDomainName') {
            var currentSite = {
                domainName: document.domain
            };
            response(currentSite);
        }
    });
    
    // Refreshes page when a site gets added so we can start tracking
    chrome.runtime.onMessage.addListener(function(message, sender, response) {
        // Verify if onMessage is from add_site and method
        // It should be sent when add_site is loaded
        if (message.from == 'add_site' && message.method == 'refreshPage') {
            location.reload();
        }
    });     
    
    chrome.storage.sync.get("username", function(data) {
        var userInfo = { username: data.username,
                         domainName: document.domain };
        
        
                                          
        var activityStatus = 0;
        $(document).mousemove(function(event) {
            console.log("lol");
        });
                         
        window.onbeforeunload = function() {
            windowClose(userInfo, activityStatus);
            //return false;
        };
        
        getListedSiteAndUpdate(userInfo);
        setInterval(function() {
            getListedSiteAndUpdate(userInfo);
        }, 1000);
    });
});

function windowClose(userInfo, u) {
    console.log("userInfo:", userInfo);
}

function idleUserDetection(idleStatus, idleTime) {
    $(this).mousemove(function(e) {
        var storedIdleTime = idleTime;
        idleTime = 0;
        idleStatus = false;
        // Get last updated ListedSite object R from server
        // Compare the two, update R on server according to current listedSite  
        // Resume sending requests to server
    });
    
    $(this).keypress(function(e) {
        var storedIdleTime = idleTime;
        idleTime = 0;
        idleStatus = false;
    });
}

function getListedSiteAndUpdate(userInfo) {
    $.ajax({
        type: 'GET',
        url: 'https://desktab.me/ListedSite/GetAListedSite',
        data: userInfo,
        success: function(site) {
            var listedSite = new ListedSite(site.owner, site.domainName,
                                            site.dailyTime, site.blockedTime,
                                            site.isBlocked, site.timeCap);
            if (!(listedSite.domainName === undefined || listedSite.owner === undefined)) {
                monitorSite(listedSite);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

// Called every second to update time on site and updating info in the database
function monitorSite(site) {
    site.checkTimeCap();
    if (!site.isBlocked) {
        var siteInfo = { username: site.owner,
                         domainName: site.domainName,
                         dailyTime: site.dailyTime };
        $.ajax({
            type: 'POST',
            url: 'https://desktab.me/ListedSite/IncrementAListedSite',
            data: siteInfo,
            success: function(data, textStatus, jqXHR) {
                site.dailyTime = data.dailyTime;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
    else if (site.isBlocked && site.blockedTime <= site.timeCap) {
        var siteInfo = { username: site.owner,
                         domainName: site.domainName,
                         dailyTime: site.dailyTime,
                         blockedTime: site.blockedTime };
        $.ajax({
            type: 'POST',
            url: 'https://desktab.me/ListedSite/IncrementABlockedSite',
            data: siteInfo,
            success: function (data, textStatus, jqXHR) {
                site.dailyTime = data.dailyTime;
                site.blockedTime = data.blockedTime;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

// Blocks a site by redirecting user to a HTML page
function blockSite() {
    var htmlPath = chrome.extension.getURL('src/blocked.html');
    document.location = htmlPath;
    $(body).html(html);
}

// ListedSite and SiteTimeHistory objects (or similar objects) should be used in the 
// UI of the extension for consistency
function ListedSite(owner, domainName, dailyTime, blockedTime, isBlocked, timeCap) {
    this.owner = owner;
    this.domainName = domainName;
    this.dailyTime = dailyTime;
    this.blockedTime = blockedTime;
    this.isBlocked = isBlocked;
    this.timeCap = timeCap;
    
    this.checkTimeCap = function() {
        if (this.isBlocked && this.blockedTime >= this.timeCap) {
            blockSite();
        }
    };
}

// dailyTimeHistory an array of integers (seconds) of maximum size X
// dailyTimeHistory[0] gets yesterday's dailyTime
// dailyTimeHistory[1] gets the day before yesterday's dailyTime, etc...
function SiteTimeHistory(owner, domainName, dailyTimeHistory) {
    this.owner = owner;
    this.domainName = domainName;
    this.dailyTimeHistory = dailyTimeHistory

    // Some helper functions for manipulating data
    this.getTotalDailyTime = function() {
        var totalTime = 0;
        for (var i = 0; i < this.dailyTimeHistory.length; ++i) {
            totalTime += this.dailyTimeHistory[i];
        }
        return totalTime;
    };
    
    this.getNAverageDailyTime = function(n) {
        if (n > this.dailyTimeHistory.length) {
            n = this.dailyTimeHistory.length;
        }
        var totalTime = 0;
        for (var i = 0; i < n; ++i) {
            totalTime += this.dailyTimeHistory[i];
        }
        return (totalTime / n);
    
    };
}




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
    
    chrome.storage.sync.get("username", function(data) {
        var userInfo = { username: data.username,
                         domainName: document.domain };
        
        if (userInfo.username == '' || userInfo.username == undefined || 
            userInfo.username == null) {    
            return;
        }
      
        var idleConstant = 180; // User is idle after three minutes of no activity         
        var idleCounter = 0;
        var nowIdle = false;
        
        // When there's an activity, check if user is considered idle
        // If the user resumes activity, we update our site object on the server
        // And go back to using the server
        $(document).on('mousemove keypress', function(event) {
            if (idleCounter >= idleConstant) {
                sendUpdatesToServer();
            }
            idleCounter = 0;
        });
        
        // When we first become idle, set flag to grab most recent listed site object
        // After or before we're considered idle, set it back
        setInterval(function() {
            ++idleCounter;
            if (idleCounter == idleConstant) {
                nowIdle = true;
            }
            else if (nowIdle) {
                nowIdle = false;
            }   
        }, 1050);
        
        
        // In the event the user closes the window/tab, send most recent
        // client based listed site object to server IF idle
        $(window).on('beforeunload', function() {
            sendUpdatesToServer();
        });
        
        pickTrackingMethod(userInfo, idleCounter, idleConstant, nowIdle);
        setInterval(function() {
            pickTrackingMethod(userInfo, idleCounter, idleConstant, nowIdle);
        }, 1000);
    });
});

function sendUpdatesToServer() {
    var listedSite = sessionGetListedSite();
    if (!(listedSite.owner === null || listedSite.owner === undefined ||
        listedSite.domainName === null || listedSite.domainName === undefined)) {
        var siteInfo = { username: listedSite.owner,
                         domainName: listedSite.domainName,
                         idleTime: listedSite.idleTime };
        $.ajax({
            type: 'POST',
            async: false,
            url: 'https://desktab.me/ListedSite/UpdateIdleTime',
            data: siteInfo
        });
    }
}

function pickTrackingMethod(userInfo, idleCounter, idleConstant, nowIdle) {
    if (idleCounter <= idleConstant && !nowIdle) {
        // User is considered active
        serverGetListedSiteAndUpdate(userInfo);
    }
    else {
        // User is considered idle
        if (nowIdle) { // Must always execute this first
            clientFetchMostRecentListedSite(userInfo);
        }
        else {
            clientGetListedSiteAndUpdate();
        }
    }
}

// Client API methods
// Probably don't need to store all this, but more can be done
// in the future with these methods
function sessionSetListedSite(site) {
    sessionStorage.setItem('owner', site.owner);
    sessionStorage.setItem('domainName', site.domainName);
    sessionStorage.setItem('dailyTime', site.dailyTime);
    sessionStorage.setItem('blockedTime', site.blockedTime);
    sessionStorage.setItem('isBlocked', site.isBlocked);
    sessionStorage.setItem('timeCap', site.timeCap);
    sessionStorage.setItem('idleTime', site.idleTime);
}

function sessionGetListedSite() {
    var owner = sessionStorage.getItem('owner');
    var domainName = sessionStorage.getItem('domainName');
    var dailyTime = parseInt(sessionStorage.getItem('dailyTime'), 10);
    var blockedTime = parseInt(sessionStorage.getItem('blockedTime'), 10);
    
    var isBlocked = (sessionStorage.getItem('isBlocked'));
    if (isBlocked == '1') {
        isBlocked = 1;
    }
    else {
        isBlocked = 0;
    }
    
    var timeCap = parseInt(sessionStorage.getItem('timeCap'), 10);
    var idleTime = parseInt(sessionStorage.getItem('idleTime'), 10);
    
    var listedSite = new ListedSite(owner, domainName, dailyTime, 
                                    blockedTime, isBlocked, timeCap, idleTime);
    return listedSite;
}

// Client methods -- used when user is idle
function clientFetchMostRecentListedSite(userInfo) {
    $.ajax({
        type: 'GET',
        url: 'https://desktab.me/ListedSite/GetAListedSite',
        data: userInfo,
        success: function(site) {
            if (!(site.domainName === null || site.owner === null ||
                  site.domainName === undefined || site.owner === undefined)) {
                // console.log("ClientFetch:", site);
                sessionSetListedSite(site);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

function clientGetListedSiteAndUpdate() {
    var listedSite = sessionGetListedSite();
    if (!(listedSite.owner === null || listedSite.domainName === null ||
          listedSite.owner === undefined || listedSite.domainName === undefined)) {
        listedSite.checkTimeCap();
        listedSite.idleTime += 1;
        // console.log("ClientGet:", listedSite);
        sessionSetListedSite(listedSite);
    }
}

// Server methods
function serverGetListedSiteAndUpdate(userInfo, idleCounter) {
    $.ajax({
        type: 'GET',
        url: 'https://desktab.me/ListedSite/GetAListedSite',
        data: userInfo,
        success: function(site) {
            var listedSite = new ListedSite(site.owner, site.domainName,
                                            site.dailyTime, site.blockedTime,
                                            site.isBlocked, site.timeCap, site.idleTime);
            if (!(listedSite.domainName === null || listedSite.owner === null ||
                  listedSite.domainName === undefined || listedSite.owner === undefined)) {
                // console.log("ServerGet:", listedSite);
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

// Object used in sessionStorage and HTTP requests
function ListedSite(owner, domainName, dailyTime, blockedTime, isBlocked, 
                    timeCap, idleTime) {
    this.owner = owner;
    this.domainName = domainName;
    this.dailyTime = dailyTime;
    this.blockedTime = blockedTime;
    this.isBlocked = isBlocked;
    this.timeCap = timeCap;
    this.idleTime = idleTime;
    
    this.checkTimeCap = function() {
        if (this.isBlocked && this.blockedTime >= this.timeCap) {
            blockSite();
        }
    };
}

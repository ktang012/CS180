/*
    Overview:
        ListedSite objects are used to track and block sites accordingly.
        SiteTimeHistory objects are used to represent a ListedSite object's
        history.
        
    ListedSite object:
        A ListedSite object contains all the information needed to monitor
        a site the user has listed.
        owner is the user that owns the ListedSite.
        domainName is the domain name of the site to be tracked/blocked.
        dailyTime is the elapsed time spent on a site, in seconds, for the day.
        isBlocked distinguished blocked sites from tracked sites. We block blocked sites.
        timeCap is the amount of time, in seconds, a user can spend on the site before it
        gets blocked.
        
    Getting a ListedSite:
        We first send our current domain name to our server, the server will
        see if the domain name is listed for that user. If it is, the server
        will reply with the corresponding ListedSite object.
        
    Monitoring a ListedSite:
        Every minute we will update our fields accordingly and then sending a
        request to the server to do the same. If the request is NOT successful, we
        will not keep any changes on the changes on our client. If a site is a blocked site,
        the site will be blocked when dailyTime >= timeCap.
        
    ListedSite objects in MySQL:
        A user can own multiple or none ListedSite objects. The objects will be identified by
        their owner, and domain name. Each ListedSite object is associated with a
        SiteTimeHistory object. In addition, ListedSite.dailyTime will be set to 0 every 24
        hours, see SiteTimeHistory for more details.
    
    SiteTimeHistory object:
        Similar to a ListedSite object,  but keeps track of the history of ListedSite objects.
        It is for the most part a static object rather than a dynamic object which makes
        the interface much more easier to use without having to account for uncalled changes
        when using this object. SiteTimeHistory objects should be immutable in the frontend.
        
    SiteTimeHistory objects in MySQL:
        SiteTimeHistory objects will be updated only in the MySQL server. Every 24 hours,
        every SiteTimeHistory.dailyHistoryTime and ListedSite.dailyTime
        will be updated as the following:
            dailyHistoryTime[X] = dailyHistoryTime[X-1]
            dailyHistoryTime[X-1] = dailyHistoryTime[X-2]
            ......
            dailyHistoryTIme[1] = dailyHistoryTime[0]
            dailyHistoryTime[0] = listedSiteObject.dailyTime
            listedSiteObject.dailyTime = 0
*/

$(document).ready(function() {
    console.log("Hello world");
    chrome.storage.sync.get("username", function(data) {
        var userInfo = { username: data.username,
                         domainName: document.domain };
        console.log(userInfo.username, "is on", userInfo.domainName);
        $.ajax({
            type: 'GET',
            url: 'https://desktab.me/ListedSite/GetAListedSite',
            data: userInfo,
            success: function(site) {
                var listedSite = new ListedSite(site.owner, site.domainName, 
                                                site.dailyTime, site.isBlocked, 
                                                site.timeCap);
                if (!(listedSite.domainName === undefined || listedSite.owner === undefined)) {
                    console.log("Begin monitoring", listedSite.domainName);
                    setInterval(function() {
                        monitorSite(listedSite);
                    }, 1000); // Sends POST every second
                    listedSite.checkTimeCap();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
       });
    });
});

// Called every second to update time on site and updating info in the database
function monitorSite(site) {
    site.checkTimeCap();
    if (site.dailyTime < site.timeCap) {
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
}

// Blocks a site by redirecting user to a HTML page
function blockSite() {
    var htmlPath = chrome.extension.getURL('src/test.html');
    console.log("Attempting to block site using", htmlPath);
    document.location = htmlPath;
    $(body).html(html);
}

function ListedSite(owner, domainName, dailyTime, isBlocked, timeCap) {
    this.owner = owner;
    this.domainName = domainName;
    this.dailyTime = dailyTime;
    this.isBlocked = isBlocked;
    this.timeCap = timeCap;
    
    this.checkTimeCap = function() {
        if (this.isBlocked && this.dailyTime >= this.timeCap) {
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




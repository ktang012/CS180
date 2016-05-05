/*
    Overview:
        ListedSite objects are used to track and block sites accordingly.
        
    ListedSite object:
        A ListedSite object contains all the information needed to monitor
        a site the user has listed.
        
        owner is the user that owns the ListedSite.
        
        domainName is the domain name of the site to be tracked/blocked.
        
        dailyTime is the elapsed time spent on a site, in minutes, for the day.
        
        isBlocked distinguished blocked sites from tracked sites. We block blocked sites.
        
        timeCap is the amount of time, in minutes, a user can spend on the site before it
        gets blocked.
        
    Getting the listed site:
        We first send our current domain name to our server, the server will
        see if the domain name is listed for that user. If it is, the server
        will reply with the corresponding ListedSite object.
        
    Monitoring the listed site:
        Every minute we will update our fields accordingly and then sending a
        request to the server to do the same. If the request is NOT successful, we
        will not keep any changes on the changes on our client. If a site is a blocked site,
        the site will be blocked when dailyTime >= timeCap.
        
    ListedSite objects in MySQL:
        A user can own multiple or none ListedSite objects. The objects will be identified by
        their owner, and domain name. Each ListedSite object is associated with seven
        SiteTimeHistory. 
    
*/


// Need to configure apache server to have SSL for secure endpoints
// to support HTTPS sites
$(document).ready(function() {
    chrome.storage.sync.get("username", function(data) {
        var user = { username: data.username,
                     domainName: document.domain };
        console.log(user.username, "is on", user.domainName);
        $.ajax({
            type: 'GET',
            url: 'http://cs180.no-ip.info/ListedSite/GetAListedSite',
            data: user,
            success: function(site) {
                var listedSite = new ListedSite(site.owner, site.domainName, 
                                                site.dailyTime, site.isBlocked, 
                                                site.timeCap);
                if (!(listedSite.domainName === undefined || listedSite.owner === undefined)) {
                    console.log("Begin monitoring", listedSite.domainName);
                    setInterval(function() {
                        monitorSite(listedSite);
                    }, 500);
                    listedSite.checkTimeCap();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
       });
    });
});

// Called every minute to update time on site and updating info in the database
// Currently just testing blocking and tracking without API calls
function monitorSite(site) {
    site.checkTimeCap();
    if (site.dailyTime < site.timeCap) {
        $.ajax({
            type: 'PUT',
            url: 'http://cs180.no-ip.info/ListedSite/IncrementAListedSite',
            data: site,
            success: function(updatedSite) {
                site.dailyTime = updatedSite.dailyTime;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

// How to block site?
// Currently redirects you to facebook if you exceed your time
function blockSite() {
    console.log("BLOCKING SITE");
    window.location.replace("https://www.facebook.com");
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

function SiteTimeHistory(owner, domainName, weekPeriodTime) {


}







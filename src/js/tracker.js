/*
    Overview:
        ListedSite objects are used to track and block sites accordingly.
        
    ListedSite object:
        A ListedSite object contains all the information needed to monitor
        a site the user has listed.
        
        The siteId is used to perform validation with SiteTimeHistory, more on this
        later. May just drop this for domainName.
        
        The domaiNname is the domain name of the site to be tracked/blocked.
        
        dailyTime is the elapsed time spent on a site, in minutes, for the day.
        
        weeklyTime is the elapsed time spent on a site, in minutes, for the week.
        
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
        will not "commit" the changes on our client. If a site is a blocked site,
        the site will be blocked when dailyTime === timeCap.
        
    ListedSite objects in MySQL:
        
    
*/

$(document).ready(function() {
    console.log("Currently on: ", document.domain);
    var listedSite = getListedSite();
    if (!(listedSite === undefined || listedSite === null)) {
        setInterval(function() {
            monitorSite(listedSite);
            }, 500);
        listedSite.checkTimeCap();
    }
});

// Called every minute to update time on site and updating info in the database
function monitorSite(site) {
    site.checkTimeCap();
    if (site.dailyTime < site.timeCap) {
        // Can update info
    }
}

// How to block site?
function blockSite() {
    console.log("BLOCKED SITE");

}

// Asks the server to verify if the site we're on is a listed site for the user
function getListedSite() {
    var currentDomain = document.domain;
    
    // Send ajax(currentDomain) ==> return (ListedSite object or nothing)
    
    var testSite = new ListedSite(1, "www.reddit.com", 25, 50, true, 30);
    return testSite;
}

function ListedSite(siteId, domainName, dailyTime, weeklyTime, isBlocked, timeCap) {
    this.siteId = siteId;
    this.domainName = domainName;
    this.dailyTime = dailyTime;
    this.weeklyTime = weeklyTime;
    this.isBlocked = isBlocked;
    this.timeCap = timeCap;
    
    this.checkTimeCap = function() {
        if (this.isBlocked && this.dailyTime >= this.timeCap) {
            blockSite();
        }
    };
}

function SiteTimeHistory(siteId, weekPeriodTime) {


}







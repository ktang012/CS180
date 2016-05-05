BEGIN

SELECT owner, domainName, dailyTime, isBlocked, timeCap
FROM ListedSite L, User U
WHERE L.owner = p_username AND U.username = p_username AND L.domainName = p_domainName;

END
